import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { avisosApi, chaves } from '../api/endpoints';
import type { Aviso, PaginaDeAvisos } from '../api/tipos';
import { Botao } from '../componentes/Botao';
import { Carregando, ListaVazia, MensagemDeErro } from '../componentes/Estados';
import { ALVO_MINIMO_DE_TOQUE, cores, espaco } from '../tema';
import { formatarData } from '../util/datas';

export function AvisosTela() {
  const queryClient = useQueryClient();
  const consulta = useQuery({ queryKey: chaves.avisos, queryFn: () => avisosApi.listar() });

  // Atualiza a tela na hora e só depois confirma com o servidor: tocar num aviso não deve parecer lento.
  const marcarUm = useMutation({
    mutationFn: avisosApi.marcarComoLido,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: chaves.avisos });
      const anterior = queryClient.getQueryData<PaginaDeAvisos>(chaves.avisos);
      queryClient.setQueryData<PaginaDeAvisos>(chaves.avisos, (pagina) =>
        pagina && { ...pagina, content: pagina.content.map((a) => (a.id === id ? { ...a, read: true } : a)) },
      );
      return { anterior };
    },
    onError: (_erro, _id, contexto) => queryClient.setQueryData(chaves.avisos, contexto?.anterior),
    onSettled: () => queryClient.invalidateQueries({ queryKey: chaves.avisos }),
  });

  const marcarTodos = useMutation({
    mutationFn: avisosApi.marcarTodosComoLidos,
    onSettled: () => queryClient.invalidateQueries({ queryKey: chaves.avisos }),
  });

  if (consulta.isPending) {
    return <Carregando />;
  }
  if (consulta.isError) {
    return <MensagemDeErro erro={consulta.error} onTentarDeNovo={() => consulta.refetch()} />;
  }

  const avisos = consulta.data.content;
  const temNaoLidos = avisos.some((aviso) => !aviso.read);

  return (
    <FlatList
      style={estilos.tela}
      data={avisos}
      keyExtractor={(aviso) => aviso.id}
      renderItem={({ item }) => (
        <ItemAviso aviso={item} onPress={() => !item.read && marcarUm.mutate(item.id)} />
      )}
      ListHeaderComponent={
        temNaoLidos ? (
          <View style={estilos.cabecalho}>
            <Botao
              titulo="Marcar todos como lidos"
              variante="secundario"
              carregando={marcarTodos.isPending}
              onPress={() => marcarTodos.mutate()}
            />
          </View>
        ) : null
      }
      refreshControl={<RefreshControl refreshing={consulta.isRefetching} onRefresh={() => consulta.refetch()} />}
      ListEmptyComponent={
        <ListaVazia titulo="Nenhum aviso por enquanto" texto="Quando algo acontecer com suas doações, aparece aqui." />
      }
      contentContainerStyle={avisos.length === 0 ? estilos.vazia : undefined}
    />
  );
}

function ItemAviso({ aviso, onPress }: { aviso: Aviso; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !aviso.read }}
      accessibilityLabel={`${aviso.read ? '' : 'Não lido. '}${aviso.title}. ${aviso.body}`}
      onPress={onPress}
      style={({ pressed }) => [estilos.item, !aviso.read && estilos.naoLido, pressed && estilos.pressionado]}
    >
      {!aviso.read ? <View style={estilos.marcador} testID="marcador-nao-lido" /> : null}
      <View style={estilos.texto}>
        <Text style={[estilos.titulo, !aviso.read && estilos.tituloNaoLido]}>{aviso.title}</Text>
        <Text style={estilos.corpo}>{aviso.body}</Text>
        <Text style={estilos.data}>{formatarData(aviso.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: { backgroundColor: cores.fundoSuave },
  vazia: { flexGrow: 1 },
  cabecalho: { padding: espaco.md, backgroundColor: cores.fundo },
  item: {
    flexDirection: 'row',
    gap: espaco.sm,
    minHeight: ALVO_MINIMO_DE_TOQUE,
    padding: espaco.md,
    backgroundColor: cores.fundo,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  naoLido: { backgroundColor: cores.primariaClara },
  pressionado: { opacity: 0.7 },
  marcador: { width: 10, height: 10, borderRadius: 5, backgroundColor: cores.primaria, marginTop: 6 },
  texto: { flex: 1, gap: 2 },
  titulo: { fontSize: 16, color: cores.texto },
  tituloNaoLido: { fontWeight: '700' },
  corpo: { color: cores.texto },
  data: { color: cores.textoSuave, fontSize: 12 },
});
