from fastapi import FastAPI

app = FastAPI()

@app.get("/api/healthcheck")
def hello_world():
    return {"message": "Healthcheck is working fine"}