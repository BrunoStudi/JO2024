<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('api', name: 'api_')]
class LoginController
{
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        // Ce code ne sera jamais exécuté car c’est géré par le firewall
        return new JsonResponse(['message' => 'Should never reach here'], 500);
    }
}