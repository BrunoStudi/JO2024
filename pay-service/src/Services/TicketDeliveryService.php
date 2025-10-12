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

    public function sendTicket(array $ticketData): array
    {
        $response = $this->client->request('POST', $this->deliveryServiceUrl . '/api/deliver', [
            'json' => $ticketData,
        ]);

        return $response->toArray(false);
    }
}
