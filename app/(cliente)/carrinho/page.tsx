import { TopBar } from "@/components/nav/TopBar";
import { CartView } from "./CartView";

export const metadata = { title: "Carrinho" };

export default function CarrinhoPage() {
  return (
    <>
      <TopBar title="Carrinho" back="/" />
      <div className="px-5 pb-24 pt-4">
        <CartView />
      </div>
    </>
  );
}
