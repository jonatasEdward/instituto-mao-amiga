import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { avisosApi, chaves } from '../api/endpoints';
import { AVISOS_HABILITADOS } from '../config';
import { registrarAparelhoParaPush } from './registroDePush';

const INTERVALO_DO_CONTADOR_MS = 30_000;

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Contador de não lidos para a aba (atualiza a cada 30 s), registro do aparelho para push e
 * atualização da lista quando um push chega com o app aberto.
 */
export function useAvisos(usuarioId: string | undefined) {
  const queryClient = useQueryClient();
  const ativo = AVISOS_HABILITADOS && usuarioId !== undefined;

  const naoLidos = useQuery({
    queryKey: chaves.avisosNaoLidos,
    queryFn: avisosApi.naoLidos,
    enabled: ativo,
    refetchInterval: INTERVALO_DO_CONTADOR_MS,
  });

  useEffect(() => {
    if (!ativo) return;
    registrarAparelhoParaPush().catch((erro) => console.warn('push não registrado', erro));
  }, [ativo, usuarioId]);

  useEffect(() => {
    if (!ativo || Platform.OS === 'web') return;
    const assinatura = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: chaves.avisos });
    });
    return () => assinatura.remove();
  }, [ativo, queryClient]);

  return { naoLidos: naoLidos.data?.count ?? 0 };
}
