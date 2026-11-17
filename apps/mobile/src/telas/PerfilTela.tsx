import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Botao } from '../componentes/Botao';
import { cores, espaco } from '../tema';

const DESCRICAO_PAPEL = {
  DOADOR: 'Doador',
  RESPONSAVEL: 'Responsável por ponto de coleta',
} as const;

export function PerfilTela() {
  const { usuario, sair } = useAuth();
  if (!usuario) {
    return null;
  }
  return (
    <View style={estilos.tela}>
      <Text style={estilos.nome}>{usuario.nome}</Text>
      <Text style={estilos.detalhe}>{usuario.email}</Text>
      <Text style={estilos.detalhe}>{DESCRICAO_PAPEL[usuario.papel]}</Text>
      <View style={estilos.sair}>
        <Botao titulo="Sair" variante="secundario" onPress={() => void sair()} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, padding: espaco.lg, backgroundColor: cores.fundo, gap: espaco.xs },
  nome: { fontSize: 22, fontWeight: '700', color: cores.texto },
  detalhe: { color: cores.textoSuave, fontSize: 16 },
  sair: { marginTop: espaco.lg },
});
