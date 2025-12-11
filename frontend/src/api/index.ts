
import { Dataset, Mapping, SavedMapping, TargetFramework } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types matching backend response
interface BackendDataset {
    id: number;
    name: string;
    sheets: {
        name: string;
        rows: {
            row_index: number;
            data: Record<string, any>;
        }[];
    }[];
}

interface BackendFramework {
    id: number;
    name: string;
    version: string;
    description: string;
    sheets: {
        standard_sheet_name: string;
        standard_column_name: string;
        info_type?: string;
        note?: string;
    }[];
}

interface BackendMapping {
    id: number;
    dataset_id: number;
    framework_id: number;
    saved_at: string;
    entries: any[];
}

export const api = {
    // Datasets
    getDatasets: async (): Promise<Dataset[]> => {
        const response = await fetch(`${API_BASE_URL}/datasets/`);
        if (!response.ok) throw new Error('Failed to fetch datasets');
        try {
            const data: BackendDataset[] = await response.json();
            // Transform to frontend format
            return data.map(d => {
                const sheetInfos = d.sheets.map(s => {
                    const allKeys = new Set<string>();
                    if (s.rows.length > 0 && s.rows[0].data) {
                        Object.keys(s.rows[0].data).forEach(k => allKeys.add(k));
                    }
                    return {
                        name: s.name,
                        columns: Array.from(allKeys)
                    };
                });

                return {
                    id: d.id.toString(),
                    name: d.name,
                    headers: sheetInfos.flatMap(s => s.columns),
                    sheets: sheetInfos
                };
            });
        } catch (e) {
            console.error("Error parsing datasets", e);
            return [];
        }
    },

    createDataset: async (name: string, sheets: { name: string, columns: string[] }[]): Promise<Dataset> => {
        // NOTE: The current backend CREATE endpoint might not support creating from columns-only anymore
        // because it expects rows. This function might need to be deprecated or updated to send dummy rows.
        // For now, let's keep it but be aware it might fail if backend enforces row structure.
        // Actually, backend 'create_dataset' in crud.py was NOT updated to create rows, 
        // it creates Dataset/DatasetSheet but no DatasetRow.
        // So this might just create empty sheets, which is 'fine' for now.

        const payload = {
            name,
            sheets: sheets.map(s => ({
                name: s.name,
                rows: [] // No rows created manually yet
            }))
        };

        const response = await fetch(`${API_BASE_URL}/datasets/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Failed to create dataset: ${err}`);
        }
        // ... return simplified
        return {
            id: "0", name: name, headers: [], sheets: []
        };
    },

    // Frameworks
    getFrameworks: async (): Promise<TargetFramework[]> => {
        const response = await fetch(`${API_BASE_URL}/frameworks/`);
        if (!response.ok) throw new Error('Failed to fetch frameworks');
        const data: BackendFramework[] = await response.json();

        return data.map(f => ({
            id: f.id.toString(),
            name: f.name,
            description: f.description,
            version: f.version,
            sheets: f.sheets.map(s => ({
                sheetName: s.standard_sheet_name,
                columnName: s.standard_column_name,
                note: s.note || ''
            }))
        }));
    },

    createFramework: async (framework: any): Promise<TargetFramework> => {
        return {} as any;
    },

    // Seed Frameworks helper
    seedFrameworks: async (frameworks: any[]) => {
        for (const f of frameworks) {
            const payload = {
                name: f.name,
                version: f.version,
                description: f.description,
                sheets: f.sheets.map((s: any) => ({
                    standard_sheet_name: s.sheetName,
                    standard_column_name: s.columnName,
                    note: s.note
                }))
            };
            await fetch(`${API_BASE_URL}/frameworks/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }
    },

    // Mappings
    saveMapping: async (datasetId: string, frameworkId: string, mappings: Mapping[]): Promise<void> => {
        const payload = {
            dataset_id: parseInt(datasetId),
            framework_id: parseInt(frameworkId),
            entries: mappings.map(m => ({
                source_sheet_name: m.sourceSheetName,
                source_column_name: m.sourceColumnName,
                standard_sheet_name: m.standardSheetName,
                standard_column_name: m.standardColumnName,
                info_type: m.infoType,
                note: m.note,
                confidence: m.confidence,
                rationale: m.rationale
            }))
        };
        const response = await fetch(`${API_BASE_URL}/mappings/${datasetId}/${frameworkId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to save mapping');
    },

    updateMapping: async (mappingId: string, datasetId: string, frameworkId: string, mappings: Mapping[]): Promise<void> => {
        const payload = {
            dataset_id: parseInt(datasetId),
            framework_id: parseInt(frameworkId),
            entries: mappings.map(m => ({
                source_sheet_name: m.sourceSheetName,
                source_column_name: m.sourceColumnName,
                standard_sheet_name: m.standardSheetName,
                standard_column_name: m.standardColumnName,
                info_type: m.infoType,
                note: m.note,
                confidence: m.confidence,
                rationale: m.rationale
            }))
        };
        const response = await fetch(`${API_BASE_URL}/mappings/${mappingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update mapping');
    },

    deleteMapping: async (mappingId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/mappings/${mappingId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete mapping');
    },

    generateMappingStream: (datasetId: string, frameworkId: string, onMessage: (event: any) => void, onError: (err: any) => void) => {
        const url = `${API_BASE_URL}/mappings/generate/stream?dataset_id=${datasetId}&framework_id=${frameworkId}`;
        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
                if (data.type === 'done' || data.type === 'error') {
                    eventSource.close();
                }
            } catch (e) {
                console.error("Failed to parse SSE", e);
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE Error", err);
            onError(err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    },



    getSavedMappings: async (): Promise<SavedMapping[]> => {
        const response = await fetch(`${API_BASE_URL}/mappings/`);
        if (!response.ok) throw new Error('Failed to fetch mappings');
        const data: BackendMapping[] = await response.json();

        // We need dataset name, we can fetch all datasets and map, or rely on backend to include it.
        // For now, let's fetch datasets to generic lookup map
        // This is a bit inefficient (N+1), but simple for now. 
        // Ideally backend returns expanded data.

        // Let's simplified rely on the fact we probably have datasets loaded
        return data.map(m => ({
            id: m.id.toString(),
            datasetId: m.dataset_id.toString(), // Add this
            frameworkId: m.framework_id.toString(), // Add this
            datasetName: `Dataset #${m.dataset_id}`, // Placeholder until we match with loaded datasets
            savedAt: m.saved_at,
            mappings: m.entries.map((e: any) => ({
                sourceSheetName: e.source_sheet_name,
                sourceColumnName: e.source_column_name,
                standardSheetName: e.standard_sheet_name,
                standardColumnName: e.standard_column_name,
                infoType: e.info_type,
                note: e.note,
                confidence: e.confidence,
                rationale: e.rationale
            }))
        }));
    },
    getDatasetColumnPreview: async (datasetId: string, sheetName: string, columnName: string, limit: number = 10): Promise<string[]> => {
        const response = await fetch(`${API_BASE_URL}/datasets/${datasetId}/preview/${sheetName}/${columnName}?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch column preview');
        return response.json();
    },
};
