import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from .llm_factory import get_default_llm

def process_request_with_llm_stream(request_data, llm):
    """Process a single request file using LLM and yield results per sheet group in parallel"""
    
    source_data = request_data.get('source', {})
    target_data = request_data.get('target', {})
    
    # Group target mappings by Standard_SheetName
    sheet_groups = {}
    for mapping in target_data.get('mappings', []):
        sheet_name = mapping.get('Standard_SheetName', 'Unknown')
        if sheet_name not in sheet_groups:
            sheet_groups[sheet_name] = {}
        sheet_groups[sheet_name][mapping.get('Standard_ColumnName')] = mapping
    
    # Process sheet groups concurrently
    # Use max_workers=5 to avoid hitting rate limits too hard while getting speedup
    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_sheet = {
            executor.submit(_process_single_sheet_task, sheet_name, sheet_mappings_dict, source_data, llm): sheet_name
            for sheet_name, sheet_mappings_dict in sheet_groups.items()
        }
        
        for future in as_completed(future_to_sheet):
            sheet_name = future_to_sheet[future]
            try:
                sheet_result = future.result()
                if sheet_result:
                    yield sheet_result
            except Exception as e:
                print(f"    ❌ Critical error in thread for sheet {sheet_name}: {e}")
                # Yield error placeholders as fallback
                yield _generate_placeholders(sheet_name, sheet_groups[sheet_name], str(e))

def _process_single_sheet_task(sheet_name, sheet_mappings_dict, source_data, llm):
    """Helper function to process a single sheet group (runs in thread)"""
    sheet_mappings = list(sheet_mappings_dict.values())
    print(f"  📋 Processing sheet: {sheet_name} ({len(sheet_mappings)} columns)")
    
    # Optimization: Filter Source Data
    source_sheets = source_data.get('sheets', {})
    matching_source_sheets = []
    
    for src_sheet in source_sheets.keys():
        # Check if standard sheet name is part of source sheet name (case-insensitive)
        if sheet_name.lower() in src_sheet.lower():
            matching_source_sheets.append(src_sheet)
    
    filtered_source_data = source_data
    if matching_source_sheets:
        print(f"    🔍 Optimization: Found matching source sheets: {matching_source_sheets}")
        filtered_source_data = {
            "description": source_data.get("description", ""),
            "sheets": {k: v for k, v in source_sheets.items() if k in matching_source_sheets}
        }
    else:
         print(f"    ⚠️ No direct sheet match found for '{sheet_name}', using all source sheets.")

    # Create prompt for this sheet group
    prompt = create_sheet_group_prompt(filtered_source_data, sheet_name, sheet_mappings)
    
    max_attempts = 3
    last_error = None
    
    for attempt in range(1, max_attempts + 1):
        try:
            response = llm.invoke(prompt)
            sheet_result = parse_llm_response(response, sheet_mappings_dict)
            
            if sheet_result:
                print(f"    ✅ Generated {len(sheet_result)} mappings for {sheet_name}")
                return sheet_result
            
            if attempt < max_attempts:
                print(f"    ⚠️ Parse failed (attempt {attempt}/{max_attempts}) for {sheet_name}, retrying...")
        except Exception as e:
            last_error = str(e)
            if attempt < max_attempts:
                print(f"    ⚠️ Error processing sheet {sheet_name}: {e}, retrying...")
    
    print(f"    ❌ Failed to process sheet {sheet_name}. Returning placeholders.")
    return _generate_placeholders(sheet_name, sheet_mappings_dict, last_error)

def _generate_placeholders(sheet_name, sheet_mappings_dict, error_msg):
    """Generate empty placeholder mappings when LLM fails"""
    placeholders = []
    for col_name, original in sheet_mappings_dict.items():
         placeholders.append({
            "Source_ColumnName": "",
            "Source_SheetName": "",
            "Standard_ColumnName": col_name,
            "Standard_SheetName": sheet_name,
            "信息类型": original.get("信息类型", ""),
            "备注": original.get("备注", ""),
            "Confidence": 0.0,
            "Rationale": f"Processing failed: {error_msg}"
         })
    return placeholders

