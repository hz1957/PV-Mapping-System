
import os
import pandas as pd
from sqlalchemy.orm import Session
from . import models, database

# Force drop tables to apply new schema (Quick and dirty for dev)
def reset_db():
    print("Resetting database schema...")
    models.Base.metadata.drop_all(bind=database.engine)
    models.Base.metadata.create_all(bind=database.engine)

def seed_data_from_excels():
    reset_db()
    
    db = database.SessionLocal()
    excels_root = os.path.join(os.path.dirname(os.path.dirname(__file__)), "excels") # backend/excels
    
    if not os.path.exists(excels_root):
        print(f"Error: {excels_root} does not exist.")
        return

    try:
        imp_dirs = [d for d in os.listdir(excels_root) if os.path.isdir(os.path.join(excels_root, d)) and d.upper().startswith("IMP")]
        
        for imp_dir in imp_dirs:
            print(f"Processing {imp_dir}...")
            imp_path = os.path.join(excels_root, imp_dir)
            
            # 1. Processing Source (Datasets) - Now storing ROWS
            source_path = os.path.join(imp_path, "Source")
            if os.path.exists(source_path):
                for file in os.listdir(source_path):
                    if not file.endswith((".xlsx", ".xls")):
                        continue
                        
                    file_path = os.path.join(source_path, file)
                    dataset_name = f"{imp_dir}: {file}"
                    
                    print(f"  Importing Dataset: {dataset_name}")
                    dataset = models.Dataset(name=dataset_name)
                    db.add(dataset)
                    db.commit()
                    db.refresh(dataset)
                    
                    try:
                        # Read all sheets with data
                        # Handle NaNs: fillna(None) or replace with "" because JSON doesn't like NaN
                        
                        xls = pd.ExcelFile(file_path)
                        for sheet_name in xls.sheet_names:
                            df = pd.read_excel(xls, sheet_name=sheet_name)
                            # Convert NaNs to None/Null for JSON compatibility
                            # Also handle inf/-inf just in case
                            df = df.where(pd.notnull(df), None)
                            
                            import numpy as np
                            from datetime import datetime, date, time

                            def clean_for_json(data):
                                """Recursively clean dictionary values for JSON compatibility."""
                                if isinstance(data, dict):
                                    return {k: clean_for_json(v) for k, v in data.items()}
                                elif isinstance(data, list):
                                    return [clean_for_json(v) for v in data]
                                elif isinstance(data, float):
                                    if pd.isna(data) or np.isinf(data):
                                        return None
                                    return data
                                elif isinstance(data, (datetime, date, time)):
                                    return str(data)
                                elif pd.isna(data): # Handle NaT or other pandas nulls
                                    return None
                                return data
                            
                            ds_sheet = models.DatasetSheet(dataset_id=dataset.id, name=sheet_name)
                            db.add(ds_sheet)
                            db.commit()
                            db.refresh(ds_sheet)
                            
                            # Bulk insert rows
                            rows_data = []
                            for idx, row in df.iterrows():
                                # Convert row to dict, simple and stupid
                                row_dict = row.to_dict()
                                # Clean data
                                row_dict = clean_for_json(row_dict)
                                
                                rows_data.append(models.DatasetRow(
                                    sheet_id=ds_sheet.id,
                                    row_index=idx,
                                    data=row_dict
                                ))
                                
                                # Batch commit every 1000 rows
                                if len(rows_data) >= 1000:
                                    db.bulk_save_objects(rows_data)
                                    db.commit()
                                    rows_data = []

                            if rows_data:
                                db.bulk_save_objects(rows_data)
                                db.commit()
                                
                    except Exception as e:
                        print(f"    Error reading source excel {file}: {e}")
                        import traceback
                        traceback.print_exc()

            # 2. Processing Frameworks - Using "数据源定位" sheet
            mapping_path = os.path.join(imp_path, "Mapping")
            if os.path.exists(mapping_path):
                 for file in os.listdir(mapping_path):
                    if not file.endswith((".xlsx", ".xls")):
                        continue
                    
                    file_path = os.path.join(mapping_path, file)
                    framework_name = f"{imp_dir}: {file}"
                    
                    print(f"  Importing Framework: {framework_name}")
                    framework = models.Framework(
                        name=framework_name, 
                        version="1.0", 
                        description=f"Imported from {file}"
                    )
                    db.add(framework)
                    db.commit()
                    db.refresh(framework)
                    
                    try:
                        # Specifically look for '数据源定位' sheet
                        target_sheet = "数据源定位"
                        
                        xls = pd.ExcelFile(file_path)
                        if target_sheet not in xls.sheet_names:
                            print(f"    Warning: Sheet '{target_sheet}' not found in {file}. Skipping.")
                            continue
                            
                        df = pd.read_excel(xls, sheet_name=target_sheet)
                        df = df.where(pd.notnull(df), None)
                        
                        # Expected columns based on user investigation:
                        # Target_SheetName, Target_ColumnName, Standard_ColumnName, Standard_SheetName, 信息类型, 备注
                        
                        for _, row in df.iterrows():
                            # Flexible column lookup
                            s_sheet = row.get('Standard_SheetName') or row.get('Standard Sheet')
                            s_col = row.get('Standard_ColumnName') or row.get('Standard Column') 
                            info = row.get('信息类型') or row.get('Info Type')
                            note = row.get('备注') or row.get('Note')
                            
                            # Standard columns are mandatory to define the framework
                            if s_sheet and s_col:
                                db.add(models.FrameworkSheet(
                                    framework_id=framework.id,
                                    standard_sheet_name=str(s_sheet),
                                    standard_column_name=str(s_col),
                                    info_type=str(info) if info else None,
                                    note=str(note) if note else None
                                ))
                        
                        db.commit()
                             
                    except Exception as e:
                        print(f"    Error reading mapping excel {file}: {e}")
                        import traceback
                        traceback.print_exc()

        print("Import Complete!")

    except Exception as e:
        print(f"Global Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data_from_excels()
