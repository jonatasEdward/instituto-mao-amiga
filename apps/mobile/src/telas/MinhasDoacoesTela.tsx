import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/cliente';
import { chaves, doacoesApi } from '../api/endpoints';
import { CartaoDoacao } from '../componentes/CartaoDoacao';
import { Carregando, ListaVazia, MensagemDeErro } from '../componentes/Estados';
import { cores, espaco } from '../tema';
import { confirmar } from '../util/confirmar';

export function MinhasDoacoesTela() {
  const queryClient = useQueryClient();
  const consulta = useQuery({ queryKey: chaves.minhasDoacoes, queryFn: doacoesApi.minhas });

  const cancelamento = useMutation({
    mutationFn: doacoesApi.cancelar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaves.minhasDoacoes }),
  });

  async function cancelar(id: string) {
    if (await confirmar('Cancelar doação', 'O ponto deixa de esperar por esta doação.', 'Cancelar doação')) {
      cancelamento.mutate(id);
    }
  }

  if (consulta.isPending) {
    return <Carregando />;
  }
  if (consulta.isError) {
    return <MensagemDeErro erro={consulta.error} onTentarDeNovo={() => consulta.refetch()} />;
  }

  return (
    <View style={estilos.tela}>
      {cancelamento.isError ? (
        <Text style={estilos.erro}>
          {cancelamento.error instanceof ApiError ? cancelamento.error.mensagemParaUsuario : 'Não foi possível cancelar.'}
        </Text>
      ) : null}
      <FlatList
        data={consulta.data.conteudo}
        keyExtractor={(doacao) => doacao.id}
        renderItem={({ item }) => (
          <CartaoDoacao
            doacao={item}
            acao={{
              titulo: 'Cancelar',
              variante: 'perigo',
              onPress: () => cancelar(item.id),
              carregando: cancelamento.isPending && cancelamento.variables === item.id,
            }}
          />
        )}
        refreshControl={<RefreshControl refreshing={consulta.isRefetching} onRefresh={() => consulta.refetch()} />}
        ListEmptyComponent={
          <ListaVazia titulo="Você ainda não registrou doações" texto="Escolha um ponto na aba Pontos para começar." />
        }
        contentContainerStyle={consulta.data.conteudo.length === 0 ? estilos.vazia : estilos.lista}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundoSuave },
  lista: { paddingVertical: espaco.md },
  vazia: { flexGrow: 1 },
  erro: { color: cores.erro, padding: espaco.md },
});
