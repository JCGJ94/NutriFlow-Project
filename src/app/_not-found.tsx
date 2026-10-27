import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-24">
      <div className="mx-auto max-w-2xl space-y-6 text-center text-muted">
        <p className="text-sm uppercase tracking-[0.4em] text-muted">404 · error</p>
        <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">Página no encontrada</h1>
        <p className="text-base text-muted">
          Lo sentimos, no pudimos encontrar la ruta que buscabas.
          Si sigues viendo este mensaje, regresa al inicio o navega a otra sección para continuar.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-signal px-6 py-3 text-sm font-semibold text-signal-ink transition hover:bg-signal/90"
          >
            Volver a NutriFlow
          </Link>
        </div>
      </div>
    </div>
  );
}
