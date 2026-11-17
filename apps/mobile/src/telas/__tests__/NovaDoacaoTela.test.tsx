import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '../../api/cliente';
import { doacoesApi } from '../../api/endpoints';
import { NovaDoacaoTela } from '../NovaDoacaoTela';

jest.mock('../../api/endpoints', () => ({
  ...jest.requireActual('../../api/endpoints'),
  doacoesApi: { registrar: jest.fn() },
}));

const navegarPai = jest.fn();
const navigation = {
  popToTop: jest.fn(),
  getParent: () => ({ navigate: navegarPai }),
};
const route = { key: 'NovaDoacao', name: 'NovaDoacao', params: { pontoId: 'ponto-1', pontoNome: 'Ponto Central' } };

function renderizar() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NovaDoacaoTela navigation={navigation as never} route={route as never} />
    </QueryClientProvider>,
  );
}

describe('NovaDoacaoTela', () => {
  beforeEach(() => jest.clearAllMocks());

  it('valida antes de chamar a API', () => {
    renderizar();

    fireEvent.changeText(screen.getByLabelText('O que você vai doar'), 'Arroz');
    fireEvent.changeText(screen.getByLabelText('Quantidade'), '0');
    fireEvent.press(screen.getByRole('button', { name: 'Registrar doação' }));

    expect(screen.getByText('A quantidade precisa ser um número inteiro maior que zero.')).toBeTruthy();
    expect(doacoesApi.registrar).not.toHaveBeenCalled();
  });

  it('registra a doação e leva para Minhas doações', async () => {
    jest.mocked(doacoesApi.registrar).mockResolvedValue({} as never);
    renderizar();

    fireEvent.changeText(screen.getByLabelText('O que você vai doar'), '  Feijão 1kg ');
    fireEvent.changeText(screen.getByLabelText('Quantidade'), '4');
    fireEvent.press(screen.getByRole('button', { name: 'Registrar doação' }));

    await waitFor(() => expect(navegarPai).toHaveBeenCalledWith('MinhasDoacoes'));
    expect(jest.mocked(doacoesApi.registrar).mock.calls[0][0]).toEqual({
      pontoId: 'ponto-1',
      tipoItem: 'Feijão 1kg',
      quantidade: 4,
      observacao: undefined,
    });
  });

  it('mostra a mensagem de erro da API', async () => {
    jest
      .mocked(doacoesApi.registrar)
      .mockRejectedValue(new ApiError(422, 'Regra de negócio violada', 'este ponto não recebe doações'));
    renderizar();

    fireEvent.changeText(screen.getByLabelText('O que você vai doar'), 'Arroz');
    fireEvent.changeText(screen.getByLabelText('Quantidade'), '2');
    fireEvent.press(screen.getByRole('button', { name: 'Registrar doação' }));

    expect(await screen.findByText('este ponto não recebe doações')).toBeTruthy();
    expect(navegarPai).not.toHaveBeenCalled();
  });
});
