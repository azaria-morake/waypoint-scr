"""
SQLAlchemy ORM Models: Users, BOLO Profiles & Emergency Contacts
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship as orm_relationship
from app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=gen_uuid)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(120), nullable=False)
    standard_pin_hash = Column(String(255), nullable=False)
    duress_pin_hash = Column(String(255), nullable=False)
    is_fica_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    bolo_profile = orm_relationship("BoloProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    emergency_contacts = orm_relationship("EmergencyContact", back_populates="user", cascade="all, delete-orphan")
    journeys = orm_relationship("Journey", back_populates="user")

class BoloProfile(Base):
    __tablename__ = "bolo_profiles"

    profile_id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    height_cm = Column(Integer, nullable=False)
    build_description = Column(String(100), nullable=False)
    encrypted_face_photo_blob = Column(Text, nullable=False)  # AES-256-GCM ciphertext
    encrypted_distinguishing_marks = Column(Text, nullable=True)  # AES-256-GCM ciphertext
    encryption_iv = Column(String(64), nullable=False)
    kms_key_id = Column(String(120), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = orm_relationship("User", back_populates="bolo_profile")

class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    contact_id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(120), nullable=False)
    relationship = Column(String(50), nullable=False)
    phone_number = Column(String(20), nullable=False)
    whatsapp_number = Column(String(20), nullable=False)
    priority_order = Column(Integer, default=1)

    user = orm_relationship("User", back_populates="emergency_contacts")
