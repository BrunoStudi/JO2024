import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors

def generate_ticket_pdf(order_id: str, user_email: str, firstname: str, lastname: str, qr_path: str, logo_path: str = None,
                        items: list[dict] = None) -> str:
    
    # Liste des offres
    if items is None or len(items) == 0:
        items = [{"name": "Offre non spécifiée", "qty": 1, "total": 0}]

    # Calcul du prix total
    total_price = sum(item.get("total", 0) for item in items)

    # Création du dossier pour l'enregistrement des billets si inexistant
    output_dir = "tickets"
    os.makedirs(output_dir, exist_ok=True)

    # et enregistrement dedans
    pdf_path = os.path.join(output_dir, f"ticket_{order_id}.pdf")
    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    # Fond et titre
    c.setFillColor(colors.HexColor("#003366"))
    c.rect(0, height - 100, width, 100, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(width / 2, height - 60, "Billet Officiel")
    c.setFont("Helvetica", 16)
    c.drawCentredString(width / 2, height - 80, "Jeux Olympiques 2024")

    # Logo en haut à gauche
    if logo_path and os.path.exists(logo_path):
        try:
            logo_width = 60
            logo_height = 60
            logo_x = 50
            logo_y = height - 60 - logo_height/2  # ajuster verticalement
            c.drawImage(logo_path, logo_x, logo_y, width=logo_width, height=logo_height, preserveAspectRatio=True, mask='auto')
        except Exception as e:
            c.setFillColor(colors.red)
            c.setFont("Helvetica-Oblique", 10)
            c.drawString(50, height - 110, f"[Erreur Logo] {e}")

    # Bloc principal encadré
    margin = 50
    box_top = height - 120
    box_bottom = 150  # laisser espace pour pied de page
    c.setStrokeColor(colors.HexColor("#003366"))
    c.setLineWidth(2)
    c.roundRect(margin, box_bottom, width - 2*margin, box_top - box_bottom, 10, stroke=1, fill=0)

    # Informations principales
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 12)
    info_y = box_top - 30
    c.drawString(margin + 20, info_y, f"Commande : {order_id}")
    info_y -= 20
    c.drawString(margin + 20, info_y, f"Email : {user_email}")
    info_y -= 20
    c.drawString(margin + 20, info_y, f"prénom, nom : {firstname}, {lastname}")
    info_y -= 20
    c.drawString(margin + 20, info_y, f"Prix total : {total_price} €")

    # Liste des items
    info_y -= 20
    c.setFont("Helvetica", 12)
    for item in items:
        name = item.get("name", "Offre inconnue")
        qty = item.get("qty", 1)
        line = f"{qty} billet{'s' if qty > 1 else ''} pour l'offre : {name}"
        c.drawString(margin + 20, info_y, line)
        info_y -= 18

    # QR code centré dans le bloc principal
    try:
        qr_img = ImageReader(qr_path)
        qr_size = 200
        qr_x = (width - qr_size) / 2
        # Centrer verticalement entre info_y et box_bottom
        qr_y = box_bottom + (info_y - box_bottom - qr_size) / 2
        c.setStrokeColor(colors.HexColor("#003366"))
        c.setLineWidth(3)
        c.rect(qr_x-2, qr_y-2, qr_size+4, qr_size+4, fill=0, stroke=1)
        c.drawImage(qr_img, qr_x, qr_y, width=qr_size, height=qr_size)
    except Exception as e:
        c.setFont("Helvetica-Oblique", 12)
        c.setFillColor(colors.red)
        c.drawString(margin, box_bottom + 20, f"[Erreur QR] Impossible d’ajouter le QR code : {e}")

    # Pied de page
    c.setFont("Helvetica-Oblique", 10)
    c.setFillColor(colors.grey)
    c.drawCentredString(width / 2, 50, "Merci pour votre achat ! Présentez ce billet à l’entrée.")

    c.showPage()
    c.save()

    return pdf_path
