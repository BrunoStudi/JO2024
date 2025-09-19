<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\Payment;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/orders')]
class OrderController extends AbstractController
{
    #[Route('', name: 'create_order', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['userId']) || !isset($data['items']) || !isset($data['total'])) {
            return new JsonResponse(['error' => 'Invalid payload'], 400);
        }

        // Création de la commande
        $order = new Order();
        $order->setUserId($data['userId']);
        $order->setTotalAmount($data['total']);
        $order->setOrderStatus('pending');
        $order->setCreatedAt(new \DateTimeImmutable());

        $em->persist($order);

        // Ajout d’un paiement lié à la commande
        $payment = new Payment();
        $payment->setUserOrder($order);
        $payment->setPayMethod($data['method'] ?? 'paypal');
        $payment->setPayStatus('initiated');
        $payment->setCreatedAt(new \DateTimeImmutable());

        $em->persist($payment);
        $em->flush();

        return new JsonResponse([
            'message' => 'Order created successfully',
            'orderId' => $order->getId(),
            'paymentId' => $payment->getId(),
        ], 201);
    }

    #[Route('/user/{userId}', name: 'get_orders_by_user', methods: ['GET'])]
    public function getOrdersByUser(int $userId, EntityManagerInterface $em): JsonResponse
    {
        $orders = $em->getRepository(Order::class)->findBy(['userId' => $userId]);

        $data = [];
        foreach ($orders as $order) {
            $data[] = [
                'id' => $order->getId(),
                'total' => $order->getTotalAmount(),
                'status' => $order->getStatus(),
                'createdAt' => $order->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }

        return new JsonResponse($data);
    }
}
