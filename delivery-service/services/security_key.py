import secrets

def generate_security_key():
    """
    Génère une clé de sécurité aléatoire de 32 caractères.
    """
    return secrets.token_hex(16)
