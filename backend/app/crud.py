from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from . import models, schemas

# --- Datasets ---

def get_datasets(db: Session, skip: int = 0, limit: int = 100):
    # Optimize: Don't load all rows for the list view, just metadata if possible.
    # But since 'sheets' is default loaded, we might need to be careful.
    # Pydantic schema default for 'sheets' is [], so it might be okay.
    return db.query(models.Dataset).offset(skip).limit(limit).all()

def get_dataset(db: Session, dataset_id: int):
    # Eager load sheets -> rows might be too heavy?
    # For now, let's trust lazy loading or default relationship loading.
    return db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()

def create_dataset(db: Session, dataset: schemas.DatasetCreate):
    db_dataset = models.Dataset(name=dataset.name)
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    # Note: sheets/rows creation is complex, usually handled by seed script or specialized upload endpoint.
    return db_dataset

def get_dataset_column_sample(db: Session, dataset_id: int, sheet_name: str, column_name: str, limit: int = 10):
    # 1. Find the sheet
    sheet = db.query(models.DatasetSheet).filter(
        models.DatasetSheet.dataset_id == dataset_id,
        models.DatasetSheet.name == sheet_name
    ).first()
    
    if not sheet:
        return []

    # 2. Query rows and extract JSON value
    # Utilizing JSON access in SQL (PostgreSQL/SQLite dependent, but here using Python side for safety/simplicity)
    # Fetch more rows than limit to ensure distinctness
    rows = db.query(models.DatasetRow).filter(
        models.DatasetRow.sheet_id == sheet.id
    ).limit(500).all()
    
    distinct_values = set()
    result = []
    
    for row in rows:
        val = row.data.get(column_name)
        if val is not None:
            s_val = str(val).strip()
            if s_val and s_val not in distinct_values:
                distinct_values.add(s_val)
                result.append(s_val)
                if len(result) >= limit:
                    break
                    
    return result



# --- Frameworks ---

def get_frameworks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Framework).offset(skip).limit(limit).all()

def get_framework(db: Session, framework_id: int):
    return db.query(models.Framework).filter(models.Framework.id == framework_id).first()

def create_framework(db: Session, framework: schemas.FrameworkCreate):
    db_framework = models.Framework(
        name=framework.name, 
        version=framework.version, 
        description=framework.description
    )
    db.add(db_framework)
    db.commit()
    db.refresh(db_framework)
    
    for sheet in framework.sheets:
        db_sheet = models.FrameworkSheet(
            framework_id=db_framework.id,
            standard_sheet_name=sheet.standard_sheet_name,
            standard_column_name=sheet.standard_column_name,
            target_sheet_name=sheet.target_sheet_name,
            target_column_name=sheet.target_column_name,
            info_type=sheet.info_type,
            note=sheet.note
        )
        db.add(db_sheet)
    
    db.commit()
    db.refresh(db_framework)
    return db_framework

# --- Mappings ---

def get_mappings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Mapping).offset(skip).limit(limit).all()

def create_mapping(db: Session, mapping: schemas.MappingCreate):
    db_mapping = models.Mapping(
        dataset_id=mapping.dataset_id,
        framework_id=mapping.framework_id
    )
    db.add(db_mapping)
    db.commit()
    db.refresh(db_mapping)
    
    for entry in mapping.entries:
        db_entry = models.MappingEntry(
            mapping_id=db_mapping.id,
            source_sheet_name=entry.source_sheet_name,
            source_column_name=entry.source_column_name,
            standard_sheet_name=entry.standard_sheet_name,
            standard_column_name=entry.standard_column_name,
            info_type=entry.info_type,
            note=entry.note,
            confidence=entry.confidence,
            rationale=entry.rationale
        )
        db.add(db_entry)
        
    db.commit()
    db.refresh(db_mapping)
    return db_mapping

def update_mapping(db: Session, mapping_id: int, mapping: schemas.MappingCreate):
    db_mapping = db.query(models.Mapping).filter(models.Mapping.id == mapping_id).first()
    if not db_mapping:
        return None
        
    db_mapping.saved_at = datetime.utcnow()
    
    # Delete old entries
    db.query(models.MappingEntry).filter(models.MappingEntry.mapping_id == mapping_id).delete()
    
    # Add new entries
    for entry in mapping.entries:
        db_entry = models.MappingEntry(
            mapping_id=db_mapping.id,
            source_sheet_name=entry.source_sheet_name,
            source_column_name=entry.source_column_name,
            standard_sheet_name=entry.standard_sheet_name,
            standard_column_name=entry.standard_column_name,
            info_type=entry.info_type,
            note=entry.note,
            confidence=entry.confidence,
            rationale=entry.rationale
        )
        db.add(db_entry)
        
    db.commit()
    db.refresh(db_mapping)
    return db_mapping

def delete_mapping(db: Session, mapping_id: int):
    # Retrieve mapping first to ensure it exists (optional but good)
    mapping = db.query(models.Mapping).filter(models.Mapping.id == mapping_id).first()
    if not mapping:
        return False
        
    # Delete entries first (if cascade not set, safe to do manual)
    db.query(models.MappingEntry).filter(models.MappingEntry.mapping_id == mapping_id).delete()
    db.delete(mapping)
    db.commit()
    return True

def get_saved_mappings(db: Session):
    # Join to get dataset name efficiently if needed, but for now simple query
    # The frontend expects {id, datasetName, savedAt, mappings_count}
    # It might need some Pydantic magic or manual query construction
    return db.query(models.Mapping).order_by(models.Mapping.saved_at.desc()).all()
