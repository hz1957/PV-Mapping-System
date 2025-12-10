import json
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from .... import crud, models, schemas
from ....services import mapping_generation_service
from .datasets import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Mapping)
def create_mapping(mapping: schemas.MappingCreate, db: Session = Depends(get_db)):
    return crud.create_mapping(db=db, mapping=mapping)

@router.put("/{dataset_id}/{framework_id}", response_model=schemas.Mapping)
def update_mapping_by_context(dataset_id: int, framework_id: int, mapping: schemas.MappingCreate, db: Session = Depends(get_db)):
    # Force IDs to match URL
    mapping.dataset_id = dataset_id
    mapping.framework_id = framework_id
    # Create a new version of mapping (Snapshot style) or upsert logic
    return crud.create_mapping(db=db, mapping=mapping)

@router.put("/{mapping_id}", response_model=schemas.Mapping)
def update_mapping_inplace(mapping_id: int, mapping: schemas.MappingCreate, db: Session = Depends(get_db)):
    db_mapping = crud.update_mapping(db=db, mapping_id=mapping_id, mapping=mapping)
    if not db_mapping:
         raise HTTPException(status_code=404, detail="Mapping not found")
    return db_mapping

@router.delete("/{mapping_id}")
def delete_mapping(mapping_id: int, db: Session = Depends(get_db)):
    success = crud.delete_mapping(db=db, mapping_id=mapping_id)
    if not success:
        raise HTTPException(status_code=404, detail="Mapping not found")
    return {"status": "success"}

@router.get("/generate/stream")
def generate_mapping_stream(dataset_id: int, framework_id: int, db: Session = Depends(get_db)):
    def event_generator():
        for chunk in mapping_generation_service.generate_ai_mapping_stream(db, dataset_id, framework_id):
            yield f"data: {json.dumps(chunk)}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/", response_model=List[schemas.Mapping])
def read_mappings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Use saved mappings logic (ordered by date) for better UX
    return crud.get_saved_mappings(db)