def create_sheet_group_prompt(source_data, sheet_name, sheet_mappings):
    """Create focused prompt for a specific target sheet group"""
    
    prompt_sections = []
    
    # 1. Task Instructions
    prompt_sections.append(TASK_INSTRUCTIONS)
    
    # 2. Sheet Context
    sheet_context = build_sheet_context(source_data)
    prompt_sections.append(f"## Sheet Context\n\n{sheet_context}")
    
    # 3. Source Data Summary
    source_summary = build_source_summary(source_data)
    prompt_sections.append(f"## Source Data Structure\n\n{source_summary}")
    
    # 4. Target Schema for this specific sheet
    target_schema = build_sheet_target_schema(sheet_name, sheet_mappings)
    prompt_sections.append(f"## Standard Schema for Sheet: {sheet_name}\n\n{target_schema}")
    
    # 5. Column Hints
    column_hints = build_column_hints()
    prompt_sections.append(f"## Column Mapping Hints\n\n{column_hints}")
    
    # 6. Output Format Schema
    output_format = OUTPUT_FORMAT_SCHEMA
    prompt_sections.append(f"## Required Output Format\n\n{output_format}")
    
    # 7. Examples
    examples = MAPPING_EXAMPLES
    prompt_sections.append(f"## Mapping Examples\n\n{examples}")
    
    return "\n\n".join(prompt_sections)

def build_sheet_context(source_data):
    """Build business context for each sheet"""
    context = []
    context.append("Business meaning of source sheets:")
    
    sheet_meanings = {
        "AE": "Adverse Events - Records of any adverse medical events occurring during the study",
        "DA1": "Drug Administration - Records of drug exposure and administration details",
        "DM": "Demographics - Subject demographics and basic study information",
        "EX": "Exposure - Drug exposure information and administration details",
        "CM": "Concomitant Medications - Other medications taken during the study",
        "MH": "Medical History - Subject's pre-existing medical conditions",
        "VS": "Vital Signs - Measurements of basic body functions",
        "LB": "Laboratory - Clinical laboratory test results"
    }
    
    for sheet_name in source_data.get('sheets', {}).keys():
        meaning = sheet_meanings.get(sheet_name, f"{sheet_name} - Study data sheet")
        context.append(f"- **{sheet_name}**: {meaning}")
    
    return "\n".join(context)

def build_source_summary(source_data):
    """Build formatted source data summary"""
    summary = []
    summary.append("Available source sheets and their columns:")
    
    for sheet_name, sheet_info in source_data.get('sheets', {}).items():
        summary.append(f"\n### Sheet: {sheet_name}")
        summary.append(f"Row Count: {sheet_info.get('row_count', 'N/A')}")
        summary.append("Columns:")
        
        for col_info in sheet_info.get('columns', []):
            col_name = col_info.get('name', '')
            sample_vals = col_info.get('sample_values', [])
            data_type = col_info.get('data_type', 'unknown')
            
            # Format sample values
            if sample_vals:
                sample_str = ', '.join(str(v) for v in sample_vals[:3])
                if len(sample_vals) > 3:
                    sample_str += f", ... ({len(sample_vals)} total)"
            else:
                sample_str = "No data"
            
            summary.append(f"  - `{col_name}` ({data_type}): {sample_str}")
    
    return "\n".join(summary)

def build_sheet_target_schema(sheet_name, sheet_mappings):
    """Build target schema for a specific sheet"""
    schema = [f"Target columns for sheet {sheet_name}:"]
    
    for mapping in sheet_mappings:
        std_col = mapping.get('Standard_ColumnName', '')
        info_type = mapping.get('信息类型', '')
        note = mapping.get('备注', '')
        
        schema.append(f"- **{std_col}**")
        if info_type:
            schema.append(f"  - Type: {info_type}")
        if note:
            schema.append(f"  - Note: {note}")
    
    return "\n".join(schema)

