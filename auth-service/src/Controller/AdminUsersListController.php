<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('api/admin', name: 'api_admin_')]
class AdminUsersListController extends AbstractController
{
    #[Route('/users', name: 'users', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function listUsers(EntityManagerInterface $em): JsonResponse
    {
        $users = $em->getRepository(User::class)->findAll();

        $data = [];
        foreach ($users as $user) {
            $data[] = [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'publicKey' => $user->getSecurityKey(),
            ];
        }

        return $this->json($data);
    }
}

