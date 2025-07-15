<?php
declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('api', name: 'api_')]
class RegistrationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $hasher,
        private ValidatorInterface $validator,
        private UserRepository $userRepository
    ) {}

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        return $this->handleUserCreation($request, ['ROLE_USER']);
    }

    #[IsGranted('ROLE_ADMIN')]
    #[Route('/registerAdmin', name: 'register_admin', methods: ['POST'])]
    public function registerAdmin(Request $request): JsonResponse
    {
        return $this->handleUserCreation($request, ['ROLE_ADMIN']);
    }

    private function handleUserCreation(Request $request, array $roles): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            return $this->json(['error' => 'Email et mot de passe requis'], 400);
        }

        // Vérifier que l'utilisateur n'existe pas déjà
        if ($this->userRepository->findOneBy(['email' => $email])) {
            return $this->json(['error' => 'Cet email est déjà utilisé'], 400);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($this->hasher->hashPassword($user, $password));
        $user->setSecurityKey(Uuid::v4()->toRfc4122()); // Rfc4122 -> convertit cet objet Uuid en une string lisible et conforme à la norme
        $user->setRoles($roles);

        // Validation des contraintes
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        try {
            $this->em->persist($user);
            $this->em->flush();
        } catch (\Exception $e) {
            // Loger l'erreur en prod plutôt que d'exposer le message
            return $this->json(['error' => 'Erreur serveur lors de la création de l\'utilisateur'], 500);
        }

        $roleLabel = in_array('ROLE_ADMIN', $roles) ? 'Administrateur' : 'Utilisateur';

        return $this->json([
            'message' => "$roleLabel créé avec succès",
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
            ],
        ], 201);
    }
}
