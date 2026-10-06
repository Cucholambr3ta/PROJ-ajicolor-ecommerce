"use client";

import { Component, type ReactNode } from "react";

/**
 * Error boundary genérico alrededor del <Canvas> 3D. Si WebGL/Three explota
 * por cualquier razón, el fallback (Preview2D) se muestra en su lugar — el
 * usuario nunca ve una pantalla rota (spec §7.4 "Robustez").
 */
export default class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("[cotizador] Preview3D falló, usando fallback 2D:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
