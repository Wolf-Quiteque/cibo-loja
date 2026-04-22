import { TopBar } from "@/components/nav/TopBar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar back="/" transparent />
      <main className="flex-1 px-5 pb-10">{children}</main>
    </div>
  );
}
