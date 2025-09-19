<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

#[Route('/api/pay', name: 'api_pay_')]
class PaymentController extends AbstractController
{
    #[Route('/paypal', name: 'paypal', methods: ['POST'])]
    public function paypal(Request $request): JsonResponse
    {
        $user = $this->getUser(); // récupère l'utilisateur depuis le JWT
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $userIdentifier = method_exists($user, 'getUserIdentifier')
            ? $user->getUserIdentifier()
            : ($user['useremail'] ?? null); // selon la structure de ton JWT

        if (!$userIdentifier) {
            return $this->json(['error' => 'Impossible de récupérer l\'identifiant utilisateur'], 400);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['items']) || !is_array($data['items'])) {
            return $this->json(['error' => 'Payload invalide'], 400);
        }

        $items = $data['items'];

        $total = array_reduce($items, fn($sum, $item) => $sum + ($item['total'] ?? 0), 0);

        // Lien PayPal simulé pour test
        $approvalUrl = "https://www.sandbox.paypal.com/checkoutnow?token=EXEMPLE";

        return $this->json([
            'userIdentifier' => $userIdentifier,
            'items' => $items,
            'total' => $total,
            'approvalUrl' => $approvalUrl
        ]);
    }
}
