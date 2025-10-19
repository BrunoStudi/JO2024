from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.responses import FileResponse
from services.qr_generator import generate_qr_code
from services.security_key import generate_security_key
from services.email_sender import send_ticket_email
from services.pdf_generator import generate_ticket_pdf
from fastapi.middleware.cors import CORSMiddleware
import requests
import jwt
import logging
import os

logger = logging.getLogger("ticket_delivery")
logger.setLevel(logging.INFO)

# Handler pour afficher dans la console
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

app = FastAPI(title="Delivery Service", version="1.4")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# URL du microservice commandes
SYMFONY_API_URL = "http://127.0.0.1:8003/api/pay/orders"
# URL du microservice profile user
PROFILE_API_URL = "http://127.0.0.1:8001/api/user/profile"

# Clé publique JWT
JWT_PUBLIC_KEY = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkOLrSNO7IgwK+6xZ3vzc
OCJZMJlrQn/E9SQMPa1D4BM/iNUyTIrd5wnrH5VxMmtnOkYlWJ/kLQ0tnKNpSc0j
47w0bKebyhuGIWP/UAehBNzuhy7uQXS6Hzu3asGTSyFXKW18RK1L93JVYbuR9011
666e3/heCoMdGaWAn6EidrgDItLtIt3kOb90H4wwulnuATiRHf6SzhbGRnFN8ECd
EMlxC3rPwEiO/YOcOU2EvGR8lhkK+ECoKp+Qi5drBHnNFnCrjpNWPzor540du9/G
X9XhglTK7dNGZc4UoslJjOhhjxyVjbM/NCXzJLVN38WC6IuyePuUuHiFJ1g252hq
TwIDAQAB
-----END PUBLIC KEY-----
"""
JWT_ALGORITHM = "RS256"

# Clé interne pour augmenter la sécurité
INTERNAL_SERVICE_KEY = "5hT9vQ2#xP8rZ1!dLw6YbNc7JkR0fGhM"

logger = logging.getLogger("ticket_delivery")
logging.basicConfig(level=logging.INFO)


@app.post("/api/deliver")
async def deliver_ticket(
    request: Request,
    authorization: str | None = Header(default=None),
    x_service_key: str | None = Header(default=None)
):
    # Vérification de la clé interne
    if x_service_key != INTERNAL_SERVICE_KEY:
        logger.warning(f"Service non autorisé, clé reçue: {x_service_key}")
        raise HTTPException(status_code=403, detail="Service non autorisé")

    # Vérification du JWT
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="JWT Token not found")

    jwt_token = authorization.split(" ")[1].strip()
    try:
        payload = jwt.decode(jwt_token, JWT_PUBLIC_KEY, algorithms=[JWT_ALGORITHM])
        username = payload.get("username")
        roles = payload.get("roles", [])
        logger.info(f"JWT décodé avec succès : {username}")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="JWT expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="JWT invalide")

    if "ROLE_USER" not in roles and "ROLE_ADMIN" not in roles:
        raise HTTPException(status_code=403, detail="Rôle non autorisé")

    # Lecture du JSON
    data = await request.json()
    user_email = data.get("email")
    order_id = data.get("order_id")
    items = data.get("items", [])

    if not user_email or not order_id:
        raise HTTPException(status_code=400, detail="email et order_id sont requis")

    if not items:
        raise HTTPException(status_code=400, detail="Aucune offre trouvée dans la commande")

    logger.info(f"📦 Livraison du ticket pour la commande {order_id} | {len(items)} offre(s)")

    # Récupération du profile
    try:
        response = requests.get(PROFILE_API_URL, headers={"Authorization": f"Bearer {jwt_token}"})
        if response.status_code == 200:
            profile_data = response.json().get("profile", {})
            firstname = profile_data.get("firstName", "")
            lastname = profile_data.get("lastName", "")
            logger.info(f"Nom récupéré : {firstname} {lastname}")
        else:
            firstname = ""
            lastname = ""
            logger.warning(f"Impossible de récupérer le profil, status: {response.status_code}")
    except Exception as e:
        firstname = ""
        lastname = ""
        logger.error(f"Erreur lors de la récupération du profil: {e}")

    # Génération de la clé et QR code
    security_key = generate_security_key()
    qr_content = f"order:{order_id}|key:{security_key}"
    qr_path = generate_qr_code(qr_content, f"ticket_{order_id}.png")
    logger.info(f"QR code généré : {qr_path}")

    # Logo du PDF
    logo_path = "assets/logo.png"

    # Génération du PDF
    pdf_path = generate_ticket_pdf(
        order_id=order_id,
        user_email=user_email,
        firstname=firstname,
        lastname=lastname,
        qr_path=qr_path,
        items=items,
        logo_path=logo_path
    )
    logger.info(f"PDF généré : {pdf_path}")

    # Envoi du PDF vers Symfony
    try:
        with open(pdf_path, "rb") as pdf_file:
            response = requests.post(
                f"{SYMFONY_API_URL}/{order_id}/ticket",
                headers={"Authorization": f"Bearer {jwt_token}"},
                files={"ticket_pdf": (os.path.basename(pdf_path), pdf_file, "application/pdf")},
                data={"ticketKey": security_key},
            )

        if response.status_code not in [200, 201]:
            logger.error(f"Erreur upload ticket vers Symfony: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500, detail="Erreur lors de l’envoi du ticket à Symfony")

        logger.info(f"✅ Ticket enregistré dans Symfony pour {order_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur communication Symfony : {e}")

    # Envoi du mail avec le PDF unique
    try:
        send_ticket_email(user_email, order_id, pdf_path)
        logger.info(f"✉️ Email envoyé à {user_email}")
    except Exception as e:
        logger.error(f"Erreur email: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur d'envoi d'email : {e}")

    return {
        "message": "Billet unique généré et envoyé ✅",
        "order_id": order_id,
        "items": items,
        "pdf_path": pdf_path
    }

# Endpoint pour le téléchargement du billet
@app.get("/api/tickets/{order_id}/download")
async def download_ticket(order_id: str):
    pdf_path = f"tickets/ticket_{order_id}.pdf"
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Billet introuvable")

    return FileResponse(
        path=pdf_path,
        filename=f"billet_{order_id}.pdf",
        media_type="application/pdf"
    )
