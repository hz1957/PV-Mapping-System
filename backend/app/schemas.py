from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Datasets ---

class DatasetRow(BaseModel):
    id: int
    row_index: int
    data: Dict[str, Any]
    class Config:
        orm_mode = True

class DatasetSheet(BaseModel):
    name: str
    rows: List[DatasetRow] = [] # Note: Fetching all rows might be heavy
    class Config:
        orm_mode = True

class DatasetCreate(BaseModel):
    name: str
    # When creating, we might just pass metadata or use a separate endpoint for file upload
    # For the seed script, we use ORM directly so this Pydantic model is less critical for creation
    pass 

class Dataset(BaseModel):
    id: int
    name: str
    created_at: datetime
    sheets: List[DatasetSheet] = [] # Note: This might be heavy if many rows
    
    class Config:
        orm_mode = True

# --- Frameworks ---

class FrameworkSheetBase(BaseModel):
    standard_sheet_name: str
    standard_column_name: str

    info_type: Optional[str] = None
    note: Optional[str] = None

class FrameworkSheet(FrameworkSheetBase):
    id: int
    class Config:
        orm_mode = True

class FrameworkCreate(BaseModel):
    name: str
    version: str
    description: Optional[str] = None
    sheets: List[FrameworkSheetBase]

class Framework(BaseModel):
    id: int
    name: str
    version: str
    description: Optional[str] = None
    sheets: List[FrameworkSheet] = []

    class Config:
        orm_mode = True

# --- Mappings ---

class MappingEntryBase(BaseModel):
    source_sheet_name: str
    source_column_name: str
    standard_sheet_name: str
    standard_column_name: str
    info_type: Optional[str] = None
    note: Optional[str] = None
    confidence: Optional[float] = None
    rationale: Optional[str] = None

class MappingEntryCreate(MappingEntryBase):
    pass

class MappingEntry(MappingEntryBase):
    id: int
    class Config:
        orm_mode = True

class MappingCreate(BaseModel):
    dataset_id: int
    framework_id: int
    entries: List[MappingEntryCreate]

class Mapping(BaseModel):
    id: int
    dataset_id: int
    framework_id: int
    saved_at: datetime
    entries: List[MappingEntry] = []
    
    class Config:
        orm_mode = True

class MappingGenerateRequest(BaseModel):
    dataset_id: int
    framework_id: int
