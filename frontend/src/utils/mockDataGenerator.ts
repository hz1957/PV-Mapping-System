// 生成模拟预览数据的工具函数

// 根据字段名生成合理的模拟数据
export function generateMockDataForColumn(
  sheetName: string,
  columnName: string,
  rowCount: number = 10
): string[] {
  const data: string[] = [];
  
  // 转换为小写以便匹配
  const col = columnName.toLowerCase();
  const sheet = sheetName.toLowerCase();
  
  for (let i = 0; i < rowCount; i++) {
    let value = '';
    
    // 受试者编号相关
    if (col.includes('subject') || col.includes('subjid') || col === '受试者编号') {
      value = `S${String(1001 + i).padStart(4, '0')}`;
    }
    // 中心ID相关
    else if (col.includes('site') || col.includes('siteid') || col === '中心id' || col === '中心编号') {
      value = `CENTER-${String(101 + (i % 5)).padStart(3, '0')}`;
    }
    // 项目编号
    else if (col.includes('project') || col === 'project') {
      value = 'PROJ-2024-001';
    }
    // 日期相关字段
    else if (col.includes('date') || col.includes('dat') || col.includes('日期')) {
      const date = new Date(2024, 0, 1 + i);
      value = date.toISOString().split('T')[0];
    }
    // 时间相关字段
    else if (col.includes('time') || col.includes('tim') || col.includes('时间')) {
      value = `${String(8 + (i % 12)).padStart(2, '0')}:${String((i * 15) % 60).padStart(2, '0')}:00`;
    }
    // Yes/No字段
    else if (col.includes('ser') || col.includes('是否')) {
      value = i % 3 === 0 ? 'Yes' : 'No';
    }
    // 严重程度
    else if (col.includes('severity') || col.includes('sev') || col.includes('tox') || col.includes('严重')) {
      const severities = ['Mild', 'Moderate', 'Severe'];
      value = severities[i % 3];
    }
    // AE相关术语
    else if (col.includes('aeterm') && !col.includes('code')) {
      const terms = ['Headache', 'Nausea', 'Fatigue', 'Dizziness', 'Fever', 'Cough', 'Rash', 'Pain', 'Insomnia', 'Anxiety'];
      value = terms[i % terms.length];
    }
    // 编码字段
    else if (col.includes('code') || col.includes('编码')) {
      value = `${String(10000000 + i * 1111).padStart(8, '0')}`;
    }
    // 术语/名称
    else if (col.includes('term') || col.includes('name') || col.includes('名称')) {
      const terms = ['Headache', 'Nausea', 'Fatigue', 'Dizziness', 'Fever', 'Cough', 'Rash', 'Pain', 'Insomnia', 'Anxiety'];
      value = terms[i % terms.length];
    }
    // 转归
    else if (col.includes('outcome') || col.includes('out') || col.includes('转归')) {
      const outcomes = ['Recovered', 'Recovering', 'Not Recovered', 'Fatal', 'Unknown'];
      value = outcomes[i % outcomes.length];
    }
    // 因果关系
    else if (col.includes('rel') || col.includes('causality') || col.includes('关系')) {
      const rels = ['Not Related', 'Unlikely', 'Possible', 'Probable', 'Definite'];
      value = rels[i % rels.length];
    }
    // 剂量相关
    else if (col.includes('dose') || col.includes('剂量')) {
      value = `${(50 + i * 10)} mg`;
    }
    // 频率
    else if (col.includes('freq') || col.includes('频率')) {
      const freqs = ['QD', 'BID', 'TID', 'QW', 'Q2W'];
      value = freqs[i % freqs.length];
    }
    // 版本号
    else if (col.includes('version')) {
      value = '26.1';
    }
    // MinCreated
    else if (col.includes('mincreated') || col.includes('created')) {
      const date = new Date(2024, 0, 1 + i);
      value = date.toISOString();
    }
    // 数值字段
    else if (col.includes('value') || col.includes('值')) {
      value = String((Math.random() * 100).toFixed(2));
    }
    // 单位
    else if (col.includes('unit') || col.includes('单位')) {
      const units = ['mg', 'mL', 'g/dL', 'mmol/L', 'U/L'];
      value = units[i % units.length];
    }
    // 访视相关
    else if (col.includes('visit') || col.includes('访视')) {
      value = `Visit ${i + 1}`;
    }
    // 周期
    else if (col.includes('cycle') || col.includes('周期') || col.includes('folderseq')) {
      value = `Cycle ${(i % 6) + 1}`;
    }
    // InstanceName (C1D1格式)
    else if (col.includes('instance')) {
      const cycle = (i % 6) + 1;
      const day = (i % 21) + 1;
      value = `C${cycle}D${day}`;
    }
    // 页面名称
    else if (col.includes('pagename')) {
      value = 'Study Drug Administration';
    }
    // RecordDate
    else if (col.includes('recorddate')) {
      const date = new Date(2024, 0, 1 + i);
      value = date.toISOString().split('T')[0];
    }
    // 默认值
    else {
      value = `Data-${i + 1}`;
    }
    
    data.push(value);
  }
  
  return data;
}

// 生成所有映射的预览数据
export function generatePreviewDataForMappings(mappings: any[]): Map<string, string[]> {
  const previewMap = new Map<string, string[]>();
  
  mappings.forEach((mapping, index) => {
    const key = `${mapping.sourceSheetName}_${mapping.sourceColumnName}_${index}`;
    const data = generateMockDataForColumn(
      mapping.sourceSheetName,
      mapping.sourceColumnName,
      10
    );
    previewMap.set(key, data);
  });
  
  return previewMap;
}
