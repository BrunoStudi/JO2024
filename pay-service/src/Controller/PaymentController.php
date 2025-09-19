<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Http\Authentication\AuthenticationUtils;

#[Route('/api/pay', name: 'api_pay_')]
class PaymentController extends AbstractController
{
    private function getPayPalClient(): PayPalHttpClient
    {
        $clientId = 'AYBYWNdo8fpd7eHC9AFbvT28HPeEmXPhk8dQSc15i-ou9PLb--iZQRLcv5sgoGLuAfJ15YMpNzyFl6Ay';
        $clientSecret = 'ED_u6GJDM7Bl7bxDsh6O9D3IFSLLkR7dVIuVsamdNj_sc8pBpCMNAz1wyLXOM0CQg5bkEsqR81ALfETn';
        $environment = new SandboxEnvironment($clientId, $clientSecret);
        return new PayPalHttpClient($environment);
    }

    #[Route('/paypal', name: 'paypal', methods: ['POST'])]
    public function paypal(Request $request): JsonResponse
    {
        // 🔹 Vérification de l'utilisateur JWT
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['items']) || !is_array($data['items'])) {
            return $this->json(['error' => 'Payload invalide'], 400);
        }

        // 🔹 Calcul total à partir du panier
        $total = 0;
        foreach ($data['items'] as $item) {
            if (!isset($item['price'], $item['qty'])) continue;
            $total += $item['price'] * $item['qty'];
        }

        // 🔹 Création d'un ordre PayPal réel
        $orderRequest = new OrdersCreateRequest();
        $orderRequest->prefer('return=representation');
        $orderRequest->body = [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'amount' => [
                    'currency_code' => 'EUR',
                    'value' => number_format($total, 2, '.', ''),
                ],
                'description' => 'Achat billets JO 2024',
            ]],
            'application_context' => [
                'brand_name' => 'JO 2024',
                'landing_page' => 'BILLING',
                'user_action' => 'PAY_NOW',
                'return_url' => 'http://localhost:3000/success',
                'cancel_url' => 'http://localhost:3000/cancel'
            ]
        ];

        try {
            $response = $this->getPayPalClient()->execute($orderRequest);
            $orderId = $response->result->id;

            return $this->json([
                'id' => $orderId,
                'total' => $total,
                'currency' => 'EUR'
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }
}
