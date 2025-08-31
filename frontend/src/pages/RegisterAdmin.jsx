import React, { useState } from "react";
import axios from "axios";

export default function RegisterAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:8000/api/registerAdmin", {
      email,
      password
    })
    .then(res => setMessage(res.data.message))
    .catch(err => setMessage("Erreur lors de la création de l’admin"));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Créer le premier Admin</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Créer l’Admin
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
