"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {
      // Stil — een gemiste foutmelding mag nooit zichtbaar worden voor de bezoeker.
    });
  }, [error]);

  return (
    <section className="min-h-[60vh] flex items-center justify-center py-32 text-center px-4">
      <div>
        <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">
          Fout
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">
          Er ging iets mis
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Er is een onverwachte fout opgetreden. Probeer het opnieuw, of kom later
          terug.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy/90 transition-colors"
        >
          Probeer opnieuw
        </button>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-8 max-w-lg mx-auto text-left text-xs font-mono text-red-600 bg-red-50 rounded-lg p-4 overflow-x-auto">
            {error.message}
          </pre>
        )}
      </div>
    </section>
  );
}
