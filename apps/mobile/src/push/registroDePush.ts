import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { avisosApi } from '../api/endpoints';
import { AVISOS_HABILITADOS } from '../config';

let tokenRegistrado: string | null = null;

export type ResultadoDoRegistro =
  | { registrado: true; token: string }
  | { registrado: false; motivo: 'desabilitado' | 'web' | 'emulador' | 'sem-permissao' | 'sem-projeto-eas' };

/**
 * Pede permissão e registra o aparelho no notification-service. Cada motivo de "não registrou" é
 * esperado (navegador, emulador, usuário negou) e o app segue funcionando com os avisos na aba.
 */
export async function registrarAparelhoParaPush(): Promise<ResultadoDoRegistro> {
  if (!AVISOS_HABILITADOS) return { registrado: false, motivo: 'desabilitado' };
  if (Platform.OS === 'web') return { registrado: false, motivo: 'web' };
  if (!Device.isDevice) return { registrado: false, motivo: 'emulador' };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('avisos', {
      name: 'Avisos das doações',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const atual = await Notifications.getPermissionsAsync();
  const permissao = atual.granted ? atual : await Notifications.requestPermissionsAsync();
  if (!permissao.granted) return { registrado: false, motivo: 'sem-permissao' };

  // O token de push da Expo é emitido por projeto do EAS; sem o id do projeto não há como obtê-lo.
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return { registrado: false, motivo: 'sem-projeto-eas' };

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await avisosApi.registrarDispositivo(token, Platform.OS === 'ios' ? 'IOS' : 'ANDROID');
  tokenRegistrado = token;
  return { registrado: true, token };
}

/** Chamado no logout: este aparelho deixa de receber avisos de quem saiu. */
export async function esquecerAparelho(): Promise<void> {
  if (!tokenRegistrado) return;
  const token = tokenRegistrado;
  tokenRegistrado = null;
  await avisosApi.removerDispositivo(token);
}
