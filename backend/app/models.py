from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sheets = relationship("DatasetSheet", back_populates="dataset", cascade="all, delete-orphan")
    mappings = relationship("Mapping", back_populates="dataset", cascade="all, delete-orphan")

class DatasetSheet(Base):
    __tablename__ = "dataset_sheets"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    name = Column(String(255))
    
    dataset = relationship("Dataset", back_populates="sheets")
    # Changed: Columns are less important now we store rows, but we can keep structure if needed.
    # Actually, removing DatasetColumn table to simplify, or keep for metadata?
    # Let's remove DatasetColumn and use DatasetRow with JSON.
    rows = relationship("DatasetRow", back_populates="sheet", cascade="all, delete-orphan")

class DatasetRow(Base):
    __tablename__ = "dataset_rows"

    id = Column(Integer, primary_key=True, index=True)
    sheet_id = Column(Integer, ForeignKey("dataset_sheets.id"))
    data = Column(JSON) # Stores the row as a Dictionary
    row_index = Column(Integer)

    sheet = relationship("DatasetSheet", back_populates="rows")


class Framework(Base):
    __tablename__ = "frameworks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)
    version = Column(String(50))
    description = Column(Text)
    
    sheets = relationship("FrameworkSheet", back_populates="framework", cascade="all, delete-orphan")
    mappings = relationship("Mapping", back_populates="framework")

class FrameworkSheet(Base):
    __tablename__ = "framework_sheets"

    id = Column(Integer, primary_key=True, index=True)
    framework_id = Column(Integer, ForeignKey("frameworks.id"))
    
    # Standard (CDISC/Output)
    standard_sheet_name = Column(String(255))
    standard_column_name = Column(String(255))
    

    
    info_type = Column(String(100), nullable=True)
    note = Column(Text, nullable=True)
    
    framework = relationship("Framework", back_populates="sheets")

class Mapping(Base):
    __tablename__ = "mappings"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    framework_id = Column(Integer, ForeignKey("frameworks.id"))
    saved_at = Column(DateTime, default=datetime.utcnow)
    
    dataset = relationship("Dataset", back_populates="mappings")
    framework = relationship("Framework", back_populates="mappings")
    entries = relationship("MappingEntry", back_populates="mapping", cascade="all, delete-orphan")

class MappingEntry(Base):
    __tablename__ = "mapping_entries"

    id = Column(Integer, primary_key=True, index=True)
    mapping_id = Column(Integer, ForeignKey("mappings.id"))
    
    source_sheet_name = Column(String(255))
    source_column_name = Column(String(255))
    
    standard_sheet_name = Column(String(255))
    standard_column_name = Column(String(255))
    
    info_type = Column(String(100), nullable=True)
    note = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    rationale = Column(Text, nullable=True)
    
    mapping = relationship("Mapping", back_populates="entries")

class ChangeLog(Base):
    __tablename__ = "change_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    dataset_name = Column(String(255))
    target_framework = Column(String(255))
    standard_sheet_name = Column(String(255)) 
    standard_column_name = Column(String(255))
    change_type = Column(String(50)) # sourceSheet, sourceColumn, both
    old_source_sheet_name = Column(String(255), nullable=True)
    new_source_sheet_name = Column(String(255), nullable=True)
    old_source_column_name = Column(String(255), nullable=True)
    new_source_column_name = Column(String(255), nullable=True)
    operator = Column(String(100), default="Current User")
