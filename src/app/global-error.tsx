"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
            padding: 32,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Algo salió mal</h1>
          <p style={{ color: "#666", marginBottom: 24 }}>
            Ocurrió un error inesperado. Intenta de nuevo en unos minutos.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: "#ffd141",
              border: "2px solid #1a1a1a",
              padding: "10px 24px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
