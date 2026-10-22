import { useState } from "react";
import { defineStories } from "@/registry/stories";
import { ControleDeslizante, type CorDoControle, type TamanhoDoControle, type ValorDoControle } from "./ControleDeslizante";

const reais = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function ExemploControlado() {
  const [valor, setValor] = useState<ValorDoControle>(30);
  const [salvo, setSalvo] = useState<ValorDoControle>(30);
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <ControleDeslizante rotulo="Brilho" valor={valor} aoMudar={setValor} aoSoltar={setSalvo} formatar={(n) => `${n}%`} />
      <p className="text-sm text-ink-2">
        Mudando: <strong className="text-ink tabular-nums">{String(valor)}</strong> · Salvo ao soltar:{" "}
        <strong className="text-ink tabular-nums">{String(salvo)}</strong>
      </p>
    </div>
  );
}

export default defineStories({
  args: {
    rotulo: "Volume",
    valor: 40,
    min: 0,
    max: 100,
    passo: 1,
    aparencia: "linha",
    tamanho: "md",
    cor: "destaque",
    mostrarValor: true,
    desativado: false,
  },
  controls: {
    rotulo: { type: "text" },
    valor: { type: "number", label: "valorPadrao" },
    min: { type: "number" },
    max: { type: "number" },
    passo: { type: "number", min: 0.1, step: 0.1 },
    aparencia: { type: "select", options: ["linha", "capsula"] },
    tamanho: { type: "select", options: ["sm", "md", "lg"] },
    cor: { type: "select", options: ["destaque", "sucesso", "alerta", "perigo"] },
    mostrarValor: { type: "boolean" },
    desativado: { type: "boolean" },
  },
  render: (a) => (
    <div className="w-full max-w-sm">
      <ControleDeslizante
        // A key recria o controle quando o valor inicial muda no playground
        key={`${a.valor}-${a.min}-${a.max}`}
        rotulo={(a.rotulo as string) || undefined}
        valorPadrao={a.valor as number}
        min={a.min as number}
        max={a.max as number}
        passo={a.passo as number}
        aparencia={a.aparencia as "linha" | "capsula"}
        tamanho={a.tamanho as TamanhoDoControle}
        cor={a.cor as CorDoControle}
        mostrarValor={a.mostrarValor as boolean}
        desativado={a.desativado as boolean}
      />
    </div>
  ),
  stories: [
    { name: "Valor único" },
    { name: "Cápsula", args: { aparencia: "capsula", rotulo: "Opacidade", valor: 70 } },
    {
      name: "Intervalo de preço",
      render: () => (
        <div className="w-full max-w-sm">
          <ControleDeslizante rotulo="Preço" valorPadrao={[120, 480]} min={0} max={600} passo={10} distanciaMinima={50} formatar={reais} />
        </div>
      ),
    },
    {
      name: "Com marcas",
      render: () => (
        <div className="w-full max-w-sm">
          <ControleDeslizante
            rotulo="Qualidade do vídeo"
            valorPadrao={720}
            min={240}
            max={2160}
            soNasMarcas
            formatar={(n) => `${n}p`}
            marcas={[
              { valor: 240, rotulo: "240p" },
              { valor: 720, rotulo: "720p" },
              { valor: 1080, rotulo: "1080p" },
              { valor: 2160, rotulo: "4K" },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Marcas no passo",
      render: () => (
        <div className="w-full max-w-sm">
          <ControleDeslizante
            rotulo="Nota"
            valorPadrao={3}
            min={1}
            max={5}
            aparencia="capsula"
            marcas={[1, 2, 3, 4, 5].map((n) => ({ valor: n, rotulo: String(n) }))}
          />
        </div>
      ),
    },
    {
      name: "Tamanhos e cores",
      render: () => (
        <div className="grid w-full max-w-2xl gap-8 sm:grid-cols-2">
          {(["sm", "md", "lg"] as const).map((t, i) => (
            <ControleDeslizante key={t} rotulo={`Linha ${t}`} tamanho={t} cor={(["destaque", "sucesso", "perigo"] as const)[i]} valorPadrao={30 + i * 20} />
          ))}
          {(["sm", "md", "lg"] as const).map((t, i) => (
            <ControleDeslizante key={t} rotulo={`Cápsula ${t}`} aparencia="capsula" tamanho={t} cor={(["destaque", "alerta", "sucesso"] as const)[i]} valorPadrao={[20 + i * 10, 70 + i * 5]} />
          ))}
        </div>
      ),
    },
    {
      name: "Vertical",
      render: () => (
        <div className="flex gap-10">
          <ControleDeslizante rotulo="Graves" orientacao="vertical" valorPadrao={60} />
          <ControleDeslizante rotulo="Agudos" orientacao="vertical" aparencia="capsula" valorPadrao={35} cor="sucesso" />
          <ControleDeslizante rotulo="Faixa" orientacao="vertical" valorPadrao={[25, 75]} />
        </div>
      ),
    },
    { name: "Controlado (aoMudar e aoSoltar)", render: () => <ExemploControlado /> },
    { name: "Desativado", args: { desativado: true } },
  ],
});
