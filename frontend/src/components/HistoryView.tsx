import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { SavedMapping } from '../App';
import { ArrowLeft, Edit2, Trash2, History, Search, FileClock, ChevronRight } from 'lucide-react';

interface HistoryViewProps {
    savedMappings: SavedMapping[];
    onBack: () => void;
    onEdit: (mapping: SavedMapping) => void;
    onDelete: (id: string) => void;
    onViewChangeHistory?: () => void;
    filterDatasetId?: string;
    filterFrameworkId?: string;
}

export function HistoryView({ savedMappings, onBack, onEdit, onDelete, onViewChangeHistory, filterDatasetId, filterFrameworkId }: HistoryViewProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMappings = savedMappings.filter(m => {
        // First Apply context filters
        if (filterDatasetId && m.datasetId !== filterDatasetId) return false;
        if (filterFrameworkId && m.frameworkId !== filterFrameworkId) return false;

        // Then apply search
        return m.datasetName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onBack} size="sm" className="gap-1">
                            <ArrowLeft className="size-4" />
                            返回
                        </Button>
                        <div className="h-6 w-px bg-border" />
                        <h1 className="text-lg">映射历史记录</h1>
                    </div>
                    {onViewChangeHistory && (
                        <Button variant="outline" onClick={onViewChangeHistory} size="sm">
                            <History className="mr-2 size-4" />
                            更改日志
                        </Button>
                    )}
                </div>
            </div>

            <div className="px-6 py-6">
                <div className="mb-4">
                    <h2 className="text-base">已保存映射</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        查看和管理已保存的映射配置
                        {(filterDatasetId || filterFrameworkId) && " (当前已根据上下文筛选)"}
                    </p>
                </div>

                <div className="bg-card rounded-lg border">
                    <div className="p-6">
                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="搜索数据集名称..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9"
                                />
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                找到 {filteredMappings.length} 条记录
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[calc(100vh-340px)] overflow-y-auto space-y-3">
                            {filteredMappings.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    <FileClock className="size-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">暂无保存的映射记录</p>
                                </div>
                            ) : (
                                filteredMappings.map((mapping) => (
                                    <div
                                        key={mapping.id}
                                        className="p-4 border rounded-md hover:border-primary/30 hover:bg-accent/50 transition-all bg-card"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    <FileClock className="size-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium">{mapping.datasetName}</h3>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        保存时间: {new Date(mapping.savedAt).toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        包含 {mapping.mappings.length} 个映射字段
                                                    </div>

                                                    {/* Mapping Preview Pills */}
                                                    <div className="mt-3 flex gap-2 flex-wrap">
                                                        {mapping.mappings.slice(0, 3).map((m, idx) => (
                                                            <div key={idx} className="flex items-center text-[10px] px-2 py-0.5 bg-muted rounded text-muted-foreground border">
                                                                <span className="max-w-[80px] truncate">{m.sourceColumnName}</span>
                                                                <span className="mx-1">→</span>
                                                                <span className="max-w-[80px] truncate font-medium text-foreground">{m.standardColumnName}</span>
                                                            </div>
                                                        ))}
                                                        {mapping.mappings.length > 3 && (
                                                            <div className="text-[10px] px-2 py-0.5 bg-muted rounded text-muted-foreground border">
                                                                +{mapping.mappings.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onEdit(mapping)}
                                                    className="h-8"
                                                >
                                                    <Edit2 className="size-3 mr-1" />
                                                    编辑
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm('确定要删除这条映射记录吗？')) {
                                                            onDelete(mapping.id);
                                                        }
                                                    }}
                                                    className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="size-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
