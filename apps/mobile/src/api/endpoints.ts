import { NOTIFICATIONS_URL } from '../config';
import { requisitar } from './cliente';
import type { DadosCadastro, DadosPonto, Doacao, NovaDoacao, Pagina, PaginaDeAvisos, Ponto, Sessao } from './tipos';

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

const avisos = { base: NOTIFICATIONS_URL ?? undefined };

export const avisosApi = {
  listar: (pagina = 0) =>
    requisitar<PaginaDeAvisos>('/api/v1/notifications', { ...avisos, parametros: { page: pagina, size: 30 } }),
  naoLidos: () => requisitar<{ count: number }>('/api/v1/notifications/unread-count', avisos),
  marcarComoLido: (id: string) =>
    requisitar<void>(`/api/v1/notifications/${id}/read`, { ...avisos, metodo: 'POST' }),
  marcarTodosComoLidos: () =>
    requisitar<{ updated: number }>('/api/v1/notifications/read-all', { ...avisos, metodo: 'POST' }),
  registrarDispositivo: (pushToken: string, platform: 'IOS' | 'ANDROID') =>
    requisitar<void>('/api/v1/devices', { ...avisos, metodo: 'PUT', corpo: { pushToken, platform } }),
  removerDispositivo: (pushToken: string) =>
    requisitar<void>('/api/v1/devices', { ...avisos, metodo: 'DELETE', corpo: { pushToken } }),
};

export const chaves = {
  avisos: ['avisos'] as const,
  avisosNaoLidos: ['avisos', 'nao-lidos'] as const,
  pontos: (busca: string) => ['pontos', busca] as const,
  ponto: (id: string) => ['ponto', id] as const,
  meusPontos: ['meus-pontos'] as const,
  doacoesDoPonto: (pontoId: string) => ['doacoes-do-ponto', pontoId] as const,
  minhasDoacoes: ['minhas-doacoes'] as const,
};
