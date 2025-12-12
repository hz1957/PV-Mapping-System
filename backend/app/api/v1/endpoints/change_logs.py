from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import database
from app import models
from app import schemas

router = APIRouter()

@router.post("/", response_model=schemas.ChangeLog)
def create_change_log(change_log: schemas.ChangeLogCreate, db: Session = Depends(database.get_db)):
    db_change_log = models.ChangeLog(**change_log.dict())
    db.add(db_change_log)
    db.commit()
    db.refresh(db_change_log)
    return db_change_log

@router.get("/", response_model=List[schemas.ChangeLog])
def read_change_logs(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    logs = db.query(models.ChangeLog).order_by(models.ChangeLog.timestamp.desc()).offset(skip).limit(limit).all()
    return logs
