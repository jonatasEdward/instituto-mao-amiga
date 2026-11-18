import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError } from '../api/cliente';
import { chaves, doacoesApi } from '../api/endpoints';
import { Botao } from '../componentes/Botao';
import { Campo } from '../componentes/Campo';
import type { PontosParams } from '../navegacao/tipos';
import { cores, espaco } from '../tema';
import { semErroNoCampo, temErros, validarDoacao, type Erros, type FormularioDoacao } from '../validacao/formularios';

type Props = NativeStackScreenProps<PontosParams, 'NovaDoacao'>;

export function NovaDoacaoTela({ route, navigation }: Props) {
  const { pontoId, pontoNome } = route.params;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormularioDoacao>({ tipoItem: '', quantidade: '', observacao: '' });
  const [erros, setErros] = useState<Erros<FormularioDoacao>>({});

  const registro = useMutation({
    mutationFn: doacoesApi.registrar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chaves.minhasDoacoes });
      navigation.popToTop();
      navigation.getParent()?.navigate('MinhasDoacoes');
    },
  });

  const alterar = (campo: keyof FormularioDoacao) => (valor: string) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atuais) => semErroNoCampo(atuais, campo));
  };

  function enviar() {
    const encontrados = validarDoacao(form);
    setErros(encontrados);
    if (temErros(encontrados)) {
      return;
    }
    registro.mutate({
      pontoId,
      tipoItem: form.tipoItem.trim(),
      quantidade: Number(form.quantidade),
      observacao: form.observacao.trim() || undefined,
    });
  }

  return (
    <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
      <Text style={estilos.destino}>Doação para {pontoNome}</Text>
      <Campo rotulo="O que você vai doar" value={form.tipoItem} onChangeText={alterar('tipoItem')} erro={erros.tipoItem} placeholder="Ex.: Arroz 5kg" />
      <Campo rotulo="Quantidade" value={form.quantidade} onChangeText={alterar('quantidade')} erro={erros.quantidade} keyboardType="number-pad" />
      <Campo
        rotulo="Observação (opcional)"
        value={form.observacao}
        onChangeText={alterar('observacao')}
        erro={erros.observacao}
        placeholder="Ex.: entrego no sábado de manhã"
        multiline
      />
      {registro.isError ? (
        <Text style={estilos.erro}>
          {registro.error instanceof ApiError ? registro.error.mensagemParaUsuario : 'Não foi possível registrar a doação.'}
        </Text>
      ) : null}
      <Botao titulo="Registrar doação" onPress={enviar} carregando={registro.isPending} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, backgroundColor: cores.fundo, flexGrow: 1 },
  destino: { fontSize: 16, color: cores.textoSuave, marginBottom: espaco.md },
  erro: { color: cores.erro, marginBottom: espaco.md },
});
