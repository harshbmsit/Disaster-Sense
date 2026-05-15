from fastapi import APIRouter
from datetime import datetime
from app.models.report import reports_collection, CitizenReportCreate

router = APIRouter(prefix="/api/v1/reports", tags=["Citizen Reports"])

@router.post("")
def create_report(report: CitizenReportCreate):
    new_report = report.dict()
    new_report["created_at"] = datetime.utcnow()
    result = reports_collection.insert_one(new_report)
    
    return {
        "success": True,
        "report_id": str(result.inserted_id),
        "message": "Report received. Help is on the way.",
        "created_at": new_report["created_at"].isoformat()
    }
