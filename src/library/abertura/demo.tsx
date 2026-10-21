import { Abertura } from "./Abertura";

export default function AberturaDemo() {
  return (
    <div className="w-full">
      <Abertura
        chapeu="Out 2026 · Relatório mensal"
        titulo="As vendas cresceram 12% em outubro."
        linhaFina="O crescimento veio quase todo da loja online, puxado pela campanha de frete grátis."
      />
    </div>
  );
}
