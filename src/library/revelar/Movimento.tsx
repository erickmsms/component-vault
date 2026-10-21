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
