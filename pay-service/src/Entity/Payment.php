<?php

namespace App\Entity;

use App\Repository\PaymentRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PaymentRepository::class)]
class Payment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'payments')]
    private ?Order $userOrder = null;

    #[ORM\Column(length: 255)]
    private ?string $payMethod = null;

    #[ORM\Column(length: 255)]
    private ?string $payStatus = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $transactionId = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserOrder(): ?Order
    {
        return $this->userOrder;
    }

    public function setUserOrder(?Order $userOrder): static
    {
        $this->userOrder = $userOrder;

        return $this;
    }

    public function getPayMethod(): ?string
    {
        return $this->payMethod;
    }

    public function setPayMethod(string $payMethod): static
    {
        $this->payMethod = $payMethod;

        return $this;
    }

    public function getPayStatus(): ?string
    {
        return $this->payStatus;
    }

    public function setPayStatus(string $payStatus): static
    {
        $this->payStatus = $payStatus;

        return $this;
    }

    public function getTransactionId(): ?string
    {
        return $this->transactionId;
    }

    public function setTransactionId(?string $transactionId): static
    {
        $this->transactionId = $transactionId;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
