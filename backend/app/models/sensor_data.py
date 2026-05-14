from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "disastersense")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]
sensor_readings = db["sensor_readings"]
