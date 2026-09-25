"use client";

import { useState, FormEvent } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { subscribeNewsletter } = await import("@/lib/actions/newsletter");
    const result = await subscribeNewsletter(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return <p className="text-sm text-ajicolor-green font-semibold">¡Gracias por suscribirte!</p>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="flex-1 min-w-0 border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-block bg-ajicolor-yellow px-4 text-xs disabled:opacity-50"
        >
          {loading ? "..." : "Unirme"}
        </button>
      </form>
      {error && <p className="text-xs font-semibold text-ajicolor-magenta mt-2">{error}</p>}
    </div>
  );
}
