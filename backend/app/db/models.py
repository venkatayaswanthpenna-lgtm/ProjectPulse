from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Project(Base):
    __tablename__ = 'projects'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    activities = relationship('ScheduleActivity', back_populates='project')
    reports = relationship('FieldReport', back_populates='project')

class ScheduleActivity(Base):
    __tablename__ = 'schedule_activities'
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'))
    activity_id = Column(String, index=True)
    name = Column(String)
    discipline = Column(String)
    location = Column(String)
    planned_start = Column(DateTime)
    planned_end = Column(DateTime)
    status = Column(String)
    progress_percent = Column(Float, default=0.0)
    embedding_json = Column(Text) # Store vector as JSON string for SQLite

    project = relationship('Project', back_populates='activities')
    matched_events = relationship('MatchedEvent', back_populates='schedule_activity')

class FieldReport(Base):
    __tablename__ = 'field_reports'
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'))
    report_date = Column(DateTime, default=datetime.utcnow)
    submitted_by = Column(String)
    raw_content = Column(Text)
    status = Column(String)
    
    project = relationship('Project', back_populates='reports')
    extracted_events = relationship('ExtractedEvent', back_populates='report')

class ExtractedEvent(Base):
    __tablename__ = 'extracted_events'
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey('field_reports.id'))
    description = Column(String)
    discipline = Column(String, nullable=True)
    location = Column(String, nullable=True)
    status = Column(String, nullable=True)
    
    report = relationship('FieldReport', back_populates='extracted_events')
    matched_event = relationship('MatchedEvent', uselist=False, back_populates='extracted_event')

class MatchedEvent(Base):
    __tablename__ = 'matched_events'
    id = Column(Integer, primary_key=True, index=True)
    extracted_event_id = Column(Integer, ForeignKey('extracted_events.id'))
    schedule_activity_id = Column(Integer, ForeignKey('schedule_activities.id'))
    confidence_score = Column(Float)
    match_reasoning = Column(Text)
    status = Column(String)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    extracted_event = relationship('ExtractedEvent', back_populates='matched_event')
    schedule_activity = relationship('ScheduleActivity', back_populates='matched_events')
