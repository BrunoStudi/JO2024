<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('api/admin/user', name: 'api_admin_user_')]
class RevokeKeyController extends AbstractController
{
    #[Route('/{id}/revoke-key', name: 'id_revokekey', methods: ['GET', 'PATCH'])]
    #[IsGranted('ROLE_ADMIN')]
    public function revokeKey(Request $request, User $user, int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($id);
        if (!$user) return $this->json(['error' => 'Utilisateur non trouvé'], 404);

        $data = json_decode($request->getContent(), true);
        $user->setIsKeyActive($data['isKeyActive'] ?? true);

        $em->flush();

        return $this->json([
            'id' => $user->getId(),
            'isKeyActive' => $user->getIsKeyActive()
        ]);
    }
}
