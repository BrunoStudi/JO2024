<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/payment', name: 'api_payment_')]
class PaymentController extends AbstractController
{
    #[Route('/checkout', name: 'checkout', methods: ['POST'])]
    public function checkout(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Récupérer l'ID de l'utilisateur depuis le JWT
        $userId = $request->headers->get('X-USER-ID'); // Le frontend doit envoyer le userId ici
        if (!$userId) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
        }

        // Préparer le payload de réponse (simule l'enregistrement du paiement)
        $paymentData = [
            'name' => $data['name'] ?? 'Unknown',
            'price' => $data['price'] ?? 0,
            'qty' => $data['qty'] ?? 1,
            'method' => $data['method'] ?? 'unknown',
            'total' => $data['total'] ?? 0,
            'userId' => $userId,
        ];

        // Ici tu pourrais faire appel à Stripe/PayPal si nécessaire

        return new JsonResponse([
            'success' => true,
            'payment' => $paymentData,
        ]);
    }
}
