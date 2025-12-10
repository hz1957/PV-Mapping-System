import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Database, ChevronRight, History, Search, Loader2, FileText, Eye, Table } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from './ui/dialog';
import type { Dataset } from '../App';

interface DatasetSelectorProps {
  datasets: Dataset[];
  onGenerateMapping: (dataset: Dataset) => void;
  onViewHistory: () => void;
  historyCount: number;
}

export function DatasetSelector({ datasets, onGenerateMapping, onViewHistory, historyCount }: DatasetSelectorProps) {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [viewingDataset, setViewingDataset] = useState<Dataset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedDatasets, setDisplayedDatasets] = useState<Dataset[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 15;

  // 搜索过滤
  const filteredDatasets = datasets.filter(dataset => {
    const query = searchQuery.toLowerCase();
    return (
      dataset.name.toLowerCase().includes(query) ||
      dataset.headers.some(header => header.toLowerCase().includes(query))
    );
  });

  // 加载更多数据
  const loadMore = () => {
    if (isLoading) return;

    setIsLoading(true);
    // 模拟加载延迟
    setTimeout(() => {
      const start = 0;
      const end = (page + 1) * PAGE_SIZE;
      const newDatasets = filteredDatasets.slice(start, end);
      setDisplayedDatasets(newDatasets);
      setPage(prev => prev + 1);
      setIsLoading(false);
    }, 300);
  };

  // 初始化和搜索时重置
  useEffect(() => {
    setPage(1);
    setDisplayedDatasets(filteredDatasets.slice(0, PAGE_SIZE));
  }, [searchQuery, datasets]);

  // 无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && displayedDatasets.length < filteredDatasets.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [displayedDatasets, filteredDatasets]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="size-6 text-primary" />
            <h1 className="text-lg">数据集映射工具</h1>
          </div>
          <Button variant="outline" size="sm" onClick={onViewHistory} className="gap-2">
            <History className="size-4" />
            历史记录
            {historyCount > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {historyCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="mb-4">
          <h2 className="text-base">选择数据集</h2>
          <p className="text-sm text-muted-foreground mt-1">
            从已上传的数据集中选择一个进行映射
          </p>
        </div>

        <div className="bg-card rounded-lg border">
          <div className="p-6">
            {/* 搜索框 */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="搜索数据集名称或字段..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                找到 {filteredDatasets.length} 个数据集
                {searchQuery && ` (搜索: "${searchQuery}")`}
              </div>
            </div>

            {/* 数据集列表 */}
            <div className="max-h-[calc(100vh-340px)] overflow-y-auto">
              {displayedDatasets.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Database className="size-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    {searchQuery ? '未找到匹配的数据集' : '暂无数据集'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {displayedDatasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      onClick={() => setSelectedDataset(dataset)}
                      className={`p-4 border rounded-md cursor-pointer transition-all ${selectedDataset?.id === dataset.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30 hover:bg-accent/50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-0.5 flex-shrink-0">
                            <Database className="size-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-1 text-sm font-medium truncate">{dataset.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              包含 {dataset.sheets.length} 个表单: {dataset.sheets.map(s => s.name).join(', ')}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <FileText className="size-3" />
                              共 {dataset.headers.length} 个字段
                            </div>
                          </div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingDataset(dataset);
                              }}
                              className="gap-1 h-7 ml-2 hover:bg-background flex-shrink-0"
                            >
                              <Eye className="size-3" />
                              查看详情
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Database className="size-5 text-primary" />
                                数据集详情
                              </DialogTitle>
                              <DialogDescription className="text-sm text-muted-foreground">
                                详细查看数据集的表单和字段结构
                              </DialogDescription>
                            </DialogHeader>

                            <div className="mb-4 px-6 pb-4 border-b -mx-6">
                              <div className="flex items-start gap-2 px-6">
                                <FileText className="size-4 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">{dataset.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    ID: {dataset.id} | 共 {dataset.sheets.length} 个工作表 | 总计 {dataset.headers.length} 个字段
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                              <div className="border rounded-lg overflow-hidden flex-1 min-h-0 flex flex-col bg-white">
                                <div className="overflow-y-auto flex-1">
                                  <table className="w-full border-collapse min-w-[600px]">
                                    <thead className="sticky top-0 z-10 shadow-sm">
                                      <tr className="border-b" style={{ backgroundColor: '#f3f4f6' }}>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground border-r w-16 bg-[#f3f4f6]">
                                          序号
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground border-r w-[200px] bg-[#f3f4f6]">
                                          工作表名称
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground bg-[#f3f4f6]">
                                          字段名称
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {dataset.sheets.map((sheet: any, sheetIndex: number) => {
                                        // Infer columns from rows if explicit columns are missing
                                        let cols = sheet.columns && sheet.columns.length > 0 ? sheet.columns : [];
                                        if (cols.length === 0 && sheet.rows && sheet.rows.length > 0 && sheet.rows[0].data) {
                                          cols = Object.keys(sheet.rows[0].data);
                                        }

                                        const rowCount = Math.max(cols.length, 1);

                                        return (
                                          <>
                                            {/* First Row of the Sheet Group */}
                                            <tr key={`sheet-${sheetIndex}-0`} className="border-b hover:bg-gray-50/50">
                                              <td
                                                className="px-4 py-3 border-r text-xs text-muted-foreground align-top bg-white"
                                                rowSpan={rowCount}
                                              >
                                                {sheetIndex + 1}
                                              </td>
                                              <td
                                                className="px-4 py-3 border-r text-sm font-medium align-top bg-white"
                                                rowSpan={rowCount}
                                              >
                                                <div className="sticky top-12 flex items-center gap-2">
                                                  <Table className="size-4 text-muted-foreground flex-shrink-0" />
                                                  <span className="break-words">{sheet.name}</span>
                                                </div>
                                              </td>

                                              {cols.length > 0 ? (
                                                <td className="px-4 py-2 text-xs font-mono text-foreground align-middle">
                                                  {cols[0]}
                                                </td>
                                              ) : (
                                                <td className="px-4 py-2 text-xs text-muted-foreground italic align-middle">
                                                  (无字段)
                                                </td>
                                              )}
                                            </tr>

                                            {/* Remaining Columns */}
                                            {cols.slice(1).map((col: string, colIdx: number) => (
                                              <tr key={`sheet-${sheetIndex}-${colIdx + 1}`} className="border-b hover:bg-gray-50/50">
                                                <td className="px-4 py-2 text-xs font-mono text-foreground align-middle">
                                                  {col}
                                                </td>
                                              </tr>
                                            ))}
                                          </>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 加载指示器 - 放在列表容器内，但在 map 之外 */}
              {displayedDatasets.length < filteredDatasets.length && (
                <div ref={observerTarget} className="py-4 flex justify-center">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      加载中...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 底部操作 */}
            <div className="flex justify-between items-center pt-4 border-t mt-auto">
              <div className="text-sm text-muted-foreground">
                {selectedDataset && `已选择: ${selectedDataset.name}`}
              </div>
              <Button
                onClick={() => selectedDataset && onGenerateMapping(selectedDataset)}
                disabled={!selectedDataset}
              >
                下一步
                <ChevronRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}