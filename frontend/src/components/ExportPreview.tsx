import { Button } from './ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Dataset, Mapping } from '../App';

interface ExportPreviewProps {
  dataset: Dataset;
  mappings: Mapping[];
  onBack: () => void;
}

export function ExportPreview({
  dataset,
  mappings,
  onBack,
}: ExportPreviewProps) {
  const handleExportExcel = () => {
    // 准备数据（不包含AI生成的列）
    const excelData = mappings.map((m, index) => ({
      '序号': index + 1,
      'Source_SheetName': m.sourceSheetName,
      'Source_ColumnName': m.sourceColumnName,
      'Standard_SheetName': m.standardSheetName,
      'Standard_ColumnName': m.standardColumnName,
      '信息类型': m.infoType,
      '备注': m.note,
    }));

    // 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '字段映射');

    // 设置列宽
    worksheet['!cols'] = [
      { wch: 6 },  // 序号
      { wch: 20 }, // Source_SheetName
      { wch: 25 }, // Source_ColumnName
      { wch: 20 }, // Standard_SheetName
      { wch: 30 }, // Standard_ColumnName
      { wch: 15 }, // 信息类型
      { wch: 30 }, // 备注
    ];

    // 导出
    XLSX.writeFile(workbook, `字段映射-${dataset.name}-${Date.now()}.xlsx`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f7fc' }}>
      <div className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack} size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              返回编辑
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg">导出预览</h1>
            <span className="text-sm text-muted-foreground">
              {dataset.name}
            </span>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportExcel} size="sm" style={{ backgroundColor: '#5b5fc7' }} className="hover:opacity-90">
              <Download className="mr-2 size-4" />
              确认导出 Excel
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="mb-4 rounded-lg px-4 py-3" style={{ backgroundColor: '#eeeffe', border: '1px solid #d4d4f7' }}>
          <p className="text-sm" style={{ color: '#5b5fc7' }}>
            <strong>预览说明：</strong>以下是将要导出的数据内容（只读模式），确认无误后点击"确认导出 Excel"按钮。
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1200px] text-sm">
              <thead>
                <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground border-r w-16" style={{ borderRight: '1px solid #e5e7eb' }}>序号</th>
                  <th className="px-4 py-3 text-left font-medium border-r min-w-[160px]" style={{ color: '#5b5fc7', borderRight: '1px solid #e5e7eb' }}>
                    Source_SheetName
                  </th>
                  <th className="px-4 py-3 text-left font-medium border-r min-w-[200px]" style={{ color: '#5b5fc7', borderRight: '1px solid #e5e7eb' }}>
                    Source_ColumnName
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground border-r min-w-[160px]" style={{ borderRight: '1px solid #e5e7eb' }}>
                    Standard_SheetName
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground border-r min-w-[220px]" style={{ borderRight: '1px solid #e5e7eb' }}>
                    Standard_ColumnName
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground border-r min-w-[140px]" style={{ borderRight: '1px solid #e5e7eb' }}>
                    信息类型
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground min-w-[220px]">
                    备注
                  </th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((mapping, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50"
                    style={{ borderBottom: '1px solid #e5e7eb' }}
                  >
                    <td className="px-4 py-2.5 text-muted-foreground border-r" style={{ borderRight: '1px solid #e5e7eb' }}>
                      {index + 1}
                    </td>
                    <td className="px-4 py-2.5 border-r" style={{ borderRight: '1px solid #e5e7eb' }}>
                      <div className="rounded px-3 py-1.5 font-mono" style={{ backgroundColor: '#eeeffe', color: '#5b5fc7' }}>
                        {mapping.sourceSheetName}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 border-r" style={{ borderRight: '1px solid #e5e7eb' }}>
                      <div className="rounded px-3 py-1.5 font-mono" style={{ backgroundColor: '#eeeffe', color: '#5b5fc7' }}>
                        {mapping.sourceColumnName}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 border-r" style={{ borderRight: '1px solid #e5e7eb' }}>
                      <div className="bg-gray-50 px-3 py-1.5 rounded">
                        {mapping.standardSheetName}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 border-r" style={{ borderRight: '1px solid #e5e7eb' }}>
                      <div className="bg-gray-50 px-3 py-1.5 rounded">
                        {mapping.standardColumnName}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 border-r" style={{ borderRight: '1px solid #e5e7eb' }}>
                      <div className="bg-gray-50 px-3 py-1.5 rounded min-h-[32px]">
                        {mapping.infoType || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="bg-gray-50 px-3 py-1.5 rounded min-h-[32px]">
                        {mapping.note}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4" style={{ backgroundColor: '#fafafa', borderTop: '1px solid #e5e7eb' }}>
            <p className="text-sm text-muted-foreground">
              共 {mappings.length} 个字段映射
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
