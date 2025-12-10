import { useState, useEffect } from 'react';
import { DatasetSelector } from './components/DatasetSelector';
import { FrameworkSelector } from './components/FrameworkSelector';
import { MappingEditorV2 } from './components/MappingEditorV2';
import { MappingChangeHistory } from './components/MappingChangeHistory';
import { HistoryView } from './components/HistoryView';
import { ExportPreview } from './components/ExportPreview';

import { getPredefinedMappings } from './data/predefinedMappings';
import { api } from './api';
import { toast } from 'sonner';

export interface Dataset {
  id: string;
  name: string;
  headers: string[];
  sheets: Sheet[];
}

export interface Sheet {
  name: string;
  columns: string[];
}

export interface Mapping {
  sourceSheetName: string;
  sourceColumnName: string;
  standardSheetName: string;
  standardColumnName: string;
  infoType: string;
  note: string;
  confidence: number;
  rationale: string;
}

export interface SavedMapping {
  id: string;
  datasetId: string;
  frameworkId: string;
  datasetName: string;
  mappings: Mapping[];
  savedAt: string;
}

export interface TargetFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  sheets: TargetSheet[];
}

export interface TargetSheet {
  sheetName: string;
  columnName: string;
  note: string;
}

export interface MappingChangeRecord {
  id: string;
  timestamp: string;
  datasetName: string;
  targetFramework: string; // 添加目标标准名称
  sourceSheetName: string;
  sourceColumnName: string;
  changeType: 'standardSheet' | 'standardColumn' | 'both';
  oldStandardSheetName: string;
  newStandardSheetName: string;
  oldStandardColumnName: string;
  newStandardColumnName: string;
  operator: string; // 操作者
}