def build_column_hints():
    """Build semantic mapping hints between source and target columns"""
    hints = []
    hints.append("Semantic mapping hints to help with column matching:")
    
    # Common Chinese-English mappings
    common_mappings = {
        "受试者编号": "Subject ID",
        "项目编号": "Project ID", 
        "不良事件": "Adverse Event",
        "开始日期": "Start Date",
        "结束日期": "End Date",
        "给药": "Drug Administration",
        "剂量": "Dose",
        "严重性": "Severity",
        "转归": "Outcome",
        "因果关系": "Causality",
        "措施": "Action"
    }
    
    hints.append("\n### Common Chinese-English Term Mappings:")
    for chinese, english in common_mappings.items():
        hints.append(f"- {chinese} → {english}")
    
    # Abbreviation hints
    hints.append("\n### Common Abbreviations:")
    abbr_hints = {
        "AE": "Adverse Event",
        "SAE": "Serious Adverse Event", 
        "DM": "Demographics",
        "EX": "Exposure",
        "DAT": "Date",
        "SER": "Serious",
        "TERM": "Terminology",
        "ACN": "Action",
        "REL": "Relationship"
    }
    
    for abbr, full in abbr_hints.items():
        hints.append(f"- {abbr} → {full}")
    
    # Date/Time patterns
    hints.append("\n### Date/Time Column Patterns:")
    hints.append("- Columns containing '日期' or 'DAT' are typically date fields")
    hints.append("- Columns containing '时间' or 'TIM' are typically time fields")
    hints.append("- Columns with (AESTDAT, AEENDAT) pattern are start/end dates")
    
    # Code vs Description patterns
    hints.append("\n### Code vs Description Patterns:")
    hints.append("- Columns ending with '_CD' or '编码' are typically code values")
    hints.append("- Columns without codes are typically descriptions/text")
    
    return "\n".join(hints)

def parse_llm_response(response, sheet_mappings_dict):
    """Parse LLM response and validate against schema"""
    try:
        # Handle langchain response format
        response_content = response.content if hasattr(response, 'content') else str(response)
        
        # Try to extract JSON from response
        import re
        json_match = re.search(r'```json\s*([\s\S]*?)\s*```', response_content)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to parse the whole response as JSON
            json_str = response_content.strip()
        
        parsed_response = json.loads(json_str)
        
        # Extract mappings
        mappings = parsed_response.get('mappings', [])
        
# Validate and enrich each mapping
        best_by_standard = {}
        covered_standard_cols = set()
        for mapping in mappings:
            source_col = mapping.get("Source_ColumnName")
            source_sheet = mapping.get("Source_SheetName")
            standard_col = mapping.get("Standard_ColumnName")
            standard_sheet = mapping.get("Standard_SheetName")

            # Get original mapping data (keyed by Standard_ColumnName)
            original_data = sheet_mappings_dict.get(standard_col, {})

            if standard_col:
                covered_standard_cols.add(standard_col)

            conf_raw = mapping.get("Confidence", 0.0)
            try:
                conf = float(conf_raw)
            except Exception:
                conf = 0.0

            resolved_standard_sheet = standard_sheet or original_data.get("Standard_SheetName", "")

            # Blank source info if confidence is below threshold
            if conf < 0.8:
                source_col = ""
                source_sheet = ""

            candidate = {
                "Source_ColumnName": source_col,
                "Source_SheetName": source_sheet,
                "Standard_ColumnName": standard_col,
                "Standard_SheetName": resolved_standard_sheet,
                "信息类型": original_data.get("信息类型", ""),
                "备注": original_data.get("备注", ""),
                "Confidence": conf,
                "Rationale": mapping.get("Rationale", "")
            }

            key = (resolved_standard_sheet, standard_col)
            
            # STRICT FILTER: Ignore mappings for columns we didn't ask for (Safety Net)
            if standard_col not in sheet_mappings_dict:
                continue
                
            current_best = best_by_standard.get(key)
            if current_best is None or conf > current_best.get("Confidence", 0.0):
                best_by_standard[key] = candidate

        validated_mappings = list(best_by_standard.values())

        # Ensure all standard columns are present even if LLM missed them
        missing_standards = set(sheet_mappings_dict.keys()) - covered_standard_cols
        for std_col in missing_standards:
            original_data = sheet_mappings_dict.get(std_col, {})
            validated_mappings.append({
                "Source_ColumnName": "",
                "Source_SheetName": "",
                "Standard_ColumnName": std_col,
                "Standard_SheetName": original_data.get("Standard_SheetName", ""),
                "信息类型": original_data.get("信息类型", ""),
                "备注": original_data.get("备注", ""),
                "Confidence": 0.0,
                "Rationale": "LLM未找到匹配，保留占位"
            })
        
        return validated_mappings
        
    except Exception as e:
        # Log raw content to debug malformed responses
        preview = response_content[:500].replace("\n", "\\n")
        print(f"Error parsing LLM response: {e} | preview: {preview}")
        return []

