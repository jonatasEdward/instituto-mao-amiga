import { StyleSheet, Text, View } from 'react-native';
import type { Doacao } from '../api/tipos';
import { cores, espaco } from '../tema';
import { formatarData } from '../util/datas';
import { Botao } from './Botao';
import { SeloStatus } from './SeloStatus';

type Props = {
  doacao: Doacao;
  mostrarPonto?: boolean;
  acao?: { titulo: string; onPress: () => void; carregando?: boolean; variante?: 'primario' | 'perigo' };
};

export function CartaoDoacao({ doacao, mostrarPonto = true, acao }: Props) {
  return (
    <View style={estilos.cartao}>
      <View style={estilos.linha}>
        <Text style={estilos.item}>
          {doacao.quantidade} × {doacao.tipoItem}
        </Text>
        <SeloStatus status={doacao.status} />
      </View>
      {mostrarPonto && doacao.pontoNome ? <Text style={estilos.detalhe}>{doacao.pontoNome}</Text> : null}
      {doacao.observacao ? <Text style={estilos.detalhe}>“{doacao.observacao}”</Text> : null}
      <Text style={estilos.data}>Registrada em {formatarData(doacao.criadaEm)}</Text>
      {acao && doacao.status === 'REGISTRADA' ? (
        <View style={estilos.acao}>
          <Botao titulo={acao.titulo} onPress={acao.onPress} carregando={acao.carregando} variante={acao.variante} />
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.fundo,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 12,
    padding: espaco.md,
    marginHorizontal: espaco.md,
    marginBottom: espaco.sm,
    gap: espaco.xs,
  },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: espaco.sm },
  item: { fontSize: 16, fontWeight: '600', color: cores.texto, flexShrink: 1 },
  detalhe: { color: cores.texto },
  data: { color: cores.textoSuave, fontSize: 12 },
  acao: { marginTop: espaco.sm },
});
