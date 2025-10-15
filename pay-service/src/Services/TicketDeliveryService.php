<?php

namespace App\Services;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class TicketDeliveryService
{
    private HttpClientInterface $client;
    private string $deliveryServiceUrl;

    public function __construct(HttpClientInterface $client, string $deliveryServiceUrl)
    {
        $this->client = $client;
        $this->deliveryServiceUrl = rtrim($deliveryServiceUrl, '/');
    }

    /**
     * Envoie les données du ticket au microservice Python.
     *
     * @param array $ticketData Données du ticket à envoyer
     * @param string|null $jwtToken JWT pour authentifier la requête
     * @return array Réponse du service de livraison
     */
    public function sendTicket(array $ticketData, ?string $jwtToken = null): array
    {
        $headers = [
            'Content-Type' => 'application/json',
            'X-Service-Key' => '5hT9vQ2#xP8rZ1!dLw6YbNc7JkR0fGhM',
        ];

        // Si un token est fourni, on l'ajoute correctement
        if ($jwtToken) {
            if (!str_starts_with($jwtToken, 'Bearer ')) {
                $jwtToken = 'Bearer ' . trim($jwtToken);
            }
            $headers['Authorization'] = $jwtToken;
        }

        $response = $this->client->request('POST', $this->deliveryServiceUrl . '/api/deliver', [
            'headers' => $headers,
            'json' => $ticketData,
        ]);

        return $response->toArray(false);
    }
}
