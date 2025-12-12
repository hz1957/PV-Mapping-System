import { useState } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, ChevronRight, Eye, FileCheck2, Info, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import type { Dataset, TargetFramework } from '../App';

interface FrameworkSelectorProps {
  dataset: Dataset;
  frameworks: TargetFramework[];
  onFrameworkSelected: (framework: TargetFramework) => void;
  onBack: () => void;
  onViewHistory?: (frameworkId?: string) => void;
}

export function FrameworkSelector({
  dataset,
  frameworks,
  onFrameworkSelected,
  onBack,
  onViewHistory,
}: FrameworkSelectorProps) {
  const [selectedFramework, setSelectedFramework] = useState<TargetFramework | null>(null);
  const [viewingFramework, setViewingFramework] = useState<TargetFramework | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirm = () => {
    if (selectedFramework) {
      onFrameworkSelected(selectedFramework);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onBack} size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              返回
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg">选择目标标准</h1>
            <span className="text-sm text-muted-foreground">
              {dataset.name}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="mb-4">
          <h2 className="text-base">目标映射标准</h2>
          <p className="text-sm text-muted-foreground mt-1">
            选择一个标准，系统将自动生成数据集到该标准的映射关系
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {frameworks.map((framework) => (
            <div
              key={framework.id}
              onClick={() => setSelectedFramework(framework)}
              className={`p-5 border rounded-lg cursor-pointer transition-all ${selectedFramework?.id === framework.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/30 hover:bg-accent/50'
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="size-5 text-primary" />
                  <h3 className="font-medium">{framework.name}</h3>
                </div>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                  {framework.version}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {framework.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  包含 {framework.sheets.length} 个字段定义
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingFramework(framework);
                      }}
                      className="gap-1 h-7"
                    >
                      <Eye className="size-3" />
                      查看详情
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <FileCheck2 className="size-5 text-primary" />
                        标准详情
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        详细查看标准的字段定义和描述
                      </DialogDescription>
                    </DialogHeader>

                    <div className="mb-4 px-6 pb-4 border-b">
                      <div className="flex items-start gap-2">
                        <Info className="size-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm">{framework.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            版本: {framework.version} | 共 {framework.sheets.length} 个字段
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden px-6 flex flex-col">
                      <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
                        <div className="overflow-auto flex-1">
                          <table className="w-full border-collapse min-w-[700px]">
                            <thead className="sticky top-0 z-10 shadow-sm">
                              <tr className="border-b" style={{ backgroundColor: '#f3f4f6' }}>
                                <th className="px-3 py-2.5 text-left text-xs text-muted-foreground border-r w-12 bg-[#f3f4f6]">
                                  序号
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs text-muted-foreground border-r min-w-[120px] bg-[#f3f4f6]">
                                  Standard_SheetName
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs text-muted-foreground border-r min-w-[200px] bg-[#f3f4f6]">
                                  Standard_ColumnName
                                </th>
                                <th className="px-3 py-2.5 text-left text-xs text-muted-foreground min-w-[250px] bg-[#f3f4f6]">
                                  备注
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {framework.sheets.map((sheet, index) => (
                                <tr
                                  key={index}
                                  className="border-b last:border-b-0 hover:bg-accent/30"
                                >
                                  <td className="px-3 py-2.5 border-r text-xs text-muted-foreground">
                                    {index + 1}
                                  </td>
                                  <td className="px-3 py-2.5 border-r text-xs">
                                    {sheet.sheetName}
                                  </td>
                                  <td className="px-3 py-2.5 border-r text-xs font-mono">
                                    {sheet.columnName}
                                  </td>
                                  <td className="px-3 py-2.5 text-xs">
                                    {sheet.note}
                                  </td>
                                </tr>
                              ))}
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

        <div className="flex justify-between items-center pt-4 border-t bg-card p-6 rounded-lg">
          <div className="text-sm text-muted-foreground flex items-center gap-4">
            {selectedFramework ? (
              <span>
                已选择: <span className="text-foreground font-medium">{selectedFramework.name}</span>
              </span>
            ) : (
              '请选择一个目标标准'
            )}

            {onViewHistory && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewHistory && onViewHistory(selectedFramework?.id)}
                className="text-xs"
                disabled={!selectedFramework}
              >
                查看历史记录
              </Button>
            )}
          </div>
          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={!selectedFramework}
            className="gap-2"
          >
            <Sparkles className="size-4" />
            生成映射
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认开始生成映射？</AlertDialogTitle>
            <AlertDialogDescription>
              即将开始为数据集 <strong>{dataset.name}</strong> 生成对应 <strong>{selectedFramework?.name}</strong> 标准的字段映射。
              <br /><br />
              此过程将使用 AI 进行分析，可能需要几分钟时间。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-primary hover:bg-primary/90">
              开始生成
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}