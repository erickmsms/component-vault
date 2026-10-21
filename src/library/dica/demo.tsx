import { Dica, Termo } from "./Dica";

export default function DicaDemo() {
  return (
    <div className="flex max-w-md flex-col gap-4 text-[15px] leading-relaxed">
      <p>
        A{" "}
        <Termo dica="Percentual de visitantes que fizeram uma compra no período.">taxa de conversão</Termo>{" "}
        subiu para 3,2% em outubro.
      </p>
      <p className="flex items-center gap-2 text-ink-2">
        Só o ícone:{" "}
        <Dica termo="NPS" texto="Net Promoter Score: o quanto os clientes recomendariam o produto, de −100 a 100." />
      </p>
    </div>
  );
}
