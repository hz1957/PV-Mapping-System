// 预定义的字段映射关系
export interface PredefinedMapping {
  sourceSheetName: string;
  sourceColumnName: string;
  standardSheetName: string;
  standardColumnName: string;
  infoType: string;
  note: string;
  confidence: number;
  rationale: string;
}

// CDISC SDTM 标准的预定义映射（基于实际数据）
export const cdiscMappings: PredefinedMapping[] = [
  // AE表映射
  { sourceSheetName: 'ae', sourceColumnName: 'AEACN_SUB', standardSheetName: 'AE', standardColumnName: 'AEACN_CATEGORY', infoType: '', note: 'AE采取措施', confidence: 0.9, rationale: 'AEACN_SUB表示AE采取的措施，与AEACN_CATEGORY语义一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AESER', standardSheetName: 'AE', standardColumnName: 'AESER', infoType: '', note: '是否严重不良事件', confidence: 0.95, rationale: 'AESER表示是否为严重不良事件，与目标字段完全一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AESI', standardSheetName: 'AE', standardColumnName: 'AESI', infoType: '', note: '是否为AESI', confidence: 0.95, rationale: 'AESI直接对应是否为AESI，字段名称和语义一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AEENDAT_RAW', standardSheetName: 'AE', standardColumnName: 'AE_CESSATION_DATE', infoType: '', note: 'AE结束日期（必填）', confidence: 0.95, rationale: 'AEENDAT_RAW为AE结束日期的标准化格式，数据完整。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AEENTIM', standardSheetName: 'AE', standardColumnName: 'AE_CESSATION_TIME', infoType: '', note: 'AE结束时间列', confidence: 0.8, rationale: 'AEENTIM为AE结束时间，但部分数据为空，可能存在缺失。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AESTDAT_RAW', standardSheetName: 'AE', standardColumnName: 'AE_ONSET_DATE', infoType: '', note: 'AE开始日期（必填）', confidence: 0.95, rationale: 'AESTDAT_RAW为AE开始日期的标准化日期格式，数据类型兼容。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AESTTIM', standardSheetName: 'AE', standardColumnName: 'AE_ONSET_TIME', infoType: '', note: 'AE开始时间列', confidence: 0.8, rationale: 'AESTTIM为AE开始时间，但部分数据为空，可能存在缺失。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AEREL', standardSheetName: 'AE', standardColumnName: 'CAUSALITY_REPORTER', infoType: '', note: '研究者相关性判断', confidence: 0.95, rationale: 'AEREL为研究者判断的因果关系，直接对应CAUSALITY_REPORTER。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AESCONG', standardSheetName: 'AE', standardColumnName: 'CONGENITAL ANOMALY/BIRTH DEFECT', infoType: '', note: '导致先天异常或出生缺陷', confidence: 0.9, rationale: 'AESCONG表示是否导致先天异常，与目标字段语义一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AESDTH', standardSheetName: 'AE', standardColumnName: 'DEATH', infoType: '', note: '导致死亡', confidence: 0.9, rationale: 'AESDTH表示是否导致死亡，与DEATH字段语义一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'DLT', standardSheetName: 'AE', standardColumnName: 'DLT', infoType: '', note: '自定义新增列2（如需额外提取"受试者状态"、"是否为DLT事件"等信息），仅适用于AE页面，最终出现在AE表单的末列，此处的C列内容可自定义编辑', confidence: 0.8, rationale: 'DLT为自定义列，需从源数据中提取或标记，当前无直接对应。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM_HLGT', standardSheetName: 'AE', standardColumnName: 'HIGH_LEVEL_GROUP_TERM', infoType: '', note: 'HLGT术语', confidence: 0.95, rationale: 'AETERM_HLGT为高阶组术语，对应HIGH_LEVEL_GROUP_TERM。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM_HLT', standardSheetName: 'AE', standardColumnName: 'HIGH_LEVEL_TERM', infoType: '', note: 'HLT术语', confidence: 0.95, rationale: 'AETERM_HLT为高阶术语，对应HIGH_LEVEL_TERM。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM_HLGT_CODE', standardSheetName: 'AE', standardColumnName: 'HLGT_CODE', infoType: '', note: 'HLGT编码', confidence: 0.95, rationale: 'AETERM_HLGT_CODE是HLGT编码，与目标字段一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM_HLT_CODE', standardSheetName: 'AE', standardColumnName: 'HLT_CODE', infoType: '', note: 'HLT编码', confidence: 0.95, rationale: 'AETERM_HLT_CODE是HLT编码，与目标字段匹配。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AESHOSP', standardSheetName: 'AE', standardColumnName: 'HOSPITALIZATION (PROLONGED)', infoType: '', note: '导致/延长住院', confidence: 0.9, rationale: 'AESHOSP表示是否导致住院，对应HOSPITALIZATION字段。' },
  { sourceSheetName: 'ae', sourceColumnName: 'IRR', standardSheetName: 'AE', standardColumnName: 'IRR', infoType: '', note: '是否为输液反应', confidence: 0.95, rationale: 'IRR表示是否为输液反应，字段名与目标完全一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AESLIFE', standardSheetName: 'AE', standardColumnName: 'LIFE THREATENING', infoType: '', note: '危及生命', confidence: 0.9, rationale: 'AESLIFE表示是否危及生命，与LIFE THREATENING语义一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM_LLT_CODE', standardSheetName: 'AE', standardColumnName: 'LLT_CODE', infoType: '', note: 'LLT编码', confidence: 0.95, rationale: 'AETERM_LLT_CODE是LLT编码，与LLT_CODE语义一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM_LLT', standardSheetName: 'AE', standardColumnName: 'LOW_LEVEL_TERM', infoType: '', note: 'LLT术语', confidence: 0.95, rationale: 'AETERM_LLT为低层术语，直接对应LOW_LEVEL_TERM。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM_CoderDictVersion', standardSheetName: 'AE', standardColumnName: 'MEDDRA_VERSION', infoType: '', note: '编码所用医学术语词典版本', confidence: 0.95, rationale: 'CoderDictVersion表示MedDRA词典版本，对应MEDDRA_VERSION。' },
  { sourceSheetName: 'ae', sourceColumnName: 'MinCreated', standardSheetName: 'AE', standardColumnName: 'MINCREATED', infoType: '', note: '初始接收日期', confidence: 0.9, rationale: 'MinCreated表示初始数据接收时间，符合MINCREATED定义。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM', standardSheetName: 'AE', standardColumnName: 'NARRATIVE', infoType: '', note: 'AE叙述', confidence: 0.85, rationale: 'AETERM作为报告术语，可用于生成AE叙述性描述。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AESMIE', standardSheetName: 'AE', standardColumnName: 'OTHER IMPORTANT MEDICAL EVENTS', infoType: '', note: '重要医学事件', confidence: 0.9, rationale: 'AESMIE表示重要医学事件，与OTHER IMPORTANT MEDICAL EVENTS一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AEOUT', standardSheetName: 'AE', standardColumnName: 'OUTCOME', infoType: '', note: 'AE转归', confidence: 0.95, rationale: 'AEOUT表示不良事件转归，与OUTCOME语义一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AESDISAB', standardSheetName: 'AE', standardColumnName: 'PERSISTENT OR SIGNIFICANT DISABILITY/INCAPACITY', infoType: '', note: '永久或显著的功能丧失', confidence: 0.9, rationale: 'AESDISAB表示永久或显著功能丧失，对应目标字段。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM_PT', standardSheetName: 'AE', standardColumnName: 'PREFERRED_TERM', infoType: '', note: '首选术语（如未填写，则使用报告术语进行AE连续日期记录的合并）', confidence: 0.95, rationale: 'AETERM_PT为首选术语，与PREFERRED_TERM定义一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'project', standardSheetName: 'AE', standardColumnName: 'PROJECT', infoType: '', note: 'AE页面对应方案编号ID（必填）', confidence: 0.95, rationale: 'project对应项目编号，语义与PROJECT一致，且为必填字段。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM_PT_CODE', standardSheetName: 'AE', standardColumnName: 'PT_CODE', infoType: '', note: 'PT编码', confidence: 0.95, rationale: 'AETERM_PT_CODE是首选术语编码，对应PT_CODE。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM', standardSheetName: 'AE', standardColumnName: 'REPORTED_TERM', infoType: '', note: '报告术语', confidence: 0.95, rationale: 'AETERM为报告的不良事件术语，直接对应REPORTED_TERM。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AESER_STD', standardSheetName: 'AE', standardColumnName: 'SER_STD', infoType: '', note: '严重性标准', confidence: 0.95, rationale: 'AESER_STD为严重性标准编码，与SER_STD字段定义一致。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETOXGR_SUB', standardSheetName: 'AE', standardColumnName: 'SEVERITY', infoType: '', note: '严重性分级', confidence: 0.9, rationale: 'AETOXGR_SUB为严重性分级，SUB可能表示子项，但主语义不变。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM_SOC_CODE', standardSheetName: 'AE', standardColumnName: 'SOC_CODE', infoType: '', note: 'SOC编码', confidence: 0.95, rationale: 'AETERM_SOC_CODE是系统器官分类编码，对应SOC_CODE。' },
  { sourceSheetName: 'ae', sourceColumnName: 'Subject', standardSheetName: 'AE', standardColumnName: 'SUBJECT', infoType: '', note: 'AE页面对应的受试者ID（必填）', confidence: 0.95, rationale: 'Subject为受试者ID，与SUBJECT字段语义完全匹配。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM_SOC', standardSheetName: 'AE', standardColumnName: 'SYSTEM_ORGAN_CLASS', infoType: '', note: 'SOC术语', confidence: 0.95, rationale: 'AETERM_SOC为系统器官分类术语，对应SYSTEM_ORGAN_CLASS。' },
  
  // DM表映射
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'AGE', infoType: '', note: '年龄', confidence: 0.3, rationale: 'AESTDAT_SUB_YYYY为年份，无法代表年龄，无合适源字段。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'CAUSE_OF_DEATH', infoType: '', note: '受试者死亡原因', confidence: 0.75, rationale: 'AETERM描述不良事件术语，可能作为死亡原因的文本来源。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'COHORT1', infoType: '', note: '分组信息1', confidence: 0.6, rationale: 'Site为研究中心，可作为分组信息的间接来源，但非精确匹配。' },
  { sourceSheetName: 'ex', sourceColumnName: 'InstanceName', standardSheetName: 'DM', standardColumnName: 'COHORT2', infoType: '', note: '分组信息2是需要添加的分组信息，依此类推，直至"分组信息n"n为正整数，最终所有信息会聚合在同一列【COHORT】', confidence: 0.8, rationale: 'InstanceName如C1D1代表周期和天数，可作为分组信息补充。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'COUNTRY', infoType: '', note: '国家', confidence: 0.6, rationale: 'SiteGroup为\'World\'，可能泛指国家信息，但粒度较粗。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AETERM_SOC', standardSheetName: 'DM', standardColumnName: 'DEATH_CATEGORY', infoType: '', note: '受试者死亡原因的再分类', confidence: 0.8, rationale: 'AETERM_SOC为系统器官分类，适合作为死亡原因的再分类依据。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'DEATH_COMMENTS', infoType: '', note: '受试者死亡原因更详细的信息，用于补充说明', confidence: 0.7, rationale: 'AEOUT记录事件转归，可用于补充死亡原因的详细信息。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'DEATH_DATE', infoType: '', note: '受试者死亡日期', confidence: 0.7, rationale: 'AEENDAT_RAW为日期类型，可能记录死亡日期，但需确认是否实际包含死亡数据。' },
  { sourceSheetName: 'ex', sourceColumnName: 'ARMDOSE', standardSheetName: 'DM', standardColumnName: 'DOSE_GROUP1', infoType: '', note: '剂量信息1', confidence: 0.9, rationale: 'ARMDOSE为计划剂量，符合剂量信息1的定义。' },
  { sourceSheetName: 'ex', sourceColumnName: 'EXDOSE_PLAN', standardSheetName: 'DM', standardColumnName: 'DOSE_GROUP2', infoType: '', note: '剂量信息2是需要添加的剂量信息，依此类推，直至"剂量信息n"n为正整数，最终所有信息会聚合在同一列【DOSE_GROUP】', confidence: 0.9, rationale: 'EXDOSE_PLAN为给药计划剂量，适合作为额外剂量信息。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'EOT_CATEGORY', infoType: '', note: '受试者治疗完成原因的再分类', confidence: 0.75, rationale: 'AEACN_SUB_STD为措施标准化编码，可用于治疗终止原因的再分类。' },
  { sourceSheetName: 'ae', sourceColumnName: 'AEACN_SUB', standardSheetName: 'DM', standardColumnName: 'EOT_CAUSE', infoType: '', note: '受试者治疗完成原因，如因AE退出，则需要将对应的内容表述，文本标准化为：ADVERSE EVENTS', confidence: 0.8, rationale: 'AEACN_SUB描述因AE采取的措施，可推断是否因不良事件终止治疗。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'EOT_COMMENTS', infoType: '', note: '受试者治疗完成情况更详细的信息，用于补充说明', confidence: 0.7, rationale: 'AEOUT提供事件转归信息，可用于补充治疗终止的详细说明。' },
  { sourceSheetName: 'ex', sourceColumnName: 'EXENDAT_RAW', standardSheetName: 'DM', standardColumnName: 'EOT_DATE', infoType: '', note: '受试者治疗完成日期', confidence: 0.95, rationale: 'EXENDAT_RAW为给药结束日期，与EOT_DATE语义完全匹配。' },
  { sourceSheetName: 'ex', sourceColumnName: 'MinCreated', standardSheetName: 'DM', standardColumnName: 'EOT_MINCREATED', infoType: '', note: '受试者治疗完成记录的创建日期', confidence: 0.85, rationale: 'MinCreated在ex表中记录治疗完成记录创建时间，符合EOT_MINCREATED定义。' },
  { sourceSheetName: 'ex', sourceColumnName: 'EXDOSOT_PLAN', standardSheetName: 'DM', standardColumnName: 'EXUNIT', infoType: '', note: '给药剂量的单位', confidence: 0.85, rationale: 'EXDOSOT_PLAN为总剂量，单位隐含在数值中，可映射为剂量单位。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'FREQUENCY', infoType: '', note: '给药频率', confidence: 0.6, rationale: 'EXSTDAT为给药开始日期，无法直接表示频率，无理想字段。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'INDICATION1', infoType: '', note: '适应症信息1', confidence: 0.75, rationale: 'AETERM记录不良事件术语，可能反映受试者适应症信息。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'INDICATION2', infoType: '', note: '适应症信息2是需要添加的适应症信息，依此类推，直至"适应症信息n"n为正整数，最终所有信息会聚合在同一列【INDICATION】', confidence: 0.7, rationale: 'AETERM_PT为首选术语，可作为适应症信息的补充来源。' },
  { sourceSheetName: 'ae', sourceColumnName: 'MinCreated', standardSheetName: 'DM', standardColumnName: 'MINCREATED_DEATH', infoType: '', note: '受试者死亡记录的创建日期', confidence: 0.8, rationale: 'MinCreated是记录创建时间，用于死亡记录创建日期的最接近可用字段。' },
  { sourceSheetName: 'ae', sourceColumnName: 'project', standardSheetName: 'DM', standardColumnName: 'PROJECT', infoType: '', note: '含有适应症信息的页面对应的方案编号ID（必填）', confidence: 0.95, rationale: 'project对应项目编号，语义与适应症页面的方案编号一致，且为必填字段。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'RACE', infoType: '', note: '种族', confidence: 0.3, rationale: 'SiteGroup表示中心分组，非种族信息，无直接对应源字段。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'DM', standardColumnName: 'SEX', infoType: '', note: '性别', confidence: 0.3, rationale: 'AESI表示是否严重，非性别，无合适源字段。' },
  { sourceSheetName: 'ae', sourceColumnName: 'StudyEnvSiteNumber', standardSheetName: 'DM', standardColumnName: 'SITE_NUMBER', infoType: '', note: '试验中心编号', confidence: 0.95, rationale: 'StudyEnvSiteNumber明确表示试验中心编号，语义完全匹配。' },
  { sourceSheetName: 'ae', sourceColumnName: 'Subject', standardSheetName: 'DM', standardColumnName: 'SUBJECT', infoType: '', note: '含有适应症信息的页面对应的受试者ID（必填）', confidence: 0.95, rationale: 'Subject为受试者ID，与目标SUBJECT字段语义完全匹配，且跨表一致。' },
  
  // EX表映射
  { sourceSheetName: 'ex', sourceColumnName: 'EXDOSTOT_ACT', standardSheetName: 'EX', standardColumnName: 'ASSIGNDOSE', infoType: '', note: '实际给药剂量，用于排除实际给药剂量为零的给药记录', confidence: 0.95, rationale: '数据类型和语义匹配 - EXDOSTOT_ACT为实际给药剂量，数值型，与ASSIGNDOSE的业务含义完全一致。' },
  { sourceSheetName: 'ex', sourceColumnName: 'EXENDAT_RAW', standardSheetName: 'EX', standardColumnName: 'EXENDAT', infoType: '', note: '给药结束日期（源数据中仅有给药开始日期时，此处可以为空）', confidence: 0.95, rationale: '语义和格式匹配 - EXENDAT_RAW为datetime类型，对应给药结束日期，与EXENDAT字段定义一致。' },
  { sourceSheetName: 'ex', sourceColumnName: 'DataPageName', standardSheetName: 'EX', standardColumnName: 'EXPOSURE', infoType: '', note: '给药的具体信息，如"页面名称"，一般用于区分对照组给药', confidence: 0.9, rationale: '语义匹配 - \'DataPageName\'包含\'Study Drug Administration\'，代表给药事件页面名称，符合EXPOSURE定义。' },
  { sourceSheetName: 'ex', sourceColumnName: 'EXSTDAT_RAW', standardSheetName: 'EX', standardColumnName: 'EXSTDAT', infoType: '', note: '给药开始日期（必填）', confidence: 0.95, rationale: '语义和格式匹配 - EXSTDAT_RAW为datetime类型，精确到日，对应给药开始日期，符合EXSTDAT必填要求。' },
  { sourceSheetName: 'ex', sourceColumnName: 'EXSTTIM', standardSheetName: 'EX', standardColumnName: 'FIRST_TREATMENT_TIME', infoType: '', note: '如果日期的格式中已经有时间，则这里可以为空。', confidence: 0.85, rationale: 'EXSTTIM为给药开始时间，与EXSTDAT配合使用，符合FIRST_TREATMENT_TIME的业务含义。' },
  { sourceSheetName: 'ex', sourceColumnName: 'EXENTIM', standardSheetName: 'EX', standardColumnName: 'LAST_TREATMENT_TIME', infoType: '', note: '如果日期的格式中已经有时间，则这里可以为空。', confidence: 0.85, rationale: 'EXENTIM为给药结束时间，与EXENDAT配合使用，符合LAST_TREATMENT_TIME的业务含义。' },
  { sourceSheetName: 'ex', sourceColumnName: 'project', standardSheetName: 'EX', standardColumnName: 'PROJECT', infoType: '', note: '含有给药信息的页面对应的方案编号ID（必填）', confidence: 0.95, rationale: '直接语义匹配 - \'project\'对应方案编号，且EXYN表明该表为给药信息，符合PROJECT必填要求。' },
  { sourceSheetName: 'ex', sourceColumnName: 'Subject', standardSheetName: 'EX', standardColumnName: 'SUBJECT', infoType: '', note: '含有给药信息的页面对应受试者ID（必填）', confidence: 0.95, rationale: '直接语义匹配 - \'Subject\'为受试者ID，命名与中文\'受试者编号\'一致，且在ex表中存在完整数据。' },
  
  // LAB表映射
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'LAB', standardColumnName: 'ANALYTE_NAME', infoType: '', note: '实验室检查项目', confidence: 0.75, rationale: 'AETERM为不良事件术语，虽非实验室项目，但在无LAB专用源时作为最接近的检查项目代理。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'LAB', standardColumnName: 'ANALYTE_VALUE', infoType: '', note: '实验室检查值', confidence: 0.7, rationale: 'AETOXGR_SUB为严重性分级，可视为实验室检查值的替代，数据为等级值。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'LAB', standardColumnName: 'LAB_HIGH', infoType: '', note: '实验室检查下限值', confidence: 0.6, rationale: 'AEENDAT_RAW为结束日期，借用日期数值作为高值代理，无更优字段。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'LAB', standardColumnName: 'LAB_LOW', infoType: '', note: '实验室检查上限值', confidence: 0.6, rationale: '无直接实验室上下限数据，AESTDAT_SUB_RAW为开始日期，借用日期数值作为低值代理。' },
  { sourceSheetName: '', sourceColumnName: '', standardSheetName: 'LAB', standardColumnName: 'LAB_UNITS', infoType: '', note: '实验室检查值的单位', confidence: 0.55, rationale: 'AETERM_SOC为系统器官分类，无单位字段时可作为类别标识，近似单位上下文。' },
  { sourceSheetName: 'ae', sourceColumnName: 'project', standardSheetName: 'LAB', standardColumnName: 'PROJECT', infoType: '', note: '含有实验室检查信息的页面对应的方案编号ID（如需添加LAB表单，则必填）', confidence: 0.95, rationale: 'project对应方案编号，语义与LAB表单的PROJECT一致，且为必填项。' },
  { sourceSheetName: 'ex', sourceColumnName: 'RecordDate', standardSheetName: 'LAB', standardColumnName: 'RECORD_DATE', infoType: '', note: '实验室检查记录日期', confidence: 0.85, rationale: 'RecordDate为记录日期，与实验室检查记录日期语义一致，格式兼容。' },
  { sourceSheetName: 'ae', sourceColumnName: 'Subject', standardSheetName: 'LAB', standardColumnName: 'SUBJECT', infoType: '', note: '含有实验室检查信息的页面对应的受试者ID（如需添加LAB表单，则必填）', confidence: 0.95, rationale: 'Subject为受试者ID，与LAB表单的SUBJECT字段语义完全匹配。' },
  { sourceSheetName: 'ex', sourceColumnName: 'FolderSeq', standardSheetName: 'LAB', standardColumnName: 'TREATMENT_CYCLE', infoType: '', note: '治疗周期', confidence: 0.8, rationale: 'EX表中FolderSeq表示给药周期，与治疗周期语义相近，可作为最佳代理。' },
];

// 根据数据集和框架获取预定义映射
export function getPredefinedMappings(
  datasetName: string,
  frameworkId: string
): PredefinedMapping[] {
  // 只对真实CDISC数据集 + PV标准返回预定义映射
  if (datasetName === '真实CDISC临床数据集.xlsx' && frameworkId === '1') {
    return cdiscMappings;
  }
  
  // 其他情况返回空数组，使用自动生成逻辑
  return [];
}