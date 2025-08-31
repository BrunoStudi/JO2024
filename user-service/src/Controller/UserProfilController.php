<?php

namespace App\Controller;

use App\Entity\UserProfile;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('api/user', name: 'api_user_')]
class UserProfilController extends AbstractController
{
    #[Route('/profile', name: 'profile', methods: ['GET', 'POST', 'PUT'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function handleProfile(
        Request $request,
        EntityManagerInterface $em,
        ValidatorInterface $validator
    ): JsonResponse {
        $userEmail = $this->getUser()?->getUserIdentifier();

        // On vérifie si le profil existe déjà
        $profile = $em->getRepository(UserProfile::class)
            ->findOneBy(['userEmail' => $userEmail]);

        // Si GET, renvoyer le profil existant
        if ($request->isMethod('GET')) {
            if (!$profile) {
                return $this->json(['profile' => null], 200);
            }

            return $this->json([
                'profile' => [
                    'firstName' => $profile->getFirstName(),
                    'lastName' => $profile->getLastName(),
                    'address' => $profile->getAddress(),
                    'phone' => $profile->getPhone(),
                    'email' => $profile->getUserEmail(),
                ]
            ], 200);
        }

        // POST : créer ou mettre à jour
        $data = json_decode($request->getContent(), true);

        if (!$profile) {
            $profile = new UserProfile();
            $profile->setUserEmail($userEmail);
        }

        $profile->setFirstName($data['firstName'] ?? '');
        $profile->setLastName($data['lastName'] ?? '');
        $profile->setAddress($data['address'] ?? null);
        $profile->setPhone($data['phone'] ?? null);

        $errors = $validator->validate($profile);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        try {
            $em->persist($profile);
            $em->flush();
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur serveur lors de la sauvegarde du profil'], 500);
        }

        return $this->json([
            'message' => 'Profil sauvegardé avec succès',
            'profile' => [
                'firstName' => $profile->getFirstName(),
                'lastName' => $profile->getLastName(),
                'address' => $profile->getAddress(),
                'phone' => $profile->getPhone(),
                'email' => $profile->getUserEmail(),
            ]
        ], 200);
    }
}
