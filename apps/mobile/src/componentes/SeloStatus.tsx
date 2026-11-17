import { StyleSheet, Text, View } from 'react-native';
import type { StatusDoacao } from '../api/tipos';
import { cores, espaco } from '../tema';

const APARENCIA: Record<StatusDoacao, { rotulo: string; cor: string }> = {
  REGISTRADA: { rotulo: 'Aguardando entrega', cor: cores.alerta },
  RECEBIDA: { rotulo: 'Recebida', cor: cores.sucesso },
  CANCELADA: { rotulo: 'Cancelada', cor: cores.textoSuave },
};

export function SeloStatus({ status }: { status: StatusDoacao }) {
  const { rotulo, cor } = APARENCIA[status];
  return (
    <View style={[estilos.selo, { borderColor: cor }]}>
      <Text style={[estilos.texto, { color: cor }]}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  selo: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: espaco.sm,
    paddingVertical: 2,
  },
  texto: { fontSize: 12, fontWeight: '600' },
});
