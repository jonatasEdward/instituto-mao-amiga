jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
}));
jest.mock('expo-device', () => ({ isDevice: true }));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { extra: { eas: { projectId: 'projeto-123' } } } } }));

type Modulos = {
  registro: typeof import('../registroDePush');
  notificacoes: typeof import('expo-notifications');
  api: typeof import('../../api/endpoints');
};

// A config é lida quando o módulo carrega, então cada cenário monta os módulos do zero.
function carregar(urlDosAvisos: string | undefined): Modulos {
  jest.resetModules();
  if (urlDosAvisos) {
    process.env.EXPO_PUBLIC_NOTIFICATIONS_URL = urlDosAvisos;
  } else {
    delete process.env.EXPO_PUBLIC_NOTIFICATIONS_URL;
  }
  const api = require('../../api/endpoints');
  api.avisosApi.registrarDispositivo = jest.fn().mockResolvedValue(undefined);
  api.avisosApi.removerDispositivo = jest.fn().mockResolvedValue(undefined);
  return { registro: require('../registroDePush'), notificacoes: require('expo-notifications'), api };
}

describe('registrarAparelhoParaPush', () => {
  afterEach(() => delete process.env.EXPO_PUBLIC_NOTIFICATIONS_URL);

  it('não faz nada quando o serviço de avisos não está configurado', async () => {
    const { registro, notificacoes } = carregar(undefined);

    expect(await registro.registrarAparelhoParaPush()).toEqual({ registrado: false, motivo: 'desabilitado' });
    expect(notificacoes.getPermissionsAsync).not.toHaveBeenCalled();
  });

  it('respeita quando o usuário nega a permissão', async () => {
    const { registro, notificacoes, api } = carregar('https://avisos.exemplo');
    jest.mocked(notificacoes.getPermissionsAsync).mockResolvedValue({ granted: false } as never);
    jest.mocked(notificacoes.requestPermissionsAsync).mockResolvedValue({ granted: false } as never);

    expect(await registro.registrarAparelhoParaPush()).toEqual({ registrado: false, motivo: 'sem-permissao' });
    expect(api.avisosApi.registrarDispositivo).not.toHaveBeenCalled();
  });

  it('registra o token e o remove no logout', async () => {
    const { registro, notificacoes, api } = carregar('https://avisos.exemplo');
    jest.mocked(notificacoes.getPermissionsAsync).mockResolvedValue({ granted: true } as never);
    jest.mocked(notificacoes.getExpoPushTokenAsync).mockResolvedValue({ data: 'ExponentPushToken[abc]' } as never);

    const resultado = await registro.registrarAparelhoParaPush();

    expect(resultado).toEqual({ registrado: true, token: 'ExponentPushToken[abc]' });
    expect(notificacoes.getExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'projeto-123' });
    expect(api.avisosApi.registrarDispositivo).toHaveBeenCalledWith('ExponentPushToken[abc]', 'IOS');

    await registro.esquecerAparelho();
    expect(api.avisosApi.removerDispositivo).toHaveBeenCalledWith('ExponentPushToken[abc]');
  });
});
