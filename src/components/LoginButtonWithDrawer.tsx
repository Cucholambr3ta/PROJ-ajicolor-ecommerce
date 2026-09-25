"use client";

import { useState } from "react";
import { AuthDrawer } from "@/components/AuthDrawer";

export function LoginButtonWithDrawer({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className ?? "btn-block bg-ajicolor-yellow"}>
        Login
      </button>
      <AuthDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
