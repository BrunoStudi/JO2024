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

        $data = array_map(fn(TicketOffer $offer) => [
            'id' => $offer->getId(),
            'name' => $offer->getName(),
            'description' => $offer->getDescription(),
            'quantity' => $offer->getQuantity(),
            'price' => $offer->getPrice(),
        ], $offers);

        return $this->json($data);
    }

    #[Route('/offers', name: 'create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $offer = new TicketOffer();
        $offer->setName($data['name'] ?? 'Offre');
        $offer->setDescription($data['description'] ?? null);
        $offer->setQuantity((int)($data['quantity'] ?? 1));
        $offer->setPrice((float)($data['price'] ?? 0.0));
        $offer->setCreatedAt(new \DateTimeImmutable());
        $offer->setUpdatedAt(new \DateTime());

        $em->persist($offer);
        $em->flush();

        return $this->json([
            'id' => $offer->getId(),
            'name' => $offer->getName(),
            'description' => $offer->getDescription(),
            'quantity' => $offer->getQuantity(),
            'price' => $offer->getPrice(),
        ], 201);
    }

    #[Route('/offers/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $offer = $em->getRepository(TicketOffer::class)->find($id);

        if (!$offer) {
            return $this->json(['message' => 'Offre non trouvée'], 404);
        }

        $em->remove($offer);
        $em->flush();

        return $this->json(['message' => 'Offre supprimée avec succès']);
    }

    #[Route('/offers/{id}', name: 'update', methods: ['PATCH'])]
    public function update(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $offer = $em->getRepository(TicketOffer::class)->find($id);

        if (!$offer) {
            return $this->json(['message' => 'Offre non trouvée'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) $offer->setName($data['name']);
        if (isset($data['description'])) $offer->setDescription($data['description']);
        if (isset($data['quantity'])) $offer->setQuantity((int)$data['quantity']);
        if (isset($data['price'])) $offer->setPrice((float)$data['price']);
        $offer->setUpdatedAt(new \DateTime());

        $em->flush();

        return $this->json([
            'id' => $offer->getId(),
            'name' => $offer->getName(),
            'description' => $offer->getDescription(),
            'quantity' => $offer->getQuantity(),
            'price' => $offer->getPrice(),
        ]);
    }
}