export default function App() {
  const [currentStep, setCurrentStep] = useState<'selection' | 'framework' | 'mapping' | 'preview' | 'history' | 'changeHistory'>('selection');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<TargetFramework | null>(null);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [savedMappings, setSavedMappings] = useState<SavedMapping[]>([]);
  const [editingMappingId, setEditingMappingId] = useState<string | null>(null);
  const [changeHistory, setChangeHistory] = useState<MappingChangeRecord[]>([]);

  // API Integration
  const [allDatasets, setAllDatasets] = useState<Dataset[]>([]);
  const [allFrameworks, setAllFrameworks] = useState<TargetFramework[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingStream, setIsGeneratingStream] = useState(false);

  // Initial Data Load
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const datasets = await api.getDatasets();
        const frameworks = await api.getFrameworks();
        const history = await api.getSavedMappings();

        // Map dataset names for history
        const historyWithNames = history.map(h => {
          const ds = datasets.find(d => String(d.id) === String(h.datasetId));
          const fw = frameworks.find(f => String(f.id) === String(h.frameworkId));
          const displayName = ds
            ? (fw ? `${ds.name} (${fw.name})` : ds.name)
            : (h.datasetName && !h.datasetName.startsWith('Dataset #') ? h.datasetName : `Dataset #${h.datasetId}`);

          return {
            ...h,
            datasetName: displayName
          };
        });

        setAllDatasets(datasets);
        setAllFrameworks(frameworks);
        setSavedMappings(historyWithNames);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const handleSeedData = async () => {
    setIsLoading(true);
    // 重新定义一遍数据用于种子数据 (Mini version for demo)
    try {
      // Seed Frameworks
      const demoFrameworks = [
        {
          name: 'PV: Visualization',
          description: '临床试验数据可视化标准',
          version: 'v3.4',
          sheets: [
            { sheetName: 'AE', columnName: 'AESER', note: '是否严重不良事件' },
            { sheetName: 'DM', columnName: 'SUBJID', note: '受试者编号' }
          ]
        },
        {
          name: 'CD: RBM',
          description: 'Risk-Based Monitoring',
          version: 'v2.0',
          sheets: [
            { sheetName: 'AE', columnName: 'SFYZ', note: '是否严重' }
          ]
        }
      ];
      await api.seedFrameworks(demoFrameworks);

      // Seed Datasets
      await api.createDataset('Demo Dataset 1.xlsx', [
        { name: 'AE', columns: ['不良事件', '严重性', '开始日期'] },
        { name: 'DM', columns: ['受试者ID', '性别', '年龄'] }
      ]);

      // Reload
      const datasets = await api.getDatasets();
      const frameworks = await api.getFrameworks();
      setAllDatasets(datasets);
      setAllFrameworks(frameworks);
    } catch (e) {
      console.error("Seed failed", e);
      alert("Seed failed, check console");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMapping = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setEditingMappingId(null);
    setCurrentStep('framework');
  };

  const handleFrameworkSelected = async (framework: TargetFramework) => {
    setSelectedFramework(framework);

    if (!selectedDataset) return;

    // 尝试获取预定义映射 (Optional: keep for demo speed if matched)
    const predefinedMappings = getPredefinedMappings(selectedDataset.name, framework.id);

    if (predefinedMappings.length > 0) {
      setMappings(predefinedMappings);
      setCurrentStep('mapping');
      return;
    }

    // Call Backend AI Generation (Stream)
    setMappings([]); // Start clean
    setCurrentStep('mapping'); // Jump immediately
    setIsGeneratingStream(true);

    api.generateMappingStream(
      selectedDataset.id,
      framework.id,
      (data) => {
        if (data.type === 'start') {
          console.log("Stream started, mapping ID:", data.mapping_id);
          setEditingMappingId(String(data.mapping_id));
        } else if (data.type === 'data') {
          // Transform and append
          const newMappings: Mapping[] = data.entries.map((e: any) => ({
            sourceSheetName: e.source_sheet_name,
            sourceColumnName: e.source_column_name,
            standardSheetName: e.standard_sheet_name,
            standardColumnName: e.standard_column_name,
            infoType: e.info_type,
            note: e.note,
            confidence: e.confidence,
            rationale: e.rationale
          }));

          setMappings(prev => {
            // Avoid duplicates if needed, or just append
            // Since backend yields distinct chunks, appending is safe
            return [...prev, ...newMappings];
          });
        } else if (data.type === 'done') {
          console.log("Stream complete");
          setIsGeneratingStream(false);
          // Refresh history now that it's done
          api.getSavedMappings().then(history => {
            const historyWithNames = history.map(h => {
              const ds = allDatasets.find(d => String(d.id) === String(h.datasetId));
              const fw = allFrameworks.find(f => String(f.id) === String(h.frameworkId));
              const displayName = ds
                ? (fw ? `${ds.name} (${fw.name})` : ds.name)
                : (h.datasetName && !h.datasetName.startsWith('Dataset #') ? h.datasetName : `Dataset #${h.datasetId}`);
              return { ...h, datasetName: displayName };
            });
            setSavedMappings(historyWithNames);
          });
          toast.success("AI Mapping Generation Complete");
        } else if (data.type === 'error') {
          console.error("Stream reported error:", data.message);
          setIsGeneratingStream(false);
          toast.error(`Generation error: ${data.message}`);
        }
      },
      (err) => {
        console.error("Stream connection error", err);
        setIsGeneratingStream(false);
      }
    );
  };


  const handleBackToSelect = () => {
    setCurrentStep('select');
    setSelectedDataset(null);
    setMappings([]);
    setEditingMappingId(null);
  };

  const handleSaveMapping = async () => {
    if (!selectedDataset || !selectedFramework) return;
    try {
      if (editingMappingId) {
        await api.updateMapping(editingMappingId, String(selectedDataset.id), String(selectedFramework.id), mappings);
        toast.success("Mapping updated successfully");
      } else {
        await api.saveMapping(String(selectedDataset.id), String(selectedFramework.id), mappings);
        toast.success("Mapping saved successfully");
      }

      // Refresh history
      const history = await api.getSavedMappings();
      const historyWithNames = history.map(h => {
        const ds = allDatasets.find(d => String(d.id) === String(h.datasetId));
        const fw = allFrameworks.find(f => String(f.id) === String(h.frameworkId));
        const displayName = ds
          ? (fw ? `${ds.name} (${fw.name})` : ds.name)
          : (h.datasetName && !h.datasetName.startsWith('Dataset #') ? h.datasetName : `Dataset #${h.datasetId}`);
        return { ...h, datasetName: displayName };
      });
      setSavedMappings(historyWithNames);
      setCurrentStep('history');
    } catch (e) {
      console.error("Save failed", e);
      toast.error("Failed to save mapping");
    }
  };

  const handleViewHistory = () => {
    setCurrentStep('history');
  };

  const handleEditMapping = (savedMapping: SavedMapping) => {
    // We try to find dataset by ID first as name might default
    let dataset = allDatasets.find(d => d.id === savedMapping.datasetId);
    if (!dataset) {
      dataset = allDatasets.find(d => d.name === savedMapping.datasetName);
    }

    // Find framework
    let framework = allFrameworks.find(f => f.id === savedMapping.frameworkId);

    if (dataset) {
      setSelectedDataset(dataset);
      if (framework) setSelectedFramework(framework);
      setMappings([...savedMapping.mappings]);
      setEditingMappingId(savedMapping.id);
      setCurrentStep('mapping');
    } else {
      toast.error("Could not find linked dataset.");
    }
  };

  const handleDeleteMapping = async (id: string) => {
    try {
      await api.deleteMapping(id);
      setSavedMappings(prev => prev.filter(m => m.id !== id));
      toast.success("记录已删除");
    } catch (e) {
      console.error("删除失败", e);
      toast.error("删除失败");
    }
  };

  const handlePreviewExport = () => {
    setCurrentStep('preview');
  };

  const handleViewChangeHistory = () => {
    setCurrentStep('changeHistory');
  };

  // 记录映射修改
  const handleRecordChange = (
    sourceSheetName: string,
    sourceColumnName: string,
    oldStandardSheetName: string,
    newStandardSheetName: string,
    oldStandardColumnName: string,
    newStandardColumnName: string
  ) => {
    if (!selectedDataset) return;

    // 判断修改类型
    let changeType: 'standardSheet' | 'standardColumn' | 'both';
    if (oldStandardSheetName !== newStandardSheetName && oldStandardColumnName !== newStandardColumnName) {
      changeType = 'both';
    } else if (oldStandardSheetName !== newStandardSheetName) {
      changeType = 'standardSheet';
    } else {
      changeType = 'standardColumn';
    }

    const newRecord: MappingChangeRecord = {
      id: `change-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      datasetName: selectedDataset.name,
      targetFramework: selectedFramework?.name || '未知标准',
      sourceSheetName,
      sourceColumnName,
      changeType,
      oldStandardSheetName,
      newStandardSheetName,
      oldStandardColumnName,
      newStandardColumnName,
      operator: '当前用户' // 可以扩展为实际的用户信息
    };

    setChangeHistory(prev => [newRecord, ...prev]);
  };

  return (
    <div className="min-h-screen">
      {currentStep === 'selection' && (
        <>
          <DatasetSelector
            datasets={allDatasets}
            onGenerateMapping={handleGenerateMapping}
            onViewHistory={() => setCurrentStep('history')}
            historyCount={savedMappings.length}
          />
          {allDatasets.length === 0 && !isLoading && (
            <div className="fixed bottom-4 right-4">
              <button
                onClick={handleSeedData}
                className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700"
              >
                Initialize Demo Data
              </button>
            </div>
          )}
        </>
      )}

      {currentStep === 'framework' && selectedDataset && (
        <FrameworkSelector
          dataset={selectedDataset}
          frameworks={allFrameworks}
          onFrameworkSelected={handleFrameworkSelected}
          onBack={() => setCurrentStep('selection')}
          onViewHistory={(frameworkId) => {
            // Temporarily set selected framework for context filter if provided
            if (frameworkId) {
              const fw = allFrameworks.find(f => f.id === frameworkId);
              if (fw) setSelectedFramework(fw);
            }
            setCurrentStep('history');
          }}
        />
      )}

      {currentStep === 'mapping' && selectedDataset && (
        <MappingEditorV2
          dataset={selectedDataset}
          mappings={mappings}
          targetFields={[]}
          targetFramework={selectedFramework}
          onMappingsChange={setMappings}
          onBack={() => setCurrentStep('framework')}
          onSave={handleSaveMapping}
          isEditing={!!editingMappingId}
          isGenerating={isGeneratingStream}
          onPreviewExport={handlePreviewExport}
          onRecordChange={handleRecordChange}
        />
      )}

      {currentStep === 'preview' && selectedDataset && (
        <ExportPreview
          dataset={selectedDataset}
          mappings={mappings}
          onBack={() => setCurrentStep('mapping')}
        />
      )}

      {currentStep === 'history' && (
        <HistoryView
          savedMappings={savedMappings}
          onBack={() => {
            // Return to appropriate step based on context
            if (selectedFramework) {
              setCurrentStep('framework');
            } else if (selectedDataset) {
              setCurrentStep('selection'); // Or stay in selection context
            } else {
              setCurrentStep('selection');
            }
          }}
          onEdit={handleEditMapping}
          onDelete={handleDeleteMapping}
          onViewChangeHistory={handleViewChangeHistory}
          filterDatasetId={selectedDataset?.id}
          filterFrameworkId={selectedFramework?.id}
        />
      )}
      {currentStep === 'changeHistory' && (
        <MappingChangeHistory
          changeHistory={changeHistory}
          onBack={() => setCurrentStep('history')}
        />
      )}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}