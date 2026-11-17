import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../api/cliente';
import { cores, espaco } from '../tema';
import { Botao } from './Botao';

export function Carregando() {
  return (
    <View style={estilos.centro}>
      <ActivityIndicator size="large" color={cores.primaria} accessibilityLabel="Carregando" />
    </View>
  );
}

export function MensagemDeErro({ erro, onTentarDeNovo }: { erro: unknown; onTentarDeNovo?: () => void }) {
  const mensagem = erro instanceof ApiError ? erro.mensagemParaUsuario : 'Algo deu errado. Tente de novo.';
  return (
    <View style={estilos.centro}>
      <Text style={estilos.titulo}>Não foi possível carregar</Text>
      <Text style={estilos.texto}>{mensagem}</Text>
      {onTentarDeNovo ? <Botao titulo="Tentar de novo" variante="secundario" onPress={onTentarDeNovo} /> : null}
    </View>
  );
}

export function ListaVazia({ titulo, texto }: { titulo: string; texto?: string }) {
  return (
    <View style={estilos.centro}>
      <Text style={estilos.titulo}>{titulo}</Text>
      {texto ? <Text style={estilos.texto}>{texto}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espaco.lg, gap: espaco.sm },
  titulo: { fontSize: 18, fontWeight: '600', color: cores.texto, textAlign: 'center' },
  texto: { color: cores.textoSuave, textAlign: 'center', marginBottom: espaco.sm },
});
