from sqlalchemy.orm import Session
from .. import models
from . import process_mappings_with_llm
from .llm_factory import get_default_llm
from fastapi import HTTPException
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def generate_ai_mapping_stream(db: Session, dataset_id: int, framework_id: int):
    """
    Generate mappings using LLM for a given dataset and framework (Streaming Version).
    Yields chunks of generated mappings as they are processed.
    """
    
    # 1. Fetch Data
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    framework = db.query(models.Framework).filter(models.Framework.id == framework_id).first()

    if not dataset or not framework:
        yield {"type": "error", "message": "Dataset or Framework not found"}
        return

    print(f"Generating AI Mapping Stream for Dataset: {dataset.name} -> Framework: {framework.name}")

    # 2. Build Request Data
    # 2a. Source Summary
    sheets_summary = {}
    
    for sheet in dataset.sheets:
        sample_rows = db.query(models.DatasetRow).filter(models.DatasetRow.sheet_id == sheet.id).limit(5).all()
        
        columns_info = []
        if sample_rows:
            first_row = sample_rows[0]
            if first_row and first_row.data:
                headers = list(first_row.data.keys())
                
                for header in headers:
                    samples = []
                    for row in sample_rows:
                        if row.data:
                            val = row.data.get(header)
                            if val is not None:
                                samples.append(str(val))
                    
                    columns_info.append({
                        "name": header,
                        "sample_values": samples[:3],
                        "data_type": "string"
                    })

        sheets_summary[sheet.name] = {
            "description": f"Sheet {sheet.name}",
            "row_count": "Unknown",
            "columns": columns_info
        }
    
    source_summary = {
        "description": f"Source data from {dataset.name}",
        "sheets": sheets_summary
    }

    # 2b. Target Schema
    target_mappings = []
    for sheet in framework.sheets:
        target_mappings.append({
            "Standard_ColumnName": sheet.standard_column_name,
            "Standard_SheetName": sheet.standard_sheet_name,
            "信息类型": sheet.info_type,
            "备注": sheet.note
        })
    
    target_schema = {
        "description": f"Target schema: {framework.name}",
        "total_mappings": len(target_mappings),
        "mappings": target_mappings
    }

    request_data = {
        "source": source_summary,
        "target": target_schema
    }

    # 3. Create Mapping Record Immediately
    new_mapping = models.Mapping(
        dataset_id=dataset_id,
        framework_id=framework_id
    )
    db.add(new_mapping)
    db.commit()
    db.refresh(new_mapping)
    
    # Yield Start Event
    yield {
        "type": "start", 
        "mapping_id": new_mapping.id, 
        "total_sheets": len(framework.sheets),
        "message": "Mapping session started"
    }

    # 4. Call LLM Stream
    logger.info("Starting LLM stream...")
    llm = get_default_llm()
    
    try:
        # Use the streaming version we just added
        for chunk in process_mappings_with_llm.process_request_with_llm_stream(request_data, llm):
            entries_to_add = []
            frontend_entries = []
            
            for m in chunk:
                # Extract fields
                source_sheet = m.get('Source_SheetName', '')
                source_col = m.get('Source_ColumnName', '')
                std_sheet = m.get('Standard_SheetName', '')
                std_col = m.get('Standard_ColumnName', '')
                info_type = m.get('信息类型')
                note = m.get('备注')
                conf = m.get('Confidence')
                rationale = m.get('Rationale')

                entry = models.MappingEntry(
                    mapping_id=new_mapping.id,
                    source_sheet_name=source_sheet,
                    source_column_name=source_col,
                    standard_sheet_name=std_sheet,
                    standard_column_name=std_col,
                    info_type=info_type,
                    note=note,
                    confidence=conf,
                    rationale=rationale
                )
                entries_to_add.append(entry)
                
                frontend_entries.append({
                    "source_sheet_name": source_sheet,
                    "source_column_name": source_col,
                    "standard_sheet_name": std_sheet,
                    "standard_column_name": std_col,
                    "info_type": info_type,
                    "note": note,
                    "confidence": conf,
                    "rationale": rationale
                })

            # Save batch to DB
            if entries_to_add:
                db.bulk_save_objects(entries_to_add)
                db.commit()
            
            # Yield Data Event
            yield {
                "type": "data",
                "entries": frontend_entries
            }
            
        yield {"type": "done", "status": "success"}
        
    except Exception as e:
        logger.error(f"Streaming failed: {e}")
        yield {"type": "error", "message": str(e)}


