import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { ALVO_MINIMO_DE_TOQUE, cores, espaco } from '../tema';

type Props = {
  titulo: string;
  onPress: () => void;
  carregando?: boolean;
  desabilitado?: boolean;
  variante?: 'primario' | 'secundario' | 'perigo';
};

export function Botao({ titulo, onPress, carregando = false, desabilitado = false, variante = 'primario' }: Props) {
  const inativo = desabilitado || carregando;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inativo, busy: carregando }}
      disabled={inativo}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        estilos[variante],
        (pressed || inativo) && estilos.atenuado,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={variante === 'secundario' ? cores.primaria : cores.fundo} />
      ) : (
        <Text style={[estilos.texto, variante === 'secundario' && estilos.textoSecundario]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: ALVO_MINIMO_DE_TOQUE,
    borderRadius: 8,
    paddingHorizontal: espaco.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: { backgroundColor: cores.primaria },
  secundario: { backgroundColor: cores.fundo, borderWidth: 1, borderColor: cores.primaria },
  perigo: { backgroundColor: cores.erro },
  atenuado: { opacity: 0.6 },
  texto: { color: cores.fundo, fontWeight: '600', fontSize: 16 },
  textoSecundario: { color: cores.primaria },
});
