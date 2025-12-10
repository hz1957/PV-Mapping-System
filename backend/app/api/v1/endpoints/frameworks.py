from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .... import crud, models, schemas
from .datasets import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Framework)
def create_framework(framework: schemas.FrameworkCreate, db: Session = Depends(get_db)):
    return crud.create_framework(db=db, framework=framework)

@router.get("/", response_model=List[schemas.Framework])
def read_frameworks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_frameworks(db, skip=skip, limit=limit)
