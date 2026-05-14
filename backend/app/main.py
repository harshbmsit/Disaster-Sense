from fastapi import FastAPI

app = FastAPI(title="DisasterSense Backend")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "DisasterSense Backend"}
