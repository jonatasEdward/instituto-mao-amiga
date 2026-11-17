import * as SecureStore from 'expo-secure-store';
import { carregarSessao } from '../armazenamentoSessao';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const sessao = (expiraEm: string) =>
  JSON.stringify({
    token: 'abc',
    expiraEm,
    usuario: { id: '1', nome: 'Ana', email: 'ana@exemplo.com', papel: 'DOADOR' },
  });

describe('carregarSessao', () => {
  const agora = new Date('2026-03-01T12:00:00Z');

  beforeEach(() => jest.clearAllMocks());

  it('devolve a sessão salva enquanto o token não expirou', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(sessao('2026-03-01T18:00:00Z'));

    const carregada = await carregarSessao(agora);

    expect(carregada?.usuario.nome).toBe('Ana');
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('descarta a sessão com token expirado', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(sessao('2026-03-01T11:59:00Z'));

    expect(await carregarSessao(agora)).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
  });

  it('descarta conteúdo corrompido em vez de quebrar o app', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('{nao-e-json');

    expect(await carregarSessao(agora)).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
  });
});
