"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, CalendarRange } from "lucide-react";
import Link from "next/link";

const metrics = [
  { label: "Empresas activas", value: "2.8k+" },
  { label: "Tiempo de setup", value: "< 15 min" },
  { label: "Satisfacción", value: "4.9/5" },
];

export function HeroIllustration() {
  return (
    <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
          <CalendarRange className="h-4 w-4" />
          Gestión moderna para tiendas, restaurantes, servicios y más
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
          Un ERP elegante para administrar cada negocio con claridad.
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          BusinessFlow centraliza inventario, ventas, finanzas, clientes, agenda y reportes en una plataforma SaaS preparada para crecer sin fricción.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Explorar plataforma <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#modulos"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            Ver módulos
          </Link>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {metrics.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
              <p className="text-2xl font-semibold text-slate-950">{item.value}</p>
              <p className="mt-1 text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_30px_90px_-30px_rgba(15,23,42,0.75)]"
      >
        <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Resumen del negocio</p>
              <p className="mt-1 text-3xl font-semibold">$84.250</p>
            </div>
            <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-300">
              +12.4%
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[
              ["Ingresos", "$128.400"],
              ["Gastos", "$44.150"],
              ["Ganancias", "$84.250"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3">
                <span className="text-sm text-slate-300">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
