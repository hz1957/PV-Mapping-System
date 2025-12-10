from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .... import crud, models, schemas
from ....database import SessionLocal

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Dataset)
def create_dataset(dataset: schemas.DatasetCreate, db: Session = Depends(get_db)):
    return crud.create_dataset(db=db, dataset=dataset)

@router.get("/", response_model=List[schemas.Dataset])
def read_datasets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_datasets(db, skip=skip, limit=limit)

@router.get("/{dataset_id}", response_model=schemas.Dataset)
def read_dataset(dataset_id: int, db: Session = Depends(get_db)):
    db_dataset = crud.get_dataset(db, dataset_id=dataset_id)
    if db_dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return db_dataset
