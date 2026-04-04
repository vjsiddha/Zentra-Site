import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

_app = None

def get_db():
    global _app
    if not firebase_admin._apps: 
        service_account_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
        if not service_account_json:
            raise RuntimeError("FIREBASE_SERVICE_ACCOUNT_JSON is missing")

        cred_dict = json.loads(service_account_json)
        cred = credentials.Certificate(cred_dict)
        _app = firebase_admin.initialize_app(cred)

    return firestore.client()