import os
import requests
import datetime
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", "DUMMY_KEY"))

from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

def generate_product_description(product_name: str, sku: str = "N/A") -> str:
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Write a 2-line catchy marketing description for a product named '{product_name}' with SKU '{sku}'."
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("Gemini API Error:", e)
        return f"A high-quality, premium {product_name} designed for maximum resilience and productivity in any environment."

async def log_ai_generation(product_name: str, generated_text: str):
    # Console Logging natively
    print(f"[{datetime.datetime.utcnow()}] AI Generated description for {product_name}")
    
    # Attempt MongoDB raw JSON Document Saving
    try:
        client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=1000)
        client.admin.command('ping') # Fast killswitch check
        db = client["po_management"]
        collection = db["ai_logs"]
        
        doc = {
            "product_name": product_name,
            "description": generated_text,
            "timestamp": datetime.datetime.utcnow()
        }
        collection.insert_one(doc)
        print("[MongoDB] AI generation seamlessly logged to NoSQL collection.")
    except Exception as e:
        print("[MongoDB Error] Could not connect to MongoDB localhost server. Raw JSON not stored!")

def notify_status_change(po_id: int, status: str):
    print(f"[Internal] Webhooking Status Change for PO #{po_id} -> {status}")
    try:
        res = requests.post("http://localhost:3000/webhook/notify", json={"po_id": po_id, "status": status})
        if res.status_code == 200:
            print("[Internal] NodeJS successfully acknowledged webhook!")
    except Exception as e:
        print(f"[Internal Warning] NodeJS Webhook failed! (Is the server running on port 3000?) {e}")
