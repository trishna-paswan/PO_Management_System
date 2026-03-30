from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, crud, services, auth
from database import engine, get_db
from typing import List
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    models.Base.metadata.create_all(bind=engine)
    
    # Seed initial data if database is empty
    db = next(get_db())
    if not db.query(models.Vendor).first():
        vendors = [
            models.Vendor(name='Global Supplies Inc.', contact='contact@global.com', rating=4.5),
            models.Vendor(name='Tech Dynamics', contact='sales@techdyn.com', rating=4.8),
            models.Vendor(name='Office Essentials', contact='info@office.com', rating=4.2)
        ]
        db.add_all(vendors)
        db.commit()
    
    if not db.query(models.Product).first():
        products = [
            models.Product(name='Wireless Mouse', sku='W-MOU-001', unit_price=25.50, stock_level=100, description='Ergonomic 2.4G wireless mouse.'),
            models.Product(name='Mechanical Keyboard', sku='M-KEY-002', unit_price=85.00, stock_level=50, description='RGB mechanical keyboard with blue switches.'),
            models.Product(name='LED Monitor', sku='L-MON-003', unit_price=150.00, stock_level=30, description='24-inch Full HD LED monitor.')
        ]
        db.add_all(products)
        db.commit()
    yield

app = FastAPI(title="PO Management System API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/auth/google", response_model=schemas.Token)
@app.post("/api/auth/microsoft", response_model=schemas.Token)
async def login_via_provider(token_data: dict):
    # In a real app, we would validate the provider's token here.
    # For this demo, we assume the token is valid if present.
    if not token_data.get("token"):
        raise HTTPException(status_code=400, detail="Invalid token from provider")
    
    access_token = auth.create_access_token(data={"sub": "user@example.com"})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/vendors", response_model=List[schemas.Vendor])
def read_vendors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_vendors(db, skip=skip, limit=limit)

@app.post("/api/vendors", response_model=schemas.Vendor)
def create_vendor(vendor: schemas.VendorCreate, db: Session = Depends(get_db)):
    return crud.create_vendor(db=db, vendor=vendor)

@app.get("/api/products", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit)

@app.post("/api/products", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db=db, product=product)

@app.post("/api/products/draft-description")
async def draft_desc(req: schemas.ProductDraft):
    if not req.name:
        raise HTTPException(status_code=400, detail="Must provide a product name")
    desc = services.generate_product_description(req.name)
    await services.log_ai_generation(req.name, desc)
    return {"description": desc}

@app.post("/api/products/{product_id}/generate-description")
async def generate_desc(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    desc = services.generate_product_description(product.name, product.sku)
    crud.update_product_description(db, product_id, desc)
    await services.log_ai_generation(product.name, desc)
    return {"description": desc}

@app.post("/api/pos", response_model=schemas.PurchaseOrderResp)
def create_purchase_order(po: schemas.POCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    vendor = crud.get_vendor(db, po.vendor_id)
    if not vendor:
        raise HTTPException(status_code=400, detail="Invalid Vendor ID")

    db_po = crud.create_po(db=db, po=po)
    background_tasks.add_task(services.notify_status_change, db_po.id, db_po.status)
    return db_po

@app.get("/api/pos", response_model=List[schemas.PurchaseOrderResp])
def read_pos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_pos(db, skip=skip, limit=limit)

@app.patch("/api/pos/{po_id}/status", response_model=schemas.PurchaseOrderResp)
def update_po_status(po_id: int, status_update: schemas.POStatusUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    updated_po = crud.update_po_status(db, po_id, status_update.status)
    if not updated_po:
        raise HTTPException(status_code=404, detail="PO not found")
        
    # Trigger Node.js websocket broadcast natively!
    background_tasks.add_task(services.notify_status_change, updated_po.id, updated_po.status)
    
    return updated_po

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
