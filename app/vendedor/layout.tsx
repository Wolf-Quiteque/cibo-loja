import { requireRole } from "@/lib/auth";
import { VendorNav } from "@/components/nav/VendorNav";

export default async function VendedorLayout({ children }: { children: React.ReactNode }) {
  await requireRole("vendedor");
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-24">{children}</main>
      <VendorNav />
    </div>
  );
}
