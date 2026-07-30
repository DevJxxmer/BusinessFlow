"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function WelcomeNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    setIsAuthenticated(Boolean(token));
  }, []);

  return (
    <div className="flex items-center gap-3">
      {isAuthenticated ? (
        <Link
          href="/app"
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Ir al panel
        </Link>
      ) : (
        <>
          <Link
            href="/login"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Crear cuenta
          </Link>
        </>
      )}
    </div>
  );
}
