import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

if not firebase_admin._apps:
    service_account_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    
    if service_account_json:
        # Production: loaded from env var
        cred = credentials.Certificate(json.loads(service_account_json))
    else:
        # Local dev: load from file
        cred = credentials.Certificate(
            "/workspaces/Zentra-Site/services/mock-investor/firebase-service-account.json"
        )
    
    firebase_admin.initialize_app(cred)

db = firestore.client()

def get_db():
    return db