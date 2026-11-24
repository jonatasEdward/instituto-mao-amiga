import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../tema';

type Props = {
  texto: string;
  contador: number;
  focado: boolean;
};

/**
 * Rótulo de aba com o número de não lidos ao lado. As abas do app não usam ícones, e o badge padrão do
 * React Navigation é desenhado dentro do ícone; por isso o contador fica junto do texto.
 */
export function RotuloComContador({ texto, contador, focado }: Props) {
  return (
    <View style={estilos.linha}>
      <Text style={[estilos.texto, { color: focado ? cores.primaria : cores.textoSuave }]}>{texto}</Text>
      {contador > 0 ? (
        <View style={estilos.contador} testID="contador-nao-lidos">
          <Text style={estilos.numero}>{contador > 99 ? '99+' : contador}</Text>
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  texto: { fontSize: 14, fontWeight: '600' },
  contador: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: cores.erro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: { color: cores.fundo, fontSize: 12, fontWeight: '700' },
});
