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
    // Endpoint pour récupérer les commandes de l’utilisateur connecté
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

        $data = array_map(function ($order) {
            $items = $order->getItems(); // récupère les items stockés
            // on ne garde que le nom de l'offre
            $itemNames = array_map(fn($item) => $item['name'] ?? 'Offre inconnue', $items);

            return [
                'id' => $order->getId(),
                'totalAmount' => $order->getTotalAmount(),
                'status' => $order->getOrderStatus(),
                'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
                'items' => $itemNames, // tableau de noms d'offres uniquement
            ];
        }, $orders);

        return $this->json($data);
    }

    // Endpoint pour récupérer une commande par son ID
    #[Route('/{id}', name: 'get_order_by_id', methods: ['GET'])]
    public function getOrderById(int $id, Request $request, EntityManagerInterface $em): JsonResponse
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

        $order = $em->getRepository(Order::class)->find($id);

        if (!$order || $order->getUserId() !== $username) {
            return $this->json(['error' => 'Commande introuvable'], 404);
        }

        $items = $order->getItems();
        $itemNames = array_map(fn($item) => [
            'name' => $item['name'] ?? 'Offre inconnue',
            'qty' => $item['qty'] ?? 1,
        ], $items);

        return $this->json([
            'id' => $order->getId(),
            'totalAmount' => $order->getTotalAmount(),
            'status' => $order->getOrderStatus(),
            'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
            'items' => $itemNames,
            'ticketPdfPath' => $order->getTicketPdfPath(),
        ]);
    }
}
