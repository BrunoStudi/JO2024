import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

def send_ticket_email(to_email: str, order_id: int, qr_path: str, security_key: str):
    """
    Envoie un e-mail contenant le billet (QR code) au client.
    """
    # ---- Configuration SMTP ----
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    SMTP_SERVER = os.getenv("SMTP_SERVER")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

    if not SMTP_USER or not SMTP_PASSWORD:
        raise ValueError("Les identifiants SMTP ne sont pas définis dans les variables d'environnement")

    # ---- Création du message ----
    msg = EmailMessage()
    msg["Subject"] = f"🎟️ Votre billet de commande #{order_id}"
    msg["From"] = SMTP_USER
    msg["To"] = to_email

    msg.set_content(f"""
Bonjour,

Merci pour votre achat ! 🎉
Vous trouverez en pièce jointe votre billet pour la commande référence: {order_id}.

Clé de sécurité : {security_key}

Conservez ce mail, il vous permettra d'accéder à votre événement.

Cordialement,
L’équipe des Jeux Olympiques 2024
    """)

    # ---- Ajout du QR code en pièce jointe ----
    with open(qr_path, "rb") as f:
        msg.add_attachment(
            f.read(),
            maintype="image",
            subtype="png",
            filename=os.path.basename(qr_path)
        )

    # ---- Envoi du mail ----
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(msg)

    print(f"✅ E-mail envoyé à {to_email}")
