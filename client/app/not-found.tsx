import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-5xl font-bold text-indigo-600">404</p>
      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
      <ButtonLink href="/">Back to TaskFlow</ButtonLink>
    </main>
  );
}
