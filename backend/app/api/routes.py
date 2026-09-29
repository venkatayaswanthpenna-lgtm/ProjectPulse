from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
import numpy as np
from ..db import database, models
from ..schemas import schemas
from ..ai.extraction import extract_events_from_text
from ..ai.matching import get_embedding

router = APIRouter()

@router.get('/health')
def health_check():
    return {'status': 'healthy'}

@router.get('/projects', response_model=List[dict])
def get_projects(db: Session = Depends(database.get_db)):
    projects = db.query(models.Project).all()
    return [{'id': p.id, 'name': p.name, 'description': p.description} for p in projects]

@router.get('/projects/{project_id}/activities', response_model=List[schemas.ScheduleActivityResponse])
def get_project_activities(project_id: int, db: Session = Depends(database.get_db)):
    activities = db.query(models.ScheduleActivity).filter(models.ScheduleActivity.project_id == project_id).all()
    return activities

def cosine_similarity(vec1, vec2):
    dot_product = np.dot(vec1, vec2)
    norm_a = np.linalg.norm(vec1)
    norm_b = np.linalg.norm(vec2)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

@router.post('/ingest', response_model=dict)
def ingest_field_report(report: schemas.FieldReportCreate, db: Session = Depends(database.get_db)):
    db_report = models.FieldReport(
        project_id=report.project_id,
        submitted_by=report.submitted_by,
        raw_content=report.raw_content,
        status='Processing'
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    extracted_data = extract_events_from_text(report.raw_content)
    
    extracted_events = []
    for item in extracted_data:
        ev = models.ExtractedEvent(
            report_id=db_report.id,
            description=item.get('description'),
            discipline=item.get('discipline'),
            location=item.get('location'),
            status=item.get('status')
        )
        db.add(ev)
        extracted_events.append(ev)
    
    db.commit()
    for ev in extracted_events:
        db.refresh(ev)

    all_activities = db.query(models.ScheduleActivity).filter(models.ScheduleActivity.project_id == report.project_id).all()

    for ev in extracted_events:
        search_text = f"{ev.description} {ev.discipline} {ev.location}"
        vec = get_embedding(search_text)
        
        best_match = None
        best_score = -1.0
        
        for act in all_activities:
            if act.embedding_json:
                act_vec = np.array(json.loads(act.embedding_json))
                score = cosine_similarity(vec, act_vec)
                if score > best_score:
                    best_score = score
                    best_match = act
                    
        if best_match:
            confidence = max(0.0, float(best_score))
            status = 'Pending Review'
            if confidence >= 0.90:
                status = 'Auto-Linked'
            
            matched = models.MatchedEvent(
                extracted_event_id=ev.id,
                schedule_activity_id=best_match.id,
                confidence_score=confidence,
                match_reasoning=f"Semantic similarity score: {confidence:.2f}",
                status=status
            )
            db.add(matched)
            
            if status == 'Auto-Linked':
                 if ev.status and 'complete' in ev.status.lower():
                     best_match.progress_percent = 100.0
                     best_match.status = 'Completed'
                 elif ev.status and 'progress' in ev.status.lower():
                     if best_match.progress_percent < 50:
                         best_match.progress_percent = 50.0
                     best_match.status = 'In Progress'

    db_report.status = 'Completed'
    db.commit()
    
    return {'status': 'success', 'report_id': db_report.id, 'extracted_count': len(extracted_events)}

@router.get('/review', response_model=List[schemas.MatchedEventResponse])
def get_pending_reviews(db: Session = Depends(database.get_db)):
    matches = db.query(models.MatchedEvent).order_by(models.MatchedEvent.id.desc()).limit(20).all()
    return matches

@router.post('/review/{match_id}')
def review_match(match_id: int, review: schemas.ReviewAction, db: Session = Depends(database.get_db)):
    match = db.query(models.MatchedEvent).filter(models.MatchedEvent.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    if review.action == 'Approve':
        match.status = 'Approved'
        ev = match.extracted_event
        act = match.schedule_activity
        if ev.status and 'complete' in ev.status.lower():
             act.progress_percent = 100.0
             act.status = 'Completed'
        elif ev.status and 'progress' in ev.status.lower():
             if act.progress_percent < 50:
                 act.progress_percent = 50.0
             act.status = 'In Progress'

    elif review.action == 'Modify':
        match.status = 'Approved'
        match.schedule_activity_id = review.schedule_activity_id
        act = db.query(models.ScheduleActivity).filter(models.ScheduleActivity.id == review.schedule_activity_id).first()
        ev = match.extracted_event
        if ev.status and 'complete' in ev.status.lower():
             act.progress_percent = 100.0
             act.status = 'Completed'
        elif ev.status and 'progress' in ev.status.lower():
             if act.progress_percent < 50:
                 act.progress_percent = 50.0
             act.status = 'In Progress'
    elif review.action == 'Reject':
        match.status = 'Rejected'
        match.schedule_activity_id = None
        
    match.reviewed_by = review.reviewed_by
    from datetime import datetime
    match.reviewed_at = datetime.utcnow()
    
    db.commit()
    return {'status': 'success'}

@router.get('/analytics')
def get_analytics(db: Session = Depends(database.get_db)):
    total_matches = db.query(models.MatchedEvent).count()
    auto_linked = db.query(models.MatchedEvent).filter(models.MatchedEvent.status == 'Auto-Linked').count()
    
    if total_matches == 0:
        accuracy = 0
    else:
        accuracy = round((auto_linked / total_matches) * 100, 1)
        
    return {
        'total_events': total_matches,
        'auto_linked': auto_linked,
        'accuracy_percent': accuracy,
        'time_saved_minutes': auto_linked * 15
    }

