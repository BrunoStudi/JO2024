<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Attributes as OA; // PHP 8+

#[OA\Post(
    path: "/api/login",
    summary: "Connexion utilisateur",
    tags: ['Authentification'],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["email", "password"],
            properties: [
                new OA\Property(property: "email", type: "string", example: "test@example.com"),
                new OA\Property(property: "password", type: "string", example: "Test1234")
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 200,
            description: "Authentification réussie",
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "token", type: "string", example: "eyJhbGciOi...")
                ]
            )
        ),
        new OA\Response(response: 401, description: "Échec d’authentification")
    ]
)]

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