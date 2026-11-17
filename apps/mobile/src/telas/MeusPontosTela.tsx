import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { chaves, pontosApi } from '../api/endpoints';
import { Botao } from '../componentes/Botao';
import { Carregando, ListaVazia, MensagemDeErro } from '../componentes/Estados';
import type { MeusPontosParams } from '../navegacao/tipos';
import { ALVO_MINIMO_DE_TOQUE, cores, espaco } from '../tema';

type Props = NativeStackScreenProps<MeusPontosParams, 'MeusPontos'>;

export function MeusPontosTela({ navigation }: Props) {
  const consulta = useQuery({ queryKey: chaves.meusPontos, queryFn: pontosApi.meus });

  if (consulta.isPending) {
    return <Carregando />;
  }
  if (consulta.isError) {
    return <MensagemDeErro erro={consulta.error} onTentarDeNovo={() => consulta.refetch()} />;
  }

  return (
    <FlatList
      style={estilos.tela}
      data={consulta.data}
      keyExtractor={(ponto) => ponto.id}
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Mostra as doações deste ponto"
          style={({ pressed }) => [estilos.item, pressed && estilos.pressionado]}
          onPress={() => navigation.navigate('DoacoesDoPonto', { pontoId: item.id, pontoNome: item.nome })}
        >
          <Text style={estilos.nome}>{item.nome}</Text>
          <Text style={estilos.detalhe}>{item.diasHorarios}</Text>
        </Pressable>
      )}
      refreshControl={<RefreshControl refreshing={consulta.isRefetching} onRefresh={() => consulta.refetch()} />}
      ListHeaderComponent={
        <View style={estilos.cabecalho}>
          <Botao titulo="Cadastrar novo ponto" onPress={() => navigation.navigate('NovoPonto')} />
        </View>
      }
      ListEmptyComponent={
        <ListaVazia titulo="Você ainda não cuida de nenhum ponto" texto="Cadastre o seu para começar a receber doações." />
      }
      contentContainerStyle={consulta.data.length === 0 ? estilos.vazia : undefined}
    />
  );
}

const estilos = StyleSheet.create({
  tela: { backgroundColor: cores.fundoSuave },
  vazia: { flexGrow: 1 },
  cabecalho: { padding: espaco.md, backgroundColor: cores.fundo },
  item: {
    minHeight: ALVO_MINIMO_DE_TOQUE,
    backgroundColor: cores.fundo,
    padding: espaco.md,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  pressionado: { backgroundColor: cores.primariaClara },
  nome: { fontWeight: '700', fontSize: 16, color: cores.texto },
  detalhe: { color: cores.textoSuave },
});
