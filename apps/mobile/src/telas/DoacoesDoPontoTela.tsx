import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError } from '../api/cliente';
import { chaves, doacoesApi, pontosApi } from '../api/endpoints';
import { CartaoDoacao } from '../componentes/CartaoDoacao';
import { Carregando, ListaVazia, MensagemDeErro } from '../componentes/Estados';
import type { MeusPontosParams } from '../navegacao/tipos';
import { cores, espaco } from '../tema';

type Props = NativeStackScreenProps<MeusPontosParams, 'DoacoesDoPonto'>;

export function DoacoesDoPontoTela({ route }: Props) {
  const { pontoId } = route.params;
  const queryClient = useQueryClient();
  const consulta = useQuery({ queryKey: chaves.doacoesDoPonto(pontoId), queryFn: () => pontosApi.doacoes(pontoId) });

  const confirmacao = useMutation({
    mutationFn: doacoesApi.confirmarRecebimento,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaves.doacoesDoPonto(pontoId) }),
  });

  if (consulta.isPending) {
    return <Carregando />;
  }
  if (consulta.isError) {
    return <MensagemDeErro erro={consulta.error} onTentarDeNovo={() => consulta.refetch()} />;
  }

  return (
    <View style={estilos.tela}>
      {confirmacao.isError ? (
        <Text style={estilos.erro}>
          {confirmacao.error instanceof ApiError ? confirmacao.error.mensagemParaUsuario : 'Não foi possível confirmar.'}
        </Text>
      ) : null}
      <FlatList
        data={consulta.data.conteudo}
        keyExtractor={(doacao) => doacao.id}
        renderItem={({ item }) => (
          <CartaoDoacao
            doacao={item}
            mostrarPonto={false}
            acao={{
              titulo: 'Confirmar recebimento',
              onPress: () => confirmacao.mutate(item.id),
              carregando: confirmacao.isPending && confirmacao.variables === item.id,
            }}
          />
        )}
        refreshControl={<RefreshControl refreshing={consulta.isRefetching} onRefresh={() => consulta.refetch()} />}
        ListEmptyComponent={<ListaVazia titulo="Nenhuma doação registrada para este ponto" />}
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
