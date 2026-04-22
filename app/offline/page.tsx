import { WifiOff } from "lucide-react";

export const metadata = { title: "Sem ligação" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border text-text-muted">
          <WifiOff size={26} />
        </div>
        <h1 className="text-xl font-bold">Sem ligação</h1>
        <p className="mt-2 text-sm text-text-muted">
          Não foi possível alcançar a internet. Tente novamente assim que voltar a estar online.
        </p>
      </div>
    </div>
  );
}
