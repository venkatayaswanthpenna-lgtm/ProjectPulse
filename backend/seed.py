import os
import sys
import json
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, engine, Base
from app.db import models
from app.ai.matching import get_embedding

def seed_data():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    if db.query(models.Project).count() > 0:
        print("Database already seeded.")
        return

    print("Seeding Project...")
    project = models.Project(
        name="Metro Line Extension - Phase 2",
        description="Construction of the northern elevated corridor and stations."
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    activities_data = [
        {"activity_id": "C-1010", "name": "Site Clearance & Mobilization", "discipline": "General", "location": "Zone A", "status": "Completed", "progress_percent": 100.0},
        {"activity_id": "C-1020", "name": "Trench Excavation for Main Drainage", "discipline": "Civil", "location": "North Sector", "status": "Not Started", "progress_percent": 0.0},
        {"activity_id": "C-1030", "name": "Rebar Tying - Raft Foundation", "discipline": "Civil", "location": "Zone A", "status": "Not Started", "progress_percent": 0.0},
        {"activity_id": "C-1040", "name": "Concrete Pour - Column Pedestals", "discipline": "Civil", "location": "Level 1", "status": "Not Started", "progress_percent": 0.0},
        {"activity_id": "E-2010", "name": "Laying Underground Cables", "discipline": "Electrical", "location": "North Sector", "status": "Not Started", "progress_percent": 0.0},
        {"activity_id": "M-3010", "name": "Install HVAC Ducting", "discipline": "Mechanical", "location": "Station 1", "status": "Not Started", "progress_percent": 0.0},
    ]

    print("Generating embeddings and seeding schedule activities...")
    now = datetime.utcnow()
    for act in activities_data:
        search_text = f"{act['name']} {act['discipline']} {act['location']}"
        embedding = get_embedding(search_text)
        
        db_act = models.ScheduleActivity(
            project_id=project.id,
            activity_id=act['activity_id'],
            name=act['name'],
            discipline=act['discipline'],
            location=act['location'],
            status=act['status'],
            progress_percent=act['progress_percent'],
            planned_start=now,
            planned_end=now + timedelta(days=14),
            embedding_json=json.dumps(embedding)
        )
        db.add(db_act)
    
    db.commit()
    print("Seeding complete!")

if __name__ == '__main__':
    seed_data()
