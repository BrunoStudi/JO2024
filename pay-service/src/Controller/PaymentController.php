<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

#[Route('/api/pay', name: 'api_pay_')]
class PaymentController extends AbstractController
{
    // 🔹 Création d'une commande PayPal
    #[Route('/paypal', name: 'paypal', methods: ['POST'])]
    public function createPaypalOrder(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $items = $data['items'] ?? [];

        if (empty($items)) {
            return $this->json(['error' => 'Panier vide'], 400);
        }

        $total = array_reduce($items, fn($sum, $item) => $sum + ($item['price'] * $item['qty']), 0);

        $url = "https://api-m.sandbox.paypal.com/v2/checkout/orders";
        $clientId = "AYBYWNdo8fpd7eHC9AFbvT28HPeEmXPhk8dQSc15i-ou9PLb--iZQRLcv5sgoGLuAfJ15YMpNzyFl6Ay";
        $secret = "ED_u6GJDM7Bl7bxDsh6O9D3IFSLLkR7dVIuVsamdNj_sc8pBpCMNAz1wyLXOM0CQg5bkEsqR81ALfETn";

        $payload = [
            'intent' => 'CAPTURE',
            'purchase_units' => [
                [
                    'amount' => [
                        'currency_code' => 'EUR',
                        'value' => number_format($total, 2, '.', ''),
                    ]
                ]
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Authorization: Basic " . base64_encode("$clientId:$secret"),
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 201 && $httpCode !== 200) {
            return $this->json(['error' => 'Erreur création commande PayPal', 'response' => $response], $httpCode);
        }

        return $this->json(json_decode($response, true));
    }

    // 🔹 Capture de la commande PayPal (orderID depuis le body)
    #[Route('/capture', name: 'capture', methods: ['POST'])]
    public function capturePaypalOrder(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $orderID = $data['orderID'] ?? null;

        if (!$orderID) {
            return $this->json(['error' => 'orderID manquant'], 400);
        }

        $clientId = "AYBYWNdo8fpd7eHC9AFbvT28HPeEmXPhk8dQSc15i-ou9PLb--iZQRLcv5sgoGLuAfJ15YMpNzyFl6Ay";
        $secret = "ED_u6GJDM7Bl7bxDsh6O9D3IFSLLkR7dVIuVsamdNj_sc8pBpCMNAz1wyLXOM0CQg5bkEsqR81ALfETn";
        $url = "https://api-m.sandbox.paypal.com/v2/checkout/orders/$orderID/capture";

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Authorization: Basic " . base64_encode("$clientId:$secret"),
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 201 && $httpCode !== 200) {
            return $this->json(['error' => 'Erreur capture PayPal', 'response' => $response], $httpCode);
        }

        // 🔹 Ici tu peux enregistrer le paiement dans ta BDD

        return $this->json(['status' => 'success', 'paypal_response' => json_decode($response, true)]);
    }
}
