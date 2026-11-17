import { requisitar } from './cliente';
import type { DadosCadastro, DadosPonto, Doacao, NovaDoacao, Pagina, Ponto, Sessao } from './tipos';

export const authApi = {
  entrar: (email: string, senha: string) =>
    requisitar<Sessao>('/api/v1/auth/login', { metodo: 'POST', corpo: { email, senha } }),
  cadastrar: (dados: DadosCadastro) =>
    requisitar<Sessao>('/api/v1/auth/cadastro', { metodo: 'POST', corpo: dados }),
};

export const pontosApi = {
  listar: (busca: string, pagina = 0) =>
    requisitar<Pagina<Ponto>>('/api/v1/pontos', { parametros: { busca: busca.trim(), pagina, tamanho: 20 } }),
  buscar: (id: string) => requisitar<Ponto>(`/api/v1/pontos/${id}`),
  meus: () => requisitar<Ponto[]>('/api/v1/pontos/meus'),
  criar: (dados: DadosPonto) => requisitar<Ponto>('/api/v1/pontos', { metodo: 'POST', corpo: dados }),
  doacoes: (pontoId: string) => requisitar<Pagina<Doacao>>(`/api/v1/pontos/${pontoId}/doacoes`),
};

export const doacoesApi = {
  registrar: (doacao: NovaDoacao) =>
    requisitar<Doacao>('/api/v1/doacoes', { metodo: 'POST', corpo: doacao }),
  minhas: () => requisitar<Pagina<Doacao>>('/api/v1/doacoes/minhas'),
  cancelar: (id: string) => requisitar<Doacao>(`/api/v1/doacoes/${id}/cancelar`, { metodo: 'POST' }),
  confirmarRecebimento: (id: string) =>
    requisitar<Doacao>(`/api/v1/doacoes/${id}/confirmar-recebimento`, { metodo: 'POST' }),
};

export const chaves = {
  pontos: (busca: string) => ['pontos', busca] as const,
  ponto: (id: string) => ['ponto', id] as const,
  meusPontos: ['meus-pontos'] as const,
  doacoesDoPonto: (pontoId: string) => ['doacoes-do-ponto', pontoId] as const,
  minhasDoacoes: ['minhas-doacoes'] as const,
};
