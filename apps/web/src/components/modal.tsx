"use client";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/95 shadow-[0_30px_90px_-30px_rgba(15,23,42,0.75)] backdrop-blur-xl transition duration-300 ease-out motion-safe:animate-fade-in-up">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              {title ? <h2 className="text-xl font-semibold text-white">{title}</h2> : null}
              {title ? <p className="mt-1 text-sm text-slate-300">Gestiona tu negocio con más claridad.</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10"
            >
              Cerrar
            </button>
          </div>
        </div>
        <div className="space-y-6 px-6 py-6 text-slate-100">{children}</div>
        {footer ? <div className="border-t border-white/10 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
