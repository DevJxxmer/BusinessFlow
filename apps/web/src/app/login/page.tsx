"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("Autenticando...");

    try {
      const response = await api.auth.login({ email, password });
      window.localStorage.setItem("accessToken", response.accessToken);
      window.localStorage.setItem("user", JSON.stringify(response.user));
      router.push("/app");
    } catch {
      setStatus("Credenciales inválidas. Intenta de nuevo.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#ffffff_100%)] px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_30px_90px_-30px_rgba(15,23,42,0.75)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">BusinessFlow</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Inicia sesión</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">Accede al panel de administración de tu negocio.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            placeholder="Correo electrónico"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            placeholder="Contraseña"
          />
          <button className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Entrar al panel
          </button>
        </form>

        {status && <p className="mt-4 text-sm text-slate-600">{status}</p>}

        <p className="mt-4 text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="font-semibold text-slate-950">
            Crear una
          </Link>
        </p>
      </div>
    </div>
  );
}
