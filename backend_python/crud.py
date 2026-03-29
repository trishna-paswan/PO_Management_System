import models, schemas
from sqlalchemy.orm import Session
from fastapi import HTTPException

def get_vendors(db: Session, skip: int = 0, limit: int = 100):
    try:
        return db.query(models.Vendor).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def create_vendor(db: Session, vendor: schemas.VendorCreate):
    try:
        db_vendor = models.Vendor(**vendor.model_dump())
        db.add(db_vendor)
        db.commit()
        db.refresh(db_vendor)
        return db_vendor
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create vendor: {str(e)}")

def get_vendor(db: Session, vendor_id: int):
    try:
        return db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def get_products(db: Session, skip: int = 0, limit: int = 100):
    try:
        return db.query(models.Product).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def create_product(db: Session, product: schemas.ProductCreate):
    try:
        db_product = models.Product(**product.model_dump())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except Exception as e:
        db.rollback()
        err_str = str(e)
        if "UNIQUE constraint failed" in err_str and "sku" in err_str.lower():
            raise HTTPException(status_code=400, detail="A Product with this SKU already exists! SKUs must be unique.")
        raise HTTPException(status_code=400, detail=f"Failed to create product: {err_str}")

def get_product(db: Session, product_id: int):
    try:
        return db.query(models.Product).filter(models.Product.id == product_id).first()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def update_product_description(db: Session, product_id: int, description: str):
    try:
        db_product = get_product(db, product_id)
        if db_product:
            db_product.description = description
            db.commit()
            db.refresh(db_product)
        return db_product
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update description: {str(e)}")

def create_po(db: Session, po: schemas.POCreate):
    import uuid
    try:
        total_amount = 0.0
        po_items = []
        
        for item in po.items:
            product = get_product(db, item.product_id)
            if product:
                 line_total = product.unit_price * item.quantity
                 total_amount += line_total
                 po_items.append(models.POItem(
                     product_id=product.id,
                     quantity=item.quantity,
                     price_at_purchase=product.unit_price
                 ))
                 
        tax_amount = total_amount * 0.05
        final_total = total_amount + tax_amount
        
        ref_val = po.ref_no if po.ref_no else str(uuid.uuid4())[:8].upper()
        
        db_po = models.PurchaseOrder(
            ref_no=ref_val,
            vendor_id=po.vendor_id,
            total_amount=final_total,
            tax_amount=tax_amount,
            status="Pending"
        )
        
        db.add(db_po)
        db.commit()
        db.refresh(db_po)
        
        for po_item in po_items:
            po_item.po_id = db_po.id
            db.add(po_item)
        db.commit()
        db.refresh(db_po)
        return db_po
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create PO: {str(e)}")

def get_pos(db: Session, skip: int = 0, limit: int = 100):
    try:
        return db.query(models.PurchaseOrder).offset(skip).limit(limit).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def update_po_status(db: Session, po_id: int, status: str):
    try:
        db_po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
        if db_po:
            db_po.status = status
            db.commit()
            db.refresh(db_po)
        return db_po
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update PO status: {str(e)}")
