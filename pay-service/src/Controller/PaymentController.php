<?php

namespace App\Controller;

use App\Services\TicketDeliveryService;
use App\Entity\Order;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/api/pay', name: 'api_pay_')]
class PaymentController extends AbstractController
{
    private EntityManagerInterface $em;
    private HttpClientInterface $client;

    public function __construct(EntityManagerInterface $em, HttpClientInterface $client)
    {
        $this->em = $em;
        $this->client = $client;
    }

    // Création d'une commande PayPal
    #[Route('/paypal', name: 'paypal', methods: ['POST'])]
    public function createPaypalOrder(Request $request): JsonResponse
    {
        $username = $this->extractUserFromJWT($request);
        if (!$username) {
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

    // Capture de la commande PayPal et enregistrement en BDD
    #[Route('/capture', name: 'capture', methods: ['POST'])]
    public function capturePaypalOrder(Request $request, TicketDeliveryService $ticketDeliveryService): JsonResponse
    {
        $username = $this->extractUserFromJWT($request);
        if (!$username) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);
        $orderID = $data['orderID'] ?? null;
        $items = $data['items'] ?? []; // récupérer les items envoyés depuis le frontend

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

        $paypalResponse = json_decode($response, true);

        // Enregistrer la commande en BDD
        $order = new Order();
        $order->setUserId($username); // <- utiliser le username comme identifiant
        $order->setTotalAmount((float) $paypalResponse['purchase_units'][0]['payments']['captures'][0]['amount']['value']);
        $order->setOrderStatus($paypalResponse['status'] ?? 'COMPLETED');
        $order->setCreatedAt(new \DateTimeImmutable());
        $order->setItems($items);

        $this->em->persist($order);
        $this->em->flush();

        // Si paiement réussi, on appelle le microservice python delivery
        if (($paypalResponse['status'] ?? '') === 'COMPLETED') {
            try {
                $ticketData = [
                    /* retirer les /* pour utiliser l'adresse paypal 'email_address' et apres les ?? mettre l'adresse de test voulue */
                    'email' => $paypalResponse['payer']['email/*_address*/'] ?? 'r.brunocarriere@protonmail.com',
                    'name' => $paypalResponse['payer']['name']['given_name'] ?? $username,
                    'items' => $items,   // liste complète des items envoyée au PDF
                    'order_id' => $order->getId(),
                ];

                $jwtToken = $request->headers->get('Authorization');
                $deliveryResponse = $ticketDeliveryService->sendTicket($ticketData, $jwtToken);
            } catch (\Throwable $e) {
                $deliveryResponse = ['error' => 'Erreur lors de la livraison : ' . $e->getMessage()];
            }
        } else {
            $deliveryResponse = ['info' => 'Paiement non complété, ticket non envoyé'];
        }

        return $this->json([
            'status' => 'success',
            'order_id' => $order->getId(),
            'items' => $order->getItems(),
            'paypal_response' => $paypalResponse,
            'delivery_response' => $deliveryResponse
        ]);
    }

    // Enregistrer la clé ticket et chemin ticket pdf en BDD
    #[Route('/orders/{id}/ticket', name: 'order_ticket_upload', methods: ['POST'])]
    public function uploadTicket(Order $order, Request $request): JsonResponse
    {
        if (!$order) {
            return $this->json(['error' => 'Commande introuvable'], 404);
        }

        $ticketKey = $request->request->get('ticketKey');
        $ticketFile = $request->files->get('ticket_pdf');

        if (!$ticketKey || !$ticketFile) {
            return $this->json(['error' => 'ticketKey ou ticket_pdf manquant'], 400);
        }

        $email = $this->extractUserFromJWT($request);

        // Appel au auth-service pour récupérer la security_key
        $jwtToken = $request->headers->get('Authorization');
        $response = $this->client->request('GET', "http://127.0.0.1:8000/api/user/by-email/$email", [
            'headers' => [
                'Authorization' => $jwtToken,
                'Accept' => 'application/json',
            ]
        ]);

        $userData = json_decode($response->getContent(), true);
        $userKey = $userData['securityKey'] ?? null;

        if (!$userKey) {
            return $this->json(['error' => 'Clé utilisateur introuvable'], 500);
        }

        error_log("Clé utilisateur : " . $userKey);
        
        // Dossier de stockage local (ex: public/uploads/tickets)
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/tickets';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filename = 'ticket_' . $order->getId() . '.pdf';
        $ticketFile->move($uploadDir, $filename);

        // Mise à jour de la clé et du chemin du fichier
        $order->setTicketKey($ticketKey);
        $order->setTicketPdfPath('/uploads/tickets/' . $filename);

        // Générer la clé anti-fraude (SHA256 sur userKey + ticketKey)
        $antiFraudKey = hash('sha256', $userKey . $ticketKey);
        $order->setAntiFraudeKey($antiFraudKey);

        $this->em->flush();

        return $this->json([
            'success' => true,
            'file' => '/uploads/tickets/' . $filename,
            'antiFraudKey' => $antiFraudKey,
            'message' => 'Ticket PDF enregistré avec succès'
        ]);
    }

    // Endpoint pour le telechargement du billet
    #[Route('/orders/{id}/ticket/download', name: 'download_ticket', methods: ['GET'])]
    public function downloadTicket(Order $order)
    {
        $pdfPath = $order->getTicketPdfPath();

        if (!$pdfPath || !file_exists($this->getParameter('kernel.project_dir') . '/public' . $pdfPath)) {
            return $this->json(['error' => 'Billet introuvable'], 404);
        }

        return $this->file($this->getParameter('kernel.project_dir') . '/public' . $pdfPath, 'billet_' . $order->getId() . '.pdf');
    }

    // Fonction utilitaire : extraire le username depuis le JWT
    private function extractUserFromJWT(Request $request): ?string
    {
        $token = $request->headers->get('Authorization');
        if (!$token || !str_starts_with($token, 'Bearer ')) {
            return null;
        }

        $jwt = substr($token, 7);
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return null;
        }

        $payload = json_decode(base64_decode($parts[1]), true);

        return $payload['username'] ?? null; // <- ici on récupère username
    }
}
