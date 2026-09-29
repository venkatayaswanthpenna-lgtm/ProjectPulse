from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class ScheduleActivityBase(BaseModel):
    activity_id: str
    name: str
    discipline: str
    location: str
    status: str
    progress_percent: float

class ScheduleActivityResponse(ScheduleActivityBase):
    id: int
    project_id: int
    
    class Config:
        from_attributes = True

class FieldReportCreate(BaseModel):
    raw_content: str
    submitted_by: str = "Demo User"
    project_id: int = 1

class ExtractedEventBase(BaseModel):
    description: str
    discipline: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None

class ExtractedEventResponse(ExtractedEventBase):
    id: int
    
    class Config:
        from_attributes = True

class MatchedEventResponse(BaseModel):
    id: int
    extracted_event: ExtractedEventResponse
    schedule_activity: Optional[ScheduleActivityResponse] = None
    confidence_score: float
    match_reasoning: str
    status: str
    
    class Config:
        from_attributes = True

class ReviewAction(BaseModel):
    action: str # 'Approve', 'Reject', 'Modify'
    schedule_activity_id: Optional[int] = None
    reviewed_by: str = "Planner Demo"
