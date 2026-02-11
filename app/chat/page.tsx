"use client";

import { useState } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  async function send() {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: input }],
      }),
    });

    const data = await res.json();
    setResponse(data.message);
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold mb-4">Zentra Chatbot</h1>

      <input
        className="border p-2 w-full"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question..."
      />

      <button onClick={send} className="mt-2 px-4 py-2 border">
        Send
      </button>

      {response && <p className="mt-4">{response}</p>}
    </div>
  );
}
