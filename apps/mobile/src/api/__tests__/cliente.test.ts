import { ApiError, configurarCliente, converterErro, requisitar } from '../cliente';

function resposta(status: number, corpo: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => corpo,
  } as Response;
}

describe('converterErro', () => {
  it('lê o formato Problem Details da API', async () => {
    const erro = await converterErro(
      resposta(400, {
        title: 'Requisição inválida',
        detail: 'um ou mais campos estão inválidos',
        erros: [{ campo: 'email', mensagem: 'deve ser um e-mail válido' }],
      }),
    );

    expect(erro.status).toBe(400);
    expect(erro.mensagemParaUsuario).toBe('email: deve ser um e-mail válido');
  });

  it('usa uma mensagem genérica quando o corpo não é JSON', async () => {
    const erro = await converterErro({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError('corpo vazio');
      },
    } as unknown as Response);

    expect(erro.mensagemParaUsuario).toBe('Algo deu errado. Tente de novo.');
  });
});

describe('requisitar', () => {
  const fetchOriginal = global.fetch;
  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  it('envia o token e encerra a sessão quando a API responde 401', async () => {
    const aoExpirarSessao = jest.fn();
    configurarCliente({ obterToken: () => 'token-123', aoExpirarSessao });
    const fetchFalso = jest.fn().mockResolvedValue(resposta(401, { title: 'Não autenticado', detail: 'token expirado' }));
    global.fetch = fetchFalso;

    await expect(requisitar('/api/v1/doacoes/minhas')).rejects.toBeInstanceOf(ApiError);

    const [, opcoes] = fetchFalso.mock.calls[0];
    expect(opcoes.headers.Authorization).toBe('Bearer token-123');
    expect(aoExpirarSessao).toHaveBeenCalledTimes(1);
  });

  it('monta a query string ignorando parâmetros vazios', async () => {
    configurarCliente({ obterToken: () => null, aoExpirarSessao: jest.fn() });
    const fetchFalso = jest.fn().mockResolvedValue(resposta(200, { conteudo: [] }));
    global.fetch = fetchFalso;

    await requisitar('/api/v1/pontos', { parametros: { busca: '', pagina: 0, tamanho: 20 } });

    expect(fetchFalso.mock.calls[0][0]).toBe('http://localhost:8080/api/v1/pontos?pagina=0&tamanho=20');
  });

  it('transforma falha de rede em erro amigável', async () => {
    configurarCliente({ obterToken: () => null, aoExpirarSessao: jest.fn() });
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));

    await expect(requisitar('/api/v1/pontos')).rejects.toMatchObject({ status: 0, titulo: 'Sem conexão' });
  });
});
