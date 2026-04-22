"use client";

import { useActionState } from "react";
import { Phone, Lock } from "lucide-react";
import { login, type AuthState } from "@/actions/auth";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function LoginForm() {
  const [state, action] = useActionState<AuthState, FormData>(login, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        name="phone"
        label="Telefone"
        placeholder="9XX XXX XXX"
        inputMode="numeric"
        autoComplete="tel"
        required
        left={<Phone size={16} />}
      />
      <Input
        name="password"
        type="password"
        label="Senha"
        placeholder="••••••••"
        autoComplete="current-password"
        required
        left={<Lock size={16} />}
      />
      {state?.error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </div>
      )}
      <SubmitButton size="lg" className="mt-2 w-full">Entrar</SubmitButton>
    </form>
  );
}
