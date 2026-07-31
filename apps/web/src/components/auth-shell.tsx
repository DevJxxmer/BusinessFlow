"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      const token = window.localStorage.getItem("accessToken");
      if (!token) {
        setIsAuthenticated(false);
        setReady(true);
        return;
      }

      try {
        await api.auth.me();
        setIsAuthenticated(true);
      } catch {
        window.localStorage.removeItem("accessToken");
        window.localStorage.removeItem("user");
        setIsAuthenticated(false);
        if (!pathname.startsWith("/login") && !pathname.startsWith("/register")) {
          router.push("/login");
        }
      } finally {
        setReady(true);
      }
    }

    verifyToken();
  }, [pathname, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("Autenticando...");

    try {
      const response = authMode === "login"
        ? await api.auth.login({ email, password })
        : await api.auth.register({ email, password, name });

      window.localStorage.setItem("accessToken", response.accessToken);
      window.localStorage.setItem("user", JSON.stringify(response.user));
      setIsAuthenticated(true);
      setStatus("Acceso correcto");
    } catch (error) {
      setStatus("No fue posible iniciar sesión");
      console.error(error);
    }
  };

  if (!ready) {
    return null;
  }

  const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/register";

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#ffffff_100%)] px-4 py-10">
        <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_30px_90px_-30px_rgba(15,23,42,0.75)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">BusinessFlow</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {authMode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Accede a tu espacio de negocio y gestiona operaciones desde un solo lugar.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {authMode === "register" && (
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0"
                placeholder="Tu nombre"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0"
              placeholder="Correo electrónico"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0"
              placeholder="Contraseña"
            />
            <button className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              {authMode === "login" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-500">
            {authMode === "login" ? "¿Aún no tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button
              type="button"
              onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
              className="font-semibold text-slate-950"
            >
              {authMode === "login" ? "Crear una" : "Iniciar sesión"}
            </button>
          </p>

          {status && <p className="mt-4 text-sm text-slate-600">{status}</p>}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
