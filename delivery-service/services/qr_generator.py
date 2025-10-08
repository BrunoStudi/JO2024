import qrcode
import os

def generate_qr_code(data: str, filename: str) -> str:
    """
    Génère un QR code et le sauvegarde dans le dossier 'tickets/'.
    """
    output_dir = "tickets"
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, filename)

    img = qrcode.make(data)
    img.save(path)
    return path
