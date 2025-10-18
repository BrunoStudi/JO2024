from services.pdf_generator import generate_ticket_pdf

pdf_path = generate_ticket_pdf(
    order_id="1234",
    user_email="test@example.com",
    qr_path="tickets/ticket_46.png",  # ⚠️ Mets ici un vrai chemin vers une image QR existante
    security_key="ABCDE12345"
)

print(f"✅ PDF généré : {pdf_path}")
