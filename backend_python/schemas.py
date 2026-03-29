from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Vendor Schemas
class VendorCreate(BaseModel):
    name: str
    contact: str
    rating: float = 0.0

class Vendor(VendorCreate):
    id: int
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    sku: str
    unit_price: float
    stock_level: int
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductDraft(BaseModel):
    name: str

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

# Purchase Order Item Schemas
class POItemCreate(BaseModel):
    product_id: int
    quantity: int

class POItemResp(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_purchase: float
    class Config:
        from_attributes = True

# Purchase Order Schemas
class POCreate(BaseModel):
    vendor_id: int
    ref_no: Optional[str] = None
    items: List[POItemCreate]

class POStatusUpdate(BaseModel):
    status: str

class PurchaseOrderResp(BaseModel):
    id: int
    ref_no: str
    vendor_id: int
    total_amount: float
    tax_amount: float
    status: str
    created_at: datetime
    items: List[POItemResp]
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
