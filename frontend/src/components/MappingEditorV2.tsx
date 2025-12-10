import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, Download, Save, Eye, Edit3, ChevronDown, ChevronRight, ArrowDown, LayoutGrid, Table2, Sparkles, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Dataset, Mapping, TargetFramework } from '../App';
import { generateMockDataForColumn } from '../utils/mockDataGenerator';
import { SearchableSelect } from './SearchableSelect';
import { toast } from 'sonner@2.0.3';

interface MappingEditorProps {
  dataset: Dataset;
  mappings: Mapping[];
  targetFields: { name: string; description: string }[];
  targetFramework: TargetFramework | null;
  onMappingsChange: (mappings: Mapping[]) => void;
  onBack: () => void;
  onSave: () => void;
  isEditing: boolean;
  isGenerating?: boolean;
  onPreviewExport?: () => void;
  onRecordChange?: (
    sourceSheetName: string,
    sourceColumnName: string,
    oldStandardSheetName: string,
    newStandardSheetName: string,
    oldStandardColumnName: string,
    newStandardColumnName: string
  ) => void;
}

export function MappingEditorV2({
  dataset,
  mappings,
  targetFields,
  targetFramework,
  onMappingsChange,
  onBack,
  onSave,
  isEditing,
  isGenerating,
  onPreviewExport,
  onRecordChange,
}: MappingEditorProps) {
  const [previewData, setPreviewData] = useState<Map<string, string[]>>(new Map());
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const cardViewScrollRef = useRef<HTMLDivElement>(null);

  // 追踪手动编辑过的单元格 (index-field组合)
  const [editedCells, setEditedCells] = useState<Set<string>>(new Set());

  // 追踪高亮的列索引（用于从表格视图跳转时提示用户）
  const [highlightedCardIndex, setHighlightedCardIndex] = useState<number | null>(null);

  // 追踪高亮的行索引（用于从卡片视图跳转时提示用户）
  const [highlightedRowIndex, setHighlightedRowIndex] = useState<number | null>(null);

  // Scroll to bottom when generating new mappings
  const tableContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isGenerating && tableContainerRef.current) {
      tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
    }
  }, [mappings.length, isGenerating]);

  useEffect(() => {
    const newPreviewData = new Map<string, string[]>();
    mappings.forEach((mapping, index) => {
      const key = `${index}`;
      const data = generateMockDataForColumn(
        mapping.sourceSheetName,
        mapping.sourceColumnName,
        10
      );
      newPreviewData.set(key, data);
    });
    setPreviewData(newPreviewData);
  }, [mappings]);

  const updateMapping = (index: number, field: keyof Mapping, value: string | number) => {
    const oldMapping = mappings[index];
    const newMappings = [...mappings];

    // 验证源字段唯一性
    if (field === 'sourceSheetName' || field === 'sourceColumnName') {
      const newSourceSheetName = field === 'sourceSheetName' ? value as string : oldMapping.sourceSheetName;
      const newSourceColumnName = field === 'sourceColumnName' ? value as string : oldMapping.sourceColumnName;

      // 检查是否有其他映射已经使用了这个源字段组合
      const duplicateIndex = mappings.findIndex((m, i) =>
        i !== index &&
        m.sourceSheetName === newSourceSheetName &&
        m.sourceColumnName === newSourceColumnName &&
        newSourceSheetName !== '' &&
        newSourceColumnName !== ''
      );

      if (duplicateIndex !== -1) {
        // 直接清空原映射的源字段名，保留表单名
        newMappings[duplicateIndex] = {
          ...newMappings[duplicateIndex],
          sourceColumnName: ''  // 只清空字段名，保留表单名
        };

        // 移除原行的字段名编辑标记
        setEditedCells(prev => {
          const updated = new Set(prev);
          updated.delete(`${duplicateIndex}-sourceColumnName`);
          return updated;
        });

        toast.success(`已将第 ${duplicateIndex + 1} 行的源字段清空，并在当前行使用`);
      }
    }

    // 验证标准字段唯一性
    if (field === 'standardSheetName' || field === 'standardColumnName') {
      const newStandardSheetName = field === 'standardSheetName' ? value as string : oldMapping.standardSheetName;
      const newStandardColumnName = field === 'standardColumnName' ? value as string : oldMapping.standardColumnName;

      // 检查是否有其他映射已经使用了这个标准字段组合
      const duplicateIndex = mappings.findIndex((m, i) =>
        i !== index &&
        m.standardSheetName === newStandardSheetName &&
        m.standardColumnName === newStandardColumnName &&
        newStandardSheetName !== '' &&
        newStandardColumnName !== ''
      );

      if (duplicateIndex !== -1) {
        // 找到了重复的映射，提示用户
        const duplicateMapping = mappings[duplicateIndex];
        toast.error(
          `标准字段已被占用！标准字段 "${newStandardSheetName}.${newStandardColumnName}" 已经被源字段 "${duplicateMapping.sourceSheetName}.${duplicateMapping.sourceColumnName}" 映射。请选择其他标准字段。`
        );
        return; // 不执行更新
      }
    }

    // 更新当前行
    const updatedMapping = { ...newMappings[index], [field]: value };
    // 如果修改了 sourceSheetName 且值发生了变化，清空 sourceColumnName
    if (field === 'sourceSheetName' && value !== oldMapping.sourceSheetName) {
      updatedMapping.sourceColumnName = '';
    }

    newMappings[index] = updatedMapping;

    // 提交所有更改（包括清空的行和当前更新的行）
    onMappingsChange(newMappings);

    // 记录修改：当修改源字段或标准字段时
    if (onRecordChange) {
      if (field === 'sourceSheetName' || field === 'sourceColumnName') {
        // 修改了源字段，使用新的源字段作为标识
        const newSourceSheetName = field === 'sourceSheetName' ? value as string : oldMapping.sourceSheetName;
        const newSourceColumnName = field === 'sourceColumnName' ? value as string : oldMapping.sourceColumnName;

        // 源字段发生了变化
        if (oldMapping.sourceSheetName !== newSourceSheetName || oldMapping.sourceColumnName !== newSourceColumnName) {
          onRecordChange(
            newSourceSheetName,
            newSourceColumnName,
            oldMapping.standardSheetName,
            oldMapping.standardSheetName, // 标准字段没变
            oldMapping.standardColumnName,
            oldMapping.standardColumnName  // 标准字段没变
          );
        }
      } else if (field === 'standardSheetName' || field === 'standardColumnName') {
        // 修改了标准字段
        const oldStandardSheetName = oldMapping.standardSheetName;
        const oldStandardColumnName = oldMapping.standardColumnName;
        const newStandardSheetName = field === 'standardSheetName' ? value as string : oldMapping.standardSheetName;
        const newStandardColumnName = field === 'standardColumnName' ? value as string : oldMapping.standardColumnName;

        if (oldStandardSheetName !== newStandardSheetName || oldStandardColumnName !== newStandardColumnName) {
          onRecordChange(
            oldMapping.sourceSheetName,
            oldMapping.sourceColumnName,
            oldStandardSheetName,
            newStandardSheetName,
            oldStandardColumnName,
            newStandardColumnName
          );
        }
      }
    }

    // 记录编辑过的单元格
    setEditedCells(prev => new Set(prev.add(`${index}-${field}`)));
  };

  const toggleDetails = () => {
    setIsDetailsExpanded(!isDetailsExpanded);
  };

  const allSheetNames = Array.from(
    new Set(dataset.sheets.map(sheet => sheet.name))
  );

  const allColumnNames = Array.from(
    new Set(
      dataset.sheets.flatMap(sheet => sheet.columns)
    )
  );

  // 获取已使用的源字段组合（用于标记）
  const getUsedSourceFields = (currentIndex: number) => {
    const used = new Set<string>();
    mappings.forEach((m, i) => {
      if (i !== currentIndex && m.sourceSheetName && m.sourceColumnName) {
        used.add(`${m.sourceSheetName}.${m.sourceColumnName}`);
      }
    });
    return used;
  };

  // 获取已使用的标准字段组合（用于标记）
  const getUsedStandardFields = (currentIndex: number) => {
    const used = new Set<string>();
    mappings.forEach((m, i) => {
      if (i !== currentIndex && m.standardSheetName && m.standardColumnName) {
        used.add(`${m.standardSheetName}.${m.standardColumnName}`);
      }
    });
    return used;
  };

  // 生成带使用状态标记的源表名选项
  const getSourceSheetOptions = (currentIndex: number) => {
    const usedFields = getUsedSourceFields(currentIndex);
    const currentMapping = mappings[currentIndex];

    return allSheetNames.map(sheetName => {
      // 检查这个表名下是否有字段被当前行使用，如果有，不标记
      const isCurrentSheet = currentMapping.sourceSheetName === sheetName;

      // 检查这个表名下有多少字段已被其他行使用
      const usedColumnsInSheet = Array.from(usedFields)
        .filter(field => field.startsWith(`${sheetName}.`))
        .length;

      if (isCurrentSheet || usedColumnsInSheet === 0) {
        return { value: sheetName, label: sheetName };
      }

      return {
        value: sheetName,
        label: `${sheetName} (含${usedColumnsInSheet}个已用字段)`,
        note: '该表中部分字段已被使用'
      };
    });
  };

  // 生成带使用状态标记的源字段名选项
  const getSourceColumnOptions = (currentIndex: number, sheetName: string) => {
    if (!sheetName) return [];

    const targetSheet = dataset.sheets.find(s => s.name === sheetName);
    const availableColumns = targetSheet ? targetSheet.columns : [];

    const usedFields = getUsedSourceFields(currentIndex);

    const options = availableColumns.map(columnName => {
      const fieldKey = `${sheetName}.${columnName}`;
      const isUsed = usedFields.has(fieldKey);

      if (isUsed) {
        // 找到使用这个字段的行号
        const usedByIndex = mappings.findIndex((m, i) =>
          i !== currentIndex &&
          m.sourceSheetName === sheetName &&
          m.sourceColumnName === columnName
        );

        return {
          value: columnName,
          label: `${columnName} (已使用)`,
          note: usedByIndex !== -1 ? `已在第 ${usedByIndex + 1} 行使用` : '已被使用',
          isUsed: true
        };
      }

      return { value: columnName, label: columnName, isUsed: false };
    });

    // 将已使用的字段排在最后
    return options.sort((a, b) => {
      if (a.isUsed === b.isUsed) return 0;
      return a.isUsed ? 1 : -1;
    });
  };

  const getStandardSheetOptions = () => {
    if (!targetFramework) return [];
    return Array.from(new Set(targetFramework.sheets.map(s => s.sheetName)));
  };

  const getStandardColumnOptions = (sheetName: string) => {
    if (!targetFramework) return [];
    return targetFramework.sheets
      .filter(s => s.sheetName === sheetName)
      .map(s => ({
        value: s.columnName,
        label: s.columnName,
        note: s.note
      }));
  };

  // 生成带使用状态标记的标准字段名选项
  const getStandardColumnOptionsWithUsage = (currentIndex: number, sheetName: string) => {
    if (!targetFramework) return [];
    const usedFields = getUsedStandardFields(currentIndex);

    const options = targetFramework.sheets
      .filter(s => s.sheetName === sheetName)
      .map(s => {
        const fieldKey = `${sheetName}.${s.columnName}`;
        const isUsed = usedFields.has(fieldKey);

        if (isUsed) {
          // 找到使用这个字段的行号
          const usedByIndex = mappings.findIndex((m, i) =>
            i !== currentIndex &&
            m.standardSheetName === sheetName &&
            m.standardColumnName === s.columnName
          );

          return {
            value: s.columnName,
            label: `${s.columnName} (已占用)`,
            note: usedByIndex !== -1
              ? `已被第 ${usedByIndex + 1} 行占用 · ${s.note || ''}`.trim()
              : `已被占用 · ${s.note || ''}`.trim(),
            isUsed: true
          };
        }

        return {
          value: s.columnName,
          label: s.columnName,
          note: s.note,
          isUsed: false
        };
      });

    // 将已占用的字段排在最后
    return options.sort((a, b) => {
      if (a.isUsed === b.isUsed) return 0;
      return a.isUsed ? 1 : -1;
    });
  };

  // 直接跳转到卡片视图并定位
  const handleJumpToCardView = (index: number) => {
    setViewMode('card');
    setHighlightedCardIndex(index);

    setTimeout(() => {
      if (cardViewScrollRef.current) {
        const columnWidth = 280;
        const scrollPosition = index * columnWidth;
        cardViewScrollRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }

      // 3秒后移除高亮
      setTimeout(() => {
        setHighlightedCardIndex(null);
      }, 3000);
    }, 100);
  };

  // 从卡片视图跳转回表格视图并定位
  const handleJumpToTableView = (index: number) => {
    setViewMode('table');
    setHighlightedRowIndex(index);

    // 延迟一点让视图切换完成，然后滚动到对应行
    setTimeout(() => {
      const row = document.querySelector(`[data-row-index="${index}"]`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // 3秒后移除高亮
      setTimeout(() => {
        setHighlightedRowIndex(null);
      }, 3000);
    }, 100);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f7fc' }}>
      <div className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack} size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              返回
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg">字段映射编辑</h1>
              {isGenerating && (
                <div className="flex items-center gap-2 px-2 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200 text-xs font-medium animate-pulse">
                  <Sparkles className="size-3 animate-spin" />
                  AI生成中...
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {dataset.name} {isEditing && '(编辑中)'}
            </span>
          </div>
          <div className="flex gap-2">
            {onPreviewExport && (
              <Button variant="outline" onClick={onPreviewExport} size="sm">
                <Download className="mr-2 size-4" />
                导出预览
              </Button>
            )}
            <Button onClick={onSave} size="sm" style={{ backgroundColor: '#5b5fc7' }} className="hover:opacity-90">
              <Save className="mr-2 size-4" />
              {isEditing ? '更新' : '保存'}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 flex-1 overflow-hidden flex flex-col">
        <div className="mb-4 rounded-lg px-4 py-3 flex-shrink-0" style={{ backgroundColor: '#eeeffe', border: '1px solid #d4d4f7' }}>
          <div className="flex items-start gap-2">
            <Eye className="size-4 mt-0.5" style={{ color: '#5b5fc7' }} />
            <div className="flex-1">
              <p className="text-sm" style={{ color: '#5b5fc7' }}>
                <strong>{viewMode === 'card' ? '卡片视图' : '表格视图'}：</strong>
                {viewMode === 'card'
                  ? '每列显示一个映射关系，包含源字段、目标字段及10行预览数据。点击展开按钮可查看详细信息。'
                  : '每行显示一个映射关系的所有字段，支持直接编辑源字段和标准字段。点击眼睛图标可快速定位到卡片视图中的对应列。'
                }
              </p>
            </div>
            <div className="flex gap-1 bg-white rounded-md p-1" style={{ border: '1px solid #d4d4f7' }}>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="gap-1.5 h-7"
                style={viewMode === 'table' ? { backgroundColor: '#5b5fc7' } : {}}
              >
                <Table2 className="size-3.5" />
                表格视图
              </Button>
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="gap-1.5 h-7"
                style={viewMode === 'card' ? { backgroundColor: '#5b5fc7' } : {}}
              >
                <LayoutGrid className="size-3.5" />
                卡片视图
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col" style={{ border: '1px solid #e5e7eb' }}>
            <div className="overflow-auto flex-1" ref={tableContainerRef}>
              <table className="w-full border-collapse min-w-[1400px]">
                <thead>
                  <tr className="bg-muted/30 border-b">
                    <th className="px-3 py-3 text-left text-xs text-muted-foreground border-r w-12 sticky left-0 bg-muted/30 z-10">序号</th>
                    <th className="px-3 py-3 text-left text-xs border-r min-w-[140px]">
                      <div className="flex items-center gap-1.5">
                        <Edit3 className="size-3.5" style={{ color: '#5b5fc7' }} />
                        <span style={{ color: '#5b5fc7' }}>Source_SheetName</span>
                      </div>
                      <div className="text-[10px] mt-0.5 flex items-center gap-1.5" style={{ color: '#5b5fc7', opacity: 0.7 }}>
                        <span>可编辑</span>
                        <span>·</span>
                        <span className="font-mono">
                          映射数: {mappings.filter(m => m.sourceSheetName && m.sourceSheetName.trim() !== '').length}/{mappings.length}
                        </span>
                      </div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs border-r min-w-[180px]">
                      <div className="flex items-center gap-1.5">
                        <Edit3 className="size-3.5" style={{ color: '#5b5fc7' }} />
                        <span style={{ color: '#5b5fc7' }}>Source_ColumnName</span>
                      </div>
                      <div className="text-[10px] mt-0.5 flex items-center gap-1.5" style={{ color: '#5b5fc7', opacity: 0.7 }}>
                        <span>可编辑</span>
                        <span>·</span>
                        <span className="font-mono">
                          映射数: {mappings.filter(m => m.sourceColumnName && m.sourceColumnName.trim() !== '').length}/{mappings.length}
                        </span>
                      </div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs border-r min-w-[140px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-600">Standard_SheetName</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">标准表名（只读）</div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs border-r min-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-600">Standard_ColumnName</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">标准列名（只读）</div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs text-muted-foreground border-r min-w-[140px]">信息类型</th>
                    <th className="px-3 py-3 text-left text-xs text-muted-foreground border-r min-w-[200px]">备注</th>
                    <th className="px-3 py-3 text-left text-xs border-r w-24 bg-purple-50/50">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-purple-600" />
                        <span className="text-purple-600">Confidence</span>
                      </div>
                      <div className="text-[10px] text-purple-600/60 mt-0.5">AI生成</div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs min-w-[300px] bg-purple-50/50">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-purple-600" />
                        <span className="text-purple-600">Rationale</span>
                      </div>
                      <div className="text-[10px] text-purple-600/60 mt-0.5">AI生成</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping, index) => {
                    const isHighlighted = highlightedRowIndex === index;
                    return (
                      <tr
                        key={index}
                        className="border-b last:border-b-0 hover:bg-accent/30 transition-colors"
                        data-row-index={index}
                        style={isHighlighted ? {
                          backgroundColor: '#f0f0ff',
                          boxShadow: '0 2px 8px rgba(91, 95, 199, 0.2)',
                          borderLeft: '3px solid #5b5fc7',
                          borderRight: '3px solid #5b5fc7'
                        } : {}}
                      >
                        <td className="px-3 py-2 border-r text-xs text-muted-foreground sticky left-0 bg-card z-10">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2 border-r">
                          <div className="flex items-center gap-1.5">
                            {editedCells.has(`${index}-sourceSheetName`) && (
                              <Check className="size-3.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                            )}
                            <SearchableSelect
                              value={mapping.sourceSheetName}
                              onChange={(value) => updateMapping(index, 'sourceSheetName', value)}
                              options={getSourceSheetOptions(index)}
                              placeholder="选择表单"
                              searchPlaceholder="搜索表单..."
                              emptyText="未找到表单"
                              className="text-xs"
                              onViewDetail={() => handleJumpToCardView(index)}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r">
                          <div className="flex items-center gap-1.5">
                            {editedCells.has(`${index}-sourceColumnName`) && (
                              <Check className="size-3.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                            )}
                            <SearchableSelect
                              value={mapping.sourceColumnName}
                              onChange={(value) => updateMapping(index, 'sourceColumnName', value)}
                              options={getSourceColumnOptions(index, mapping.sourceSheetName)}
                              placeholder="选择字段"
                              searchPlaceholder="搜索字段..."
                              emptyText="未找到字段"
                              className="text-xs"
                              onViewDetail={() => handleJumpToCardView(index)}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r">
                          <div className="rounded px-2 py-1 text-xs font-mono" style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', color: '#6b7280' }}>
                            {mapping.standardSheetName}
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r">
                          <div className="rounded px-2 py-1 text-xs font-mono" style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', color: '#6b7280' }}>
                            {mapping.standardColumnName}
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r">
                          <div className="bg-muted/40 px-2 py-1 rounded text-xs min-h-[28px]">
                            {mapping.infoType || '-'}
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r">
                          <div className="bg-muted/40 px-2 py-1 rounded text-xs min-h-[28px]">
                            {mapping.note}
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r bg-purple-50/20">
                          <div className="bg-purple-100/40 px-2 py-1 rounded text-xs text-purple-700 font-mono">
                            {mapping.confidence}
                          </div>
                        </td>
                        <td className="px-3 py-2 bg-purple-50/20">
                          <div className="bg-purple-100/40 px-2 py-1 rounded text-xs text-purple-700">
                            {mapping.rationale}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {isGenerating && (
                    <tr className="bg-purple-50/10">
                      <td colSpan={10} className="px-3 py-4 text-center border-t">
                        <div className="flex items-center justify-center opacity-90">
                          <span className="text-sm font-medium shimmer-text">
                            正在从AI接收映射数据...
                          </span>
                        </div>
                        <style>
                          {`
                            .shimmer-text {
                                background: linear-gradient(90deg, #5b5fc7 0%, #9094ff 50%, #5b5fc7 100%);
                                background-size: 200% auto;
                                color: transparent;
                                -webkit-background-clip: text;
                                background-clip: text;
                                animation: shimmer 2s linear infinite;
                            }
                            @keyframes shimmer {
                              to { background-position: 200% center; }
                            }
                          `}
                        </style>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col" style={{ border: '1px solid #e5e7eb' }}>
            <div className="overflow-auto flex-1" ref={cardViewScrollRef}>
              <table className="w-full text-sm border-collapse min-w-max">
                <tbody>
                  <tr style={{ backgroundColor: '#fafafa' }}>
                    {mappings.map((mapping, index) => {
                      const isHighlighted = highlightedCardIndex === index;
                      return (
                        <td
                          key={index}
                          className={`px-4 py-3 min-w-[280px] max-w-[280px] align-top transition-all duration-300`}
                          style={{
                            borderRight: isHighlighted ? '3px solid #5b5fc7' : '1px solid #e5e7eb',
                            borderBottom: isHighlighted ? '3px solid #5b5fc7' : '1px solid #e5e7eb',
                            borderTop: isHighlighted ? '3px solid #5b5fc7' : 'none',
                            borderLeft: isHighlighted ? '3px solid #5b5fc7' : 'none',
                            backgroundColor: isHighlighted ? '#f0f0ff' : 'transparent',
                            boxShadow: isHighlighted ? '0 4px 12px rgba(91, 95, 199, 0.2)' : 'none'
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 gap-1"
                                onClick={() => handleJumpToTableView(index)}
                                title="返回表格视图"
                              >
                                <Table2 className="size-3 text-gray-600" />
                                <span className="text-xs text-gray-600">{index + 1}</span>
                              </Button>
                              <span className="text-xs font-mono font-medium" style={{ color: '#5b5fc7' }}>
                                置信度 {mapping.confidence}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={toggleDetails}
                              style={{ color: '#5b5fc7' }}
                            >
                              {isDetailsExpanded ? (
                                <ChevronDown className="size-3.5" />
                              ) : (
                                <ChevronRight className="size-3.5" />
                              )}
                            </Button>
                          </div>

                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="font-medium text-gray-600">源字段（只读）</span>
                          </div>

                          <div className="rounded px-3 py-2 font-mono text-sm" style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', color: '#6b7280' }}>
                            <span className="font-medium">{mapping.sourceSheetName}</span>
                            <span className="text-gray-400">.</span>
                            <span>{mapping.sourceColumnName}</span>
                          </div>

                          {isDetailsExpanded && (
                            <div className="space-y-2 pt-3 mt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">信息类型</div>
                                <div className="bg-white border rounded px-3 py-1.5 text-xs">
                                  {mapping.infoType || '-'}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-muted-foreground mb-1">备注</div>
                                <div className="border rounded px-3 py-1.5 text-xs" style={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d', color: '#92400e' }}>
                                  {mapping.note}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-muted-foreground mb-1">推理说明</div>
                                <div className="border rounded px-3 py-1.5 text-xs leading-relaxed" style={{ backgroundColor: '#faf5ff', borderColor: '#d8b4fe', color: '#6b21a8' }}>
                                  {mapping.rationale}
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  <tr style={{ backgroundColor: '#fafafa' }}>
                    {mappings.map((_, index) => (
                      <td
                        key={index}
                        className="px-4 py-1 text-center"
                        style={{ borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}
                      >
                        <ArrowDown className="size-4 mx-auto" style={{ color: '#5b5fc7' }} />
                      </td>
                    ))}
                  </tr>

                  <tr style={{ backgroundColor: '#fafafa' }}>
                    {mappings.map((mapping, index) => {
                      const standardColumnOptions = getStandardColumnOptionsWithUsage(index, mapping.standardSheetName);
                      const standardSheetOptions = getStandardSheetOptions();
                      return (
                        <td
                          key={index}
                          className="px-4 py-2.5"
                          style={{ borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}
                        >
                          <div className="flex items-center gap-1.5 mb-2">
                            <Edit3 className="size-3.5" style={{ color: '#5b5fc7' }} />
                            <span className="font-medium" style={{ color: '#5b5fc7' }}>标准字段（可修改）</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="text-xs text-muted-foreground mb-1">表单名称</div>
                              <div className="flex items-center gap-1.5">
                                {editedCells.has(`${index}-standardSheetName`) && (
                                  <Check className="size-3.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                                )}
                                <SearchableSelect
                                  value={mapping.standardSheetName}
                                  onChange={(value) => updateMapping(index, 'standardSheetName', value)}
                                  options={standardSheetOptions.map(s => ({ value: s, label: s }))}
                                  placeholder="选择表单"
                                  searchPlaceholder="搜索表单..."
                                  emptyText="未找到表单"
                                />
                              </div>
                            </div>

                            <span className="text-muted-foreground text-xs mt-5">.</span>

                            <div className="flex-[2]">
                              <div className="text-xs text-muted-foreground mb-1">字段名称</div>
                              <div className="flex items-center gap-1.5">
                                {editedCells.has(`${index}-standardColumnName`) && (
                                  <Check className="size-3.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                                )}
                                <SearchableSelect
                                  value={mapping.standardColumnName}
                                  onChange={(value) => updateMapping(index, 'standardColumnName', value)}
                                  options={standardColumnOptions}
                                  placeholder="选择字段"
                                  searchPlaceholder="搜索字段..."
                                  emptyText="未找到字段"
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    {mappings.map((_, index) => (
                      <td
                        key={index}
                        className="px-4 py-2"
                        style={{ borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Eye className="size-3.5" style={{ color: '#5b5fc7' }} />
                          <span className="text-sm font-medium" style={{ color: '#5b5fc7' }}>数据预览</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((rowIndex) => (
                    <tr key={`preview-${rowIndex}`} className="hover:bg-gray-50">
                      {mappings.map((mapping, mappingIndex) => {
                        const previewDataForMapping = previewData.get(`${mappingIndex}`) || [];
                        return (
                          <td
                            key={mappingIndex}
                            className="px-4 py-2"
                            style={{ borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-5 flex-shrink-0">{rowIndex + 1}</span>
                              <div className="flex-1 font-mono text-xs px-3 py-1.5 rounded" style={{ backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
                                {previewDataForMapping[rowIndex] || '-'}
                              </div>
                            </div>
                          </td>
                        );
                      })}
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