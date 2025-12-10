import { Button } from './ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import type { MappingChangeRecord } from '../App';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MappingChangeHistoryProps {
  changeHistory: MappingChangeRecord[];
  onBack: () => void;
}

export function MappingChangeHistory({ changeHistory, onBack }: MappingChangeHistoryProps) {
  // 按时间倒序排列
  const sortedHistory = [...changeHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape orientation
    const tableData = sortedHistory.map((record, index) => [
      sortedHistory.length - index,
      formatDateTime(record.timestamp),
      record.operator,
      record.datasetName,
      record.targetFramework,
      record.sourceSheetName,
      record.sourceColumnName,
      record.oldStandardSheetName || '(空)',
      record.newStandardSheetName,
      record.oldStandardColumnName || '(空)',
      record.newStandardColumnName,
    ]);

    autoTable(doc, {
      head: [
        ['序号', '修改时间', '操作人', '数据集', '目标标准', '源表名', '源字段名', '修改前-标准表名', '修改后-标准表名', '修改前-标准字段名', '修改后-标准字段名'],
      ],
      body: tableData,
      startY: 20,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [91, 95, 199],
        textColor: [255, 255, 255],
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 30 },
        2: { halign: 'left', cellWidth: 20 },
        3: { halign: 'left', cellWidth: 35 },
        4: { halign: 'left', cellWidth: 30 },
        5: { halign: 'left', cellWidth: 20 },
        6: { halign: 'left', cellWidth: 25 },
        7: { halign: 'left', cellWidth: 25 },
        8: { halign: 'left', cellWidth: 25 },
        9: { halign: 'left', cellWidth: 30 },
        10: { halign: 'left', cellWidth: 30 },
      },
    });

    doc.save(`人工修改记录-${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f7f7fc' }}>
      <div className="border-b bg-white px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack} size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              返回
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg">人工修改记录</h1>
            <span className="text-sm text-muted-foreground">
              共 {changeHistory.length} 条修改记录
            </span>
          </div>
          {changeHistory.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} size="sm" style={{ backgroundColor: '#5b5fc7' }} className="hover:opacity-90">
                <Download className="mr-2 size-4" />
                导出PDF
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col px-6 py-6">
        {sortedHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center" style={{ border: '1px solid #e5e7eb' }}>
            <div className="size-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#eeeffe' }}>
              <ArrowLeft className="size-6" style={{ color: '#5b5fc7' }} />
            </div>
            <p className="text-muted-foreground">暂无修改记录</p>
            <p className="text-sm text-muted-foreground mt-2">
              当您在映射编辑器中修改标准字段时，这里将记录所有修改历史
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col" style={{ border: '1px solid #e5e7eb' }}>
            <div className="overflow-auto flex-1">
              <table className="w-full border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-muted/30 border-b">
                    <th className="px-3 py-3 text-left text-xs text-muted-foreground border-r w-12 sticky top-0 bg-muted/30 z-10">序号</th>
                    <th className="px-3 py-3 text-left text-xs text-muted-foreground border-r min-w-[160px] sticky top-0 bg-muted/30 z-10">修改时间</th>
                    <th className="px-3 py-3 text-left text-xs text-muted-foreground border-r min-w-[100px] sticky top-0 bg-muted/30 z-10">操作人</th>
                    <th className="px-3 py-3 text-left text-xs text-muted-foreground border-r min-w-[150px] sticky top-0 bg-muted/30 z-10">数据集</th>
                    <th className="px-3 py-3 text-left text-xs text-muted-foreground border-r min-w-[150px] sticky top-0 bg-muted/30 z-10">目标标准</th>
                    <th className="px-3 py-3 text-left text-xs border-r min-w-[120px] sticky top-0 bg-muted/30 z-10">
                      <div className="text-gray-600">源表名</div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs border-r min-w-[180px] sticky top-0 bg-muted/30 z-10">
                      <div className="text-gray-600">源字段名</div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs border-r min-w-[150px] sticky top-0 bg-muted/30 z-10">
                      <div style={{ color: '#dc2626' }}>修改前-标准表名</div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs border-r min-w-[150px] sticky top-0 bg-muted/30 z-10">
                      <div style={{ color: '#16a34a' }}>修改后-标准表名</div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs border-r min-w-[200px] sticky top-0 bg-muted/30 z-10">
                      <div style={{ color: '#dc2626' }}>修改前-标准字段名</div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs min-w-[200px] sticky top-0 bg-muted/30 z-10">
                      <div style={{ color: '#16a34a' }}>修改后-标准字段名</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.map((record, index) => (
                    <tr
                      key={record.id}
                      className="border-b last:border-b-0 hover:bg-accent/30 transition-colors"
                    >
                      <td className="px-3 py-2.5 border-r text-xs text-muted-foreground">
                        {sortedHistory.length - index}
                      </td>
                      <td className="px-3 py-2.5 border-r text-xs font-mono">
                        {formatDateTime(record.timestamp)}
                      </td>
                      <td className="px-3 py-2.5 border-r text-xs">
                        {record.operator}
                      </td>
                      <td className="px-3 py-2.5 border-r text-xs">
                        <span className="font-mono" style={{ color: '#5b5fc7' }}>{record.datasetName}</span>
                      </td>
                      <td className="px-3 py-2.5 border-r text-xs">
                        <span className="font-mono" style={{ color: '#5b5fc7' }}>{record.targetFramework}</span>
                      </td>
                      <td className="px-3 py-2.5 border-r">
                        <div className="rounded px-2 py-1 text-xs font-mono" style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', color: '#6b7280' }}>
                          {record.sourceSheetName}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 border-r">
                        <div className="rounded px-2 py-1 text-xs font-mono" style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', color: '#6b7280' }}>
                          {record.sourceColumnName}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 border-r">
                        <div className="rounded px-2 py-1 text-xs font-mono bg-red-50 text-red-700" style={{ border: '1px solid #fecaca' }}>
                          {record.oldStandardSheetName || '(空)'}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 border-r">
                        <div className="rounded px-2 py-1 text-xs font-mono bg-green-50 text-green-700" style={{ border: '1px solid #bbf7d0' }}>
                          {record.newStandardSheetName}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 border-r">
                        <div className="rounded px-2 py-1 text-xs font-mono bg-red-50 text-red-700" style={{ border: '1px solid #fecaca' }}>
                          {record.oldStandardColumnName || '(空)'}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="rounded px-2 py-1 text-xs font-mono bg-green-50 text-green-700" style={{ border: '1px solid #bbf7d0' }}>
                          {record.newStandardColumnName}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}