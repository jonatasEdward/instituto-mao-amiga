const semBarraNoFim = (url: string) => url.replace(/\/$/, '');

export const API_URL = semBarraNoFim(process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080');

/**
 * Endereço do notification-service. Sem ele, o app funciona como antes e a aba de avisos não aparece,
 * o que permite publicar o app antes do serviço existir no ambiente.
 */
export const NOTIFICATIONS_URL = process.env.EXPO_PUBLIC_NOTIFICATIONS_URL
  ? semBarraNoFim(process.env.EXPO_PUBLIC_NOTIFICATIONS_URL)
  : null;

export const AVISOS_HABILITADOS = NOTIFICATIONS_URL !== null;
