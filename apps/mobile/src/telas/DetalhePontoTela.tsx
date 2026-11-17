import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { chaves, pontosApi } from '../api/endpoints';
import { useAuth } from '../auth/AuthContext';
import { Botao } from '../componentes/Botao';
import { Carregando, MensagemDeErro } from '../componentes/Estados';
import type { PontosParams } from '../navegacao/tipos';
import { cores, espaco } from '../tema';

type Props = NativeStackScreenProps<PontosParams, 'DetalhePonto'>;

export function DetalhePontoTela({ route, navigation }: Props) {
  const { pontoId } = route.params;
  const { usuario } = useAuth();
  const consulta = useQuery({ queryKey: chaves.ponto(pontoId), queryFn: () => pontosApi.buscar(pontoId) });

  if (consulta.isPending) {
    return <Carregando />;
  }
  if (consulta.isError) {
    return <MensagemDeErro erro={consulta.error} onTentarDeNovo={() => consulta.refetch()} />;
  }

  const ponto = consulta.data;
  const podeDoar = usuario?.papel === 'DOADOR' && ponto.aceitaDoacoes;

  return (
    <ScrollView contentContainerStyle={estilos.conteudo}>
      <Secao titulo="Endereço" texto={`${ponto.endereco}\n${ponto.bairro} · ${ponto.cidade}`} />
      <Secao titulo="Quando funciona" texto={ponto.diasHorarios} />
      {ponto.recebe ? <Secao titulo="Recebe" texto={ponto.recebe} /> : null}
      {ponto.distribui ? <Secao titulo="Distribui" texto={ponto.distribui} /> : null}

      {podeDoar ? (
        <Botao
          titulo="Quero doar para este ponto"
          onPress={() => navigation.navigate('NovaDoacao', { pontoId: ponto.id, pontoNome: ponto.nome })}
        />
      ) : null}
      {!ponto.aceitaDoacoes ? (
        <Text style={estilos.aviso}>Este ponto só distribui doações. Procure outro ponto para doar.</Text>
      ) : null}
    </ScrollView>
  );
}

function Secao({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <View style={estilos.secao}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, gap: espaco.md, backgroundColor: cores.fundo, flexGrow: 1 },
  secao: { gap: espaco.xs },
  titulo: { fontSize: 13, fontWeight: '700', color: cores.textoSuave, textTransform: 'uppercase' },
  texto: { fontSize: 16, color: cores.texto, lineHeight: 22 },
  aviso: { color: cores.alerta },
});
