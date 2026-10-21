"use client";

import { MenuSuspenso } from "@/library/menu-suspenso/MenuSuspenso";

export type OpcaoDoSeletorUnico<T extends string> = { valor: T; rotulo: string };

/** Caixa de seleção de uma opção só: mostra a escolhida no botão e fecha a lista ao escolher outra. */
export function SeletorUnico<T extends string>({
  rotulo,
  opcoes,
  valor,
  aoEscolher,
}: {
  rotulo: string;
  opcoes: ReadonlyArray<OpcaoDoSeletorUnico<T>>;
  valor: T;
  aoEscolher: (valor: T) => void;
}) {
  const nome = `seletor-${rotulo}`;
  return (
    <MenuSuspenso rotulo={rotulo} resumo={opcoes.find((o) => o.valor === valor)?.rotulo ?? ""} larguraDoPainel="w-64">
      {(fechar) => (
        <ul className="py-1">
          {opcoes.map((o) => (
            <li key={o.valor}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 px-3 text-sm hover:bg-surface">
                <input
                  type="radio"
                  name={nome}
                  checked={o.valor === valor}
                  onChange={() => {
                    aoEscolher(o.valor);
                    fechar();
                  }}
                  className="size-4 shrink-0 cursor-pointer accent-accent"
                />
                <span className="min-w-0 truncate">{o.rotulo}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </MenuSuspenso>
  );
}
