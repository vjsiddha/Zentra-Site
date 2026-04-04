import firebase_admin
from firebase_admin import credentials, firestore
import os

def get_db():
if not firebase_admin._apps:
base_dir = os.path.dirname(__file__)
cred_path = os.path.join(base_dir, "..", "firebase-service-account.json")

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

return firestore.client()