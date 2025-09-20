<?php

namespace App\Controller;

use App\Entity\Order;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/orders')]
class OrderController extends AbstractController
{
    // 🔹 Endpoint pour récupérer les commandes de l’utilisateur connecté
    #[Route('/my', name: 'get_my_orders', methods: ['GET'])]
    public function getMyOrders(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        if (!$token || !str_starts_with($token, 'Bearer ')) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $jwt = substr($token, 7);
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return $this->json(['error' => 'JWT invalide'], 400);
        }

        $payload = json_decode(base64_decode($parts[1]), true);
        $username = $payload['username'] ?? null;

        if (!$username) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        $orders = $em->getRepository(Order::class)->findBy(['userId' => $username], ['createdAt' => 'DESC']);

        $data = array_map(function($order) {
            return [
                'id' => $order->getId(),
                'totalAmount' => $order->getTotalAmount(),
                'status' => $order->getOrderStatus(),
                'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $orders);

        return $this->json($data);
    }
}
