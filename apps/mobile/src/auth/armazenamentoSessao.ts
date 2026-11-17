import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { Sessao } from '../api/tipos';

const CHAVE = 'mao-amiga.sessao';

// SecureStore guarda no Keychain/Keystore. No navegador ele não existe,
// então a versão web cai no localStorage.
const armazenamento = {
  async ler(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(CHAVE) ?? null;
    }
    return SecureStore.getItemAsync(CHAVE);
  },
  async gravar(valor: string): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(CHAVE, valor);
      return;
    }
    await SecureStore.setItemAsync(CHAVE, valor);
  },
  async apagar(): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(CHAVE);
      return;
    }
    await SecureStore.deleteItemAsync(CHAVE);
  },
};

export async function carregarSessao(agora = new Date()): Promise<Sessao | null> {
  const bruto = await armazenamento.ler();
  if (!bruto) {
    return null;
  }
  try {
    const sessao = JSON.parse(bruto) as Sessao;
    if (new Date(sessao.expiraEm) <= agora) {
      await armazenamento.apagar();
      return null;
    }
    return sessao;
  } catch {
    await armazenamento.apagar();
    return null;
  }
}

export const salvarSessao = (sessao: Sessao) => armazenamento.gravar(JSON.stringify(sessao));

export const apagarSessao = () => armazenamento.apagar();
