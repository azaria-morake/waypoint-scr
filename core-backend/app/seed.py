"""
Waypoint Secure - Deterministic Database Bootstrap & Seeding
Seeds South African benchmark entities (Thandiwe, Zanele, Lerato, 3 Organizations, 5 Responders).
"""
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import (
    User,
    BoloProfile,
    EmergencyContact,
    Organization,
    Responder,
    CustomB2BAgent
)
from app.security.crypto import SecurityCrypto
from app.config import settings

logger = logging.getLogger("waypoint.seed")

DEMO_USER_ID = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
CPF_ORG_ID = "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a"
FOX_ORG_ID = "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b"
SAPS_ORG_ID = "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c"

async def _seed(session: AsyncSession):
    # 1. Seed Citizen: Thandiwe Ndlovu
    user_res = await session.execute(select(User).where(User.user_id == DEMO_USER_ID))
    user = user_res.scalar_one_or_none()

    if not user:
        std_hash = SecurityCrypto.hash_pin("1234")
        dur_hash = SecurityCrypto.hash_pin("9999")

        user = User(
            user_id=DEMO_USER_ID,
            phone_number="+27825550199",
            full_name="Thandiwe Ndlovu",
            standard_pin_hash=std_hash,
            duress_pin_hash=dur_hash,
            is_fica_verified=True
        )
        session.add(user)

        # Encrypt BOLO profile with AES-256-GCM
        face_url = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
        marks = "Small butterfly tattoo on left wrist, gold stud in right ear"
        enc_photo, iv = SecurityCrypto.encrypt_aes_256_gcm(face_url)
        enc_marks, _ = SecurityCrypto.encrypt_aes_256_gcm(marks)

        bolo = BoloProfile(
            profile_id="b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
            user_id=DEMO_USER_ID,
            height_cm=165,
            build_description="Slender Athletic Build",
            encrypted_face_photo_blob=enc_photo,
            encrypted_distinguishing_marks=enc_marks,
            encryption_iv=iv,
            kms_key_id=settings.KMS_KEY_ID
        )
        session.add(bolo)

        # Emergency Contacts (Mother & Flatmate)
        c1 = EmergencyContact(
            user_id=DEMO_USER_ID,
            full_name="Zanele Ndlovu (Mother)",
            relationship="Mother",
            phone_number="+27825550101",
            whatsapp_number="+27825550101",
            priority_order=1
        )
        c2 = EmergencyContact(
            user_id=DEMO_USER_ID,
            full_name="Lerato Mokoena (Flatmate)",
            relationship="Flatmate",
            phone_number="+27825550102",
            whatsapp_number="+27825550102",
            priority_order=2
        )
        session.add_all([c1, c2])

    # 2. Seed Organizations across Tiers
    org_res = await session.execute(select(Organization).where(Organization.org_id == FOX_ORG_ID))
    if not org_res.scalar_one_or_none():
        cpf = Organization(
            org_id=CPF_ORG_ID,
            org_name="Alberton North CPF",
            org_type="CPF",
            subscription_tier="TIER_1_STARTER",
            max_concurrent_agents=2,
            monthly_voice_minutes_used=35,
            monthly_voice_minutes_limit=150
        )
        fox = Organization(
            org_id=FOX_ORG_ID,
            org_name="Fox Tactical Security Control Room",
            org_type="PRIVATE_SECURITY",
            subscription_tier="TIER_2_PRO",
            max_concurrent_agents=6,
            monthly_voice_minutes_used=180,
            monthly_voice_minutes_limit=1000
        )
        saps = Organization(
            org_id=SAPS_ORG_ID,
            org_name="SAPS Ekurhuleni District Command",
            org_type="SAPS_GOV",
            subscription_tier="TIER_3_GOV",
            max_concurrent_agents=99,
            monthly_voice_minutes_used=420,
            monthly_voice_minutes_limit=99999
        )
        session.add_all([cpf, fox, saps])

        # Pre-seed 2 Custom B2B Agents for Fox Security (Tier 2)
        b2b1 = CustomB2BAgent(
            org_id=FOX_ORG_ID,
            agent_name="Autonomous Intrusion Alarm Verifier",
            task_category="ALARM_VERIFICATION",
            system_prompt_template="Triage property alarm via voice challenge before rolling patrol.",
            webhook_trigger_url="https://api.foxsecurity.co.za/alarms/verify",
            is_enabled=True
        )
        b2b2 = CustomB2BAgent(
            org_id=FOX_ORG_ID,
            agent_name="VIP Client Scheduled Welfare Check",
            task_category="CLIENT_WELFARE_CHECK",
            system_prompt_template="Deliver interactive health & safety check prompt via WhatsApp.",
            webhook_trigger_url="https://api.foxsecurity.co.za/welfare/check",
            is_enabled=True
        )
        session.add_all([b2b1, b2b2])

        # 3. Seed 5 Responders across Gauteng N12/R59 corridors
        r1 = Responder(
            org_id=FOX_ORG_ID,
            callsign="Fox Security Unit 14 (Tactical Armed)",
            role="PATROLLER",
            lat=-26.2628,
            lng=28.1205,
            status="AVAILABLE"
        )
        r2 = Responder(
            org_id=FOX_ORG_ID,
            callsign="Fox Security Unit 08 (Armed Response)",
            role="PATROLLER",
            lat=-26.2550,
            lng=28.1150,
            status="AVAILABLE"
        )
        r3 = Responder(
            org_id=CPF_ORG_ID,
            callsign="Alberton CPF Sector 4 Mobile Watch",
            role="PATROLLER",
            lat=-26.2648,
            lng=28.1225,
            status="AVAILABLE"
        )
        r4 = Responder(
            org_id=SAPS_ORG_ID,
            callsign="SAPS Flying Squad Sector 2",
            role="PATROLLER",
            lat=-26.2788,
            lng=28.1325,
            status="AVAILABLE"
        )
        r5 = Responder(
            org_id=SAPS_ORG_ID,
            callsign="SAPS Germiston Highway Patrol",
            role="PATROLLER",
            lat=-26.2510,
            lng=28.1410,
            status="AVAILABLE"
        )
        session.add_all([r1, r2, r3, r4, r5])

    await session.commit()
    logger.info("Deterministic database seeding complete.")

async def seed_database(session: Optional[AsyncSession] = None):
    if session:
        await _seed(session)
    else:
        async with AsyncSessionLocal() as sess:
            await _seed(sess)
