<?php

namespace App\Controller;

use App\Entity\TicketOffer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/tickets', name: 'api_tickets_')]
class TicketOfferController extends AbstractController
{
    #[Route('/offers', name: 'list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $offers = $em->getRepository(TicketOffer::class)->findAll();
        $data = [];

        foreach ($offers as $offer) {
            $data[] = [
                'id' => $offer->getId(),
                'name' => $offer->getName(),
                'description' => $offer->getDescription(),
                'quantity' => $offer->getQuantity(),
                'price' => $offer->getPrice(),
            ];
        }
        return $this->json($data);
    }

    #[Route('/offers', name: 'create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $offer = new TicketOffer();
        $offer->setName($data['name'] ?? 'Offre');
        $offer->setDescription($data['description'] ?? null);
        $offer->setQuantity($data['quantity'] ?? 1);
        $offer->setPrice($data['price'] ?? 0.0);
        $offer->setCreatedAt(new \DateTimeImmutable());
        $offer->setUpdatedAt(new \DateTime());

        $em->persist($offer);
        $em->flush();

        return $this->json(['message' => 'Offre créée avec succès', 'id' => $offer->getId()], 201);
    }
}
