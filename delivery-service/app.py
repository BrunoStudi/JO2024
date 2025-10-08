from fastapi import FastAPI, HTTPException, Request
from services.qr_generator import generate_qr_code
from services.security_key import generate_security_key
from services.email_sender import send_ticket_email
import uuid

app = FastAPI(title="Delivery Service", version="1.0")

@app.post("/api/deliver")
async def deliver_ticket(request: Request):
    data = await request.json()

    user_email = data.get("email")
    order_id = data.get("order_id")
    if not user_email or not order_id:
        raise HTTPException(status_code=400, detail="email et order_id sont requis")

    # 🔹 Génération de la clé et du QR code
    security_key = generate_security_key()
    qr_content = f"order:{order_id}|key:{security_key}"
    qr_path = generate_qr_code(qr_content, f"ticket_{order_id}.png")

    # 🔹 Envoi du mail
    try:
        send_ticket_email(user_email, order_id, qr_path, security_key)
    except Exception as e:
        print("Erreur lors de l'envoi du mail:", e)
        raise HTTPException(status_code=500, detail=f"Erreur d'envoi d'email : {e}")

    return {
        "message": "Billet généré et envoyé avec succès ✅",
        "order_id": order_id,
        "security_key": security_key,
        "qr_code_path": qr_path
    }
