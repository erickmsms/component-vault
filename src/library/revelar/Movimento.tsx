"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";

const ContextoDeMovimento = createContext(false);

/**
 * Desliga as animações dos componentes abaixo dele: eles aparecem já no estado
 * final. Útil em miniaturas, impressão e testes.
 */
export function ProvedorDeMovimento({ reduzido = true, children }: { reduzido?: boolean; children: ReactNode }) {
  return <ContextoDeMovimento.Provider value={reduzido}>{children}</ContextoDeMovimento.Provider>;
}

const CONSULTA = "(prefers-reduced-motion: reduce)";

function assinar(aviso: () => void) {
  const consulta = matchMedia(CONSULTA);
  consulta.addEventListener("change", aviso);
  return () => consulta.removeEventListener("change", aviso);
}

/** Verdadeiro quando o sistema pede menos movimento ou um ProvedorDeMovimento desligou as animações. */
export function useSemMovimento() {
  const doSistema = useSyncExternalStore(assinar, () => matchMedia(CONSULTA).matches, () => false);
  return useContext(ContextoDeMovimento) || doSistema;
}

/** Fica verdadeiro quando o elemento entra na tela (só na primeira vez, por padrão). */
export function useEmTela<T extends Element>(
  ref: RefObject<T | null>,
  { margem = "0px", limiar = 0, umaVez = true }: { margem?: string; limiar?: number; umaVez?: boolean } = {},
) {
  const [emTela, setEmTela] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setEmTela(true);
          if (umaVez) observador.disconnect();
        } else if (!umaVez) {
          setEmTela(false);
        }
      },
      { rootMargin: margem, threshold: limiar },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [ref, margem, limiar, umaVez]);

  return emTela;
}

/** Curva de saída suave usada pelas animações da biblioteca. */
export const CURVA_SUAVE = "cubic-bezier(0.16, 1, 0.3, 1)";

const ContextoDeMiniatura = createContext(false);

/**
 * Marca o trecho como miniatura de catálogo: as animações que dependem do mouse ou da
 * rolagem passam a se mostrar sozinhas, com um ponteiro de mentira ou um progresso em ciclo.
 */
export function ProvedorDeMiniatura({ children }: { children: ReactNode }) {
  return <ContextoDeMiniatura.Provider value>{children}</ContextoDeMiniatura.Provider>;
}

/** Verdadeiro dentro de um ProvedorDeMiniatura. */
export function useMiniatura() {
  return useContext(ContextoDeMiniatura);
}

/** Posição do ponteiro em coordenadas da janela; nulo quando ele sai. `mouse` é falso para toque e caneta. */
export type Ponteiro = { x: number; y: number; mouse: boolean } | null;

/**
 * Assina o ponteiro para efeitos que seguem o mouse; devolve a função que cancela. Fora da
 * miniatura, ouve o ponteiro real na janela. Na miniatura, ignora o real e passeia um ponteiro
 * de mentira por cima de `el`, só enquanto ele está na tela.
 */
export function assinarPonteiro(el: Element, miniatura: boolean, aoMover: (p: Ponteiro) => void) {
  if (!miniatura) {
    const mover = (e: PointerEvent) => aoMover({ x: e.clientX, y: e.clientY, mouse: e.pointerType === "mouse" });
    const sair = () => aoMover(null);
    window.addEventListener("pointermove", mover, { passive: true });
    document.documentElement.addEventListener("pointerleave", sair);
    return () => {
      window.removeEventListener("pointermove", mover);
      document.documentElement.removeEventListener("pointerleave", sair);
    };
  }

  let quadro = 0;
  const passo = (agora: number) => {
    const c = el.getBoundingClientRect();
    // Percurso em laço (Lissajous) que cruza o elemento de ponta a ponta
    aoMover({
      x: c.left + c.width * (0.5 + 0.55 * Math.sin(agora / 1300)),
      y: c.top + c.height * (0.5 + 0.35 * Math.sin(agora / 800)),
      mouse: true,
    });
    quadro = requestAnimationFrame(passo);
  };
  const observador = new IntersectionObserver(([entrada]) => {
    cancelAnimationFrame(quadro);
    quadro = entrada.isIntersecting ? requestAnimationFrame(passo) : 0;
  });
  observador.observe(el);
  return () => {
    observador.disconnect();
    cancelAnimationFrame(quadro);
  };
}