# Constants for prompt sections
TASK_INSTRUCTIONS = """# Column Mapping Task

You are a clinical data mapping expert. Your task is to map source data columns to standard schema columns for a clinical trial data integration project.

## Your Mission

For each standard column in the standard schema, find the best matching source column from the source data. Consider:
1. **Semantic similarity** - What the column represents
2. **Data type compatibility** - Can the data be converted?
3. **Business context** - Clinical trial domain knowledge
4. **Naming patterns** - Chinese names, English abbreviations, codes

## Mapping Rules

1. **One-to-One Mapping**: Each target column should map to exactly one source column
2. **Best Fit**: Choose the most semantically similar source column
3. **Data type Consideration**: Ensure data types are compatible
4. **Business Logic**: Apply clinical trial domain knowledge
5. **Sheet Context**: Consider which source sheet contains the relevant data
6. **No Duplication**: Don't map multiple target columns to the same source column unless justified
7. **Keep it brief**: Rationale must be <=120 characters and factual
8. **Strict format**: Return JSON only, no markdown/code fences, do not include extra text

## Output Requirements

- Return a JSON array of mapping objects
- Each mapping must include all required fields
- Include confidence scores (0.0-1.0)
- Provide clear mapping rationale
- Follow the exact JSON schema provided below"""

OUTPUT_FORMAT_SCHEMA = """```json
{
  "mappings": [
    {
      "Source_ColumnName": "string (required) - Source column name from source data",
      "Source_SheetName": "string (required) - Source sheet name from source data", 
      "Standard_ColumnName": "string (required) - Standard column name from schema",
      "Standard_SheetName": "string (required) - Standard sheet name from schema",
      "Confidence": "number (0.0-1.0) - How confident you are in this mapping",
      "Rationale": "string - Mapping explanation in Chinese"
    }
  ]
}
```

**Important**: 
- **STRICTLY** output only the mappings for the target columns provided in the "Standard Schema". 
- **DO NOT** invent or add any extra columns that are not in the Standard Schema.
- All target columns from the schema must be included in the output
- Confidence scores should reflect how certain you are about the mapping
- Rationale should explain your reasoning using the provided hints and context"""

MAPPING_EXAMPLES = """### 示例1: 高置信度映射
```json
{
  "Source_ColumnName": "开始日期(AESTDAT)",
  "Source_SheetName": "AE",
  "Standard_ColumnName": "AE_ONSET_DATE",
  "Standard_SheetName": "AE",
  "信息类型": "基本信息",
  "备注": "AE开始日期",
  "Confidence": 0.95,
  "Rationale": "直接语义匹配 - 都代表不良事件开始日期。中文名称'开始日期'明确表示开始日期，'AESTDAT'是不良事件开始日期的标准缩写。"
}
```

### 示例2: 缩写映射  
```json
{
  "Source_ColumnName": "受试者编号", 
  "Source_SheetName": "AE",
  "Standard_ColumnName": "SUBJECT",
  "Standard_SheetName": "AE",
  "信息类型": "基本信息",
  "备注": "AE对应的受试者ID",
  "Confidence": 0.90,
  "Rationale": "中文'受试者编号'翻译为'Subject ID/Number'，符合临床试验中SUBJECT字段的标准。"
}
```

### 示例3: 上下文映射
```json
{
  "Source_ColumnName": "最高级别（CTCAE 5.0）(AEHCTCAE)",
  "Source_SheetName": "AE", 
  "Standard_ColumnName": "SEVERITY",
  "Standard_SheetName": "AE",
  "信息类型": "基本信息",
  "备注": "严重性分级",
  "Confidence": 0.85,
  "Rationale": "源列代表'最高级别（CTCAE 5.0）'，是不良事件的严重性分级。上下文和AEHCTCAE缩写确认这是严重性数据。"
}
```"""
