export type Papel = 'DOADOR' | 'RESPONSAVEL';

export type StatusDoacao = 'REGISTRADA' | 'RECEBIDA' | 'CANCELADA';

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
};

export type Sessao = {
  token: string;
  expiraEm: string;
  usuario: Usuario;
};

export type Ponto = {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  diasHorarios: string;
  recebe: string | null;
  distribui: string | null;
  aceitaDoacoes: boolean;
};

export type Doacao = {
  id: string;
  pontoId: string;
  pontoNome: string | null;
  tipoItem: string;
  quantidade: number;
  observacao: string | null;
  status: StatusDoacao;
  criadaEm: string;
  atualizadaEm: string;
};

export type Pagina<T> = {
  conteudo: T[];
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
};

export type NovaDoacao = {
  pontoId: string;
  tipoItem: string;
  quantidade: number;
  observacao?: string;
};

export type DadosPonto = {
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  diasHorarios: string;
  recebe: string | null;
  distribui: string | null;
};

export type DadosCadastro = {
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
};
