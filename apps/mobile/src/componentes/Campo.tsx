import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { ALVO_MINIMO_DE_TOQUE, cores, espaco } from '../tema';

type Props = TextInputProps & {
  rotulo: string;
  erro?: string;
};

export function Campo({ rotulo, erro, style, ...props }: Props) {
  return (
    <View style={estilos.container}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        placeholderTextColor={cores.textoSuave}
        style={[estilos.input, erro ? estilos.inputComErro : null, style]}
        {...props}
      />
      {erro ? (
        <Text style={estilos.erro} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { marginBottom: espaco.md },
  rotulo: { fontWeight: '600', color: cores.texto, marginBottom: espaco.xs },
  input: {
    minHeight: ALVO_MINIMO_DE_TOQUE,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    paddingHorizontal: espaco.md,
    fontSize: 16,
    color: cores.texto,
  },
  inputComErro: { borderColor: cores.erro },
  erro: { color: cores.erro, marginTop: espaco.xs },
});
