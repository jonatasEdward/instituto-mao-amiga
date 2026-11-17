import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { configurarCliente } from '../api/cliente';
import { authApi } from '../api/endpoints';
import type { DadosCadastro, Sessao, Usuario } from '../api/tipos';
import { apagarSessao, carregarSessao, salvarSessao } from './armazenamentoSessao';

type AuthContextValor = {
  carregando: boolean;
  usuario: Usuario | null;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (dados: DadosCadastro) => Promise<void>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const tokenRef = useRef<string | null>(null);

  const definirSessao = useCallback((nova: Sessao | null) => {
    tokenRef.current = nova?.token ?? null;
    setSessao(nova);
  }, []);

  const sair = useCallback(async () => {
    definirSessao(null);
    queryClient.clear();
    await apagarSessao();
  }, [definirSessao, queryClient]);

  useEffect(() => {
    configurarCliente({
      obterToken: () => tokenRef.current,
      aoExpirarSessao: () => {
        void sair();
      },
    });
  }, [sair]);

  useEffect(() => {
    carregarSessao()
      .then(definirSessao)
      .finally(() => setCarregando(false));
  }, [definirSessao]);

  const iniciar = useCallback(
    async (nova: Sessao) => {
      await salvarSessao(nova);
      definirSessao(nova);
    },
    [definirSessao],
  );

  const valor = useMemo<AuthContextValor>(
    () => ({
      carregando,
      usuario: sessao?.usuario ?? null,
      entrar: async (email, senha) => iniciar(await authApi.entrar(email, senha)),
      cadastrar: async (dados) => iniciar(await authApi.cadastrar(dados)),
      sair,
    }),
    [carregando, sessao, iniciar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValor {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  }
  return contexto;
}
