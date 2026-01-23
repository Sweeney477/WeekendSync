import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-slate-600">That route doesn’t exist.</p>
      <Link className="text-sm font-medium text-brand-700 underline" href="/">
        Back to home
      </Link>
    </main>
  );
}

