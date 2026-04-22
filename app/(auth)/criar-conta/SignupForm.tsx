"use client";

import { useActionState, useState } from "react";
import { User, Phone, Lock } from "lucide-react";
import { signup, type AuthState } from "@/actions/auth";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/cn";

type Role = "cliente" | "vendedor";

export function SignupForm() {
  const [role, setRole] = useState<Role>("cliente");
  const [state, action] = useActionState<AuthState, FormData>(signup, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-full bg-surface p-1 border border-border">
        {(["cliente", "vendedor"] as Role[]).map((r) => (
          <button
            type="button"
            key={r}
            onClick={() => setRole(r)}
            className={cn(
              "rounded-full py-2 text-sm font-semibold transition-colors",
              role === r ? "bg-brand text-black" : "text-text-muted",
            )}
          >
            {r === "cliente" ? "Sou Cliente" : "Tenho uma Loja"}
          </button>
        ))}
      </div>
      <input type="hidden" name="role" value={role} />
      <Input
        name="name"
        label="Nome completo"
        placeholder="Ex: Ana Silva"
        autoComplete="name"
        required
        left={<User size={16} />}
      />
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
        placeholder="Mínimo 6 caracteres"
        autoComplete="new-password"
        required
        left={<Lock size={16} />}
      />
      {state?.error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </div>
      )}
      <SubmitButton size="lg" className="mt-2 w-full">Criar conta</SubmitButton>
    </form>
  );
}
