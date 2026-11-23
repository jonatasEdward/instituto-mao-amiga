import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { avisosApi } from '../../api/endpoints';
import type { Aviso } from '../../api/tipos';
import { AvisosTela } from '../AvisosTela';

jest.mock('../../api/endpoints', () => ({
  ...jest.requireActual('../../api/endpoints'),
  avisosApi: {
    listar: jest.fn(),
    marcarComoLido: jest.fn(),
    marcarTodosComoLidos: jest.fn(),
  },
}));

const aviso = (id: string, read: boolean, title: string): Aviso => ({
  id,
  type: 'DONATION_RECEIVED',
  title,
  body: 'Ponto Central confirmou o recebimento de 6 × Feijão 1kg. Obrigado!',
  referenceId: 'doacao-1',
  createdAt: '2026-11-24T13:00:00Z',
  read,
});

function pagina(...avisos: Aviso[]) {
  return { content: avisos, page: 0, size: 30, totalElements: avisos.length, totalPages: 1 };
}

function renderizar() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AvisosTela />
    </QueryClientProvider>,
  );
}

describe('AvisosTela', () => {
  beforeEach(() => jest.clearAllMocks());

  it('destaca os avisos não lidos', async () => {
    jest.mocked(avisosApi.listar).mockResolvedValue(pagina(aviso('1', false, 'Doação recebida'), aviso('2', true, 'Antigo')));
    renderizar();

    expect(await screen.findByText('Doação recebida')).toBeTruthy();
    expect(screen.getAllByTestId('marcador-nao-lido')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Marcar todos como lidos' })).toBeTruthy();
  });

  it('marca como lido ao tocar, sem esperar o servidor para atualizar a tela', async () => {
    jest.mocked(avisosApi.listar).mockResolvedValueOnce(pagina(aviso('1', false, 'Doação recebida')));
    let responder: () => void = () => {};
    jest.mocked(avisosApi.marcarComoLido).mockImplementation(() => new Promise<void>((r) => (responder = r)));
    renderizar();

    fireEvent.press(await screen.findByText('Doação recebida'));

    await waitFor(() => expect(screen.queryByTestId('marcador-nao-lido')).toBeNull());
    expect(jest.mocked(avisosApi.marcarComoLido).mock.calls[0][0]).toBe('1');
    responder();
  });

  it('volta ao estado anterior se o servidor recusar', async () => {
    jest.mocked(avisosApi.listar).mockResolvedValue(pagina(aviso('1', false, 'Doação recebida')));
    jest.mocked(avisosApi.marcarComoLido).mockRejectedValue(new Error('falhou'));
    renderizar();

    fireEvent.press(await screen.findByText('Doação recebida'));

    await waitFor(() => expect(avisosApi.marcarComoLido).toHaveBeenCalled());
    expect(await screen.findByTestId('marcador-nao-lido')).toBeTruthy();
  });

  it('mostra uma mensagem quando ainda não há avisos', async () => {
    jest.mocked(avisosApi.listar).mockResolvedValue(pagina());
    renderizar();

    expect(await screen.findByText('Nenhum aviso por enquanto')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Marcar todos como lidos' })).toBeNull();
  });
});
