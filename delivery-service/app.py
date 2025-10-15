from fastapi import FastAPI, HTTPException, Request, Header
from services.qr_generator import generate_qr_code
from services.security_key import generate_security_key
from services.email_sender import send_ticket_email
import requests
import jwt
import logging

app = FastAPI(title="Delivery Service", version="1.0")

# URL du microservice Symfony payment
SYMFONY_API_URL = "http://127.0.0.1:8003/api/pay/orders"

# Clé publique pour vérifier le JWT
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

# Secret interne pour sécuriser les microservices
INTERNAL_SERVICE_KEY = "5hT9vQ2#xP8rZ1!dLw6YbNc7JkR0fGhM"

# Logger
logger = logging.getLogger("ticket_delivery")
logging.basicConfig(level=logging.INFO)


@app.post("/api/deliver")
async def deliver_ticket(
    request: Request,
    authorization: str | None = Header(default=None),
    x_service_key: str | None = Header(default=None)
):
    # Vérifier la clé interne du service
    if x_service_key != INTERNAL_SERVICE_KEY:
        logger.warning(f"Service non autorisé, clé reçue: {x_service_key}")
        raise HTTPException(status_code=403, detail="Service non autorisé")

    # Vérifier la présence du JWT
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="JWT Token not found")

    jwt_token = authorization.split(" ")[1].strip()

    try:
        # Décoder le JWT
        payload = jwt.decode(jwt_token, JWT_PUBLIC_KEY, algorithms=[JWT_ALGORITHM])
        username = payload.get("username")
        roles = payload.get("roles", [])
        logger.info(f"Payload JWT: {payload}")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="JWT expiré")
    except jwt.InvalidTokenError:
        logger.warning(f"JWT invalide: {jwt_token}")
        raise HTTPException(status_code=401, detail="JWT invalide")

    # Vérifier les rôles
    if "ROLE_USER" not in roles and "ROLE_ADMIN" not in roles:
        logger.warning(f"Rôle non autorisé pour l'utilisateur {username}")
        raise HTTPException(status_code=403, detail="Rôle non autorisé")

    # Lecture du JSON envoyé par Symfony
    data = await request.json()
    user_email = data.get("email")
    order_id = data.get("order_id")

    if not user_email or not order_id:
        raise HTTPException(status_code=400, detail="email et order_id sont requis")

    # Génération de la clé et du QR code
    security_key = generate_security_key()
    qr_content = f"order:{order_id}|key:{security_key}"
    qr_path = generate_qr_code(qr_content, f"ticket_{order_id}.png")

    # Enregistrement de la clé du ticket dans Symfony
    try:
        response = requests.post(
            f"{SYMFONY_API_URL}/{order_id}/ticket-key",
            json={"ticketKey": security_key},
            headers={"Authorization": f"Bearer {jwt_token}"},
        )

        if response.status_code not in [200, 201]:
            logger.error(f"Erreur requête vers Symfony: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500, detail="Erreur enregistrement clé ticket")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur communication Symfony: {e}")

    # Envoi de l’email avec le QR code
    try:
        send_ticket_email(user_email, order_id, qr_path, security_key)
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi du mail: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur d'envoi d'email : {e}")

    return {
        "message": "Billet généré et envoyé avec succès ✅",
        "order_id": order_id,
        "security_key": security_key,
        "qr_code_path": qr_path,
        "username": username
    }
