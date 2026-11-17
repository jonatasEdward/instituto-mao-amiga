import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { chaves, pontosApi } from '../api/endpoints';
import type { Ponto } from '../api/tipos';
import { Campo } from '../componentes/Campo';
import { Carregando, ListaVazia, MensagemDeErro } from '../componentes/Estados';
import { useValorAtrasado } from '../hooks/useValorAtrasado';
import type { PontosParams } from '../navegacao/tipos';
import { ALVO_MINIMO_DE_TOQUE, cores, espaco } from '../tema';

type Props = NativeStackScreenProps<PontosParams, 'ListaPontos'>;

export function ListaPontosTela({ navigation }: Props) {
  const [busca, setBusca] = useState('');
  const buscaAtrasada = useValorAtrasado(busca);

  const consulta = useInfiniteQuery({
    queryKey: chaves.pontos(buscaAtrasada),
    queryFn: ({ pageParam }) => pontosApi.listar(buscaAtrasada, pageParam),
    initialPageParam: 0,
    getNextPageParam: (ultima) => (ultima.pagina + 1 < ultima.totalPaginas ? ultima.pagina + 1 : undefined),
  });

  const pontos = consulta.data?.pages.flatMap((pagina) => pagina.conteudo) ?? [];

  return (
    <View style={estilos.tela}>
      <View style={estilos.busca}>
        <Campo
          rotulo="Buscar por nome ou bairro"
          value={busca}
          onChangeText={setBusca}
          placeholder="Ex.: Campinas"
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {consulta.isPending ? (
        <Carregando />
      ) : consulta.isError ? (
        <MensagemDeErro erro={consulta.error} onTentarDeNovo={() => consulta.refetch()} />
      ) : (
        <FlatList
          data={pontos}
          keyExtractor={(ponto) => ponto.id}
          renderItem={({ item }) => (
            <ItemPonto ponto={item} onPress={() => navigation.navigate('DetalhePonto', { pontoId: item.id, nome: item.nome })} />
          )}
          onEndReached={() => consulta.hasNextPage && !consulta.isFetchingNextPage && consulta.fetchNextPage()}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={consulta.isRefetching && !consulta.isFetchingNextPage} onRefresh={() => consulta.refetch()} />
          }
          ListEmptyComponent={
            <ListaVazia titulo="Nenhum ponto encontrado" texto={busca ? 'Tente buscar por outro bairro.' : undefined} />
          }
          contentContainerStyle={pontos.length === 0 ? estilos.listaVazia : undefined}
        />
      )}
    </View>
  );
}

function ItemPonto({ ponto, onPress }: { ponto: Ponto; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Abre os detalhes do ponto"
      onPress={onPress}
      style={({ pressed }) => [estilos.item, pressed && estilos.itemPressionado]}
    >
      <Text style={estilos.nome} numberOfLines={2}>
        {ponto.nome}
      </Text>
      <Text style={estilos.bairro}>
        {ponto.bairro} · {ponto.cidade}
      </Text>
      <Text style={estilos.horario}>{ponto.diasHorarios}</Text>
      {!ponto.aceitaDoacoes ? <Text style={estilos.aviso}>Só distribui, não recebe doações</Text> : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundoSuave },
  busca: { paddingHorizontal: espaco.md, paddingTop: espaco.md, backgroundColor: cores.fundo },
  listaVazia: { flexGrow: 1 },
  item: {
    minHeight: ALVO_MINIMO_DE_TOQUE,
    backgroundColor: cores.fundo,
    paddingVertical: espaco.md,
    paddingHorizontal: espaco.md,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    gap: 2,
  },
  itemPressionado: { backgroundColor: cores.primariaClara },
  nome: { fontWeight: '700', fontSize: 16, color: cores.texto },
  bairro: { color: cores.texto },
  horario: { color: cores.textoSuave },
  aviso: { color: cores.alerta, fontSize: 12, marginTop: 2 },
});
