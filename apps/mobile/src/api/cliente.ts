import { API_URL } from '../config';

export type CampoInvalido = { campo: string; mensagem: string };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly titulo: string,
    readonly detalhe: string,
    readonly campos: CampoInvalido[] = [],
  ) {
    super(detalhe);
    this.name = 'ApiError';
  }

  get mensagemParaUsuario(): string {
    if (this.campos.length > 0) {
      return this.campos.map((c) => `${c.campo}: ${c.mensagem}`).join('\n');
    }
    return this.detalhe;
  }
}

type Configuracao = {
  obterToken: () => string | null;
  aoExpirarSessao: () => void;
};

let configuracao: Configuracao = {
  obterToken: () => null,
  aoExpirarSessao: () => {},
};

export function configurarCliente(nova: Configuracao) {
  configuracao = nova;
}

type Opcoes = {
  metodo?: 'GET' | 'POST' | 'PUT';
  corpo?: unknown;
  parametros?: Record<string, string | number | undefined>;
};

export async function requisitar<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const url = montarUrl(caminho, opcoes.parametros);
  const token = configuracao.obterToken();

  let resposta: Response;
  try {
    resposta = await fetch(url, {
      method: opcoes.metodo ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(opcoes.corpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Sem conexão', 'Não foi possível falar com o servidor. Verifique sua internet.');
  }

  if (resposta.status === 401 && token) {
    configuracao.aoExpirarSessao();
  }

  if (!resposta.ok) {
    throw await converterErro(resposta);
  }

  if (resposta.status === 204) {
    return undefined as T;
  }
  return (await resposta.json()) as T;
}

export async function converterErro(resposta: Response): Promise<ApiError> {
  try {
    const corpo = await resposta.json();
    return new ApiError(
      resposta.status,
      corpo.title ?? 'Erro',
      corpo.detail ?? 'Algo deu errado. Tente de novo.',
      Array.isArray(corpo.erros) ? corpo.erros : [],
    );
  } catch {
    return new ApiError(resposta.status, 'Erro', 'Algo deu errado. Tente de novo.');
  }
}

function montarUrl(caminho: string, parametros?: Opcoes['parametros']): string {
  const query = Object.entries(parametros ?? {})
    .filter(([, valor]) => valor !== undefined && valor !== '')
    .map(([chave, valor]) => `${encodeURIComponent(chave)}=${encodeURIComponent(String(valor))}`)
    .join('&');
  return `${API_URL}${caminho}${query ? `?${query}` : ''}`;
}
