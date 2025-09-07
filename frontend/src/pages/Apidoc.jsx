import React from "react";
import Sidebar from "../Composants/Sidebar";

export default function DocApi() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Documentation API</h1>
        <iframe
          src="http://127.0.0.1:8000/api/doc"
          title="Documentation API"
          className="w-full h-[90vh] border rounded-lg"
        />
      </div>
    </div>
  );
}
