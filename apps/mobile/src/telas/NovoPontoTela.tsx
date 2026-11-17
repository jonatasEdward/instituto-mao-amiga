import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError } from '../api/cliente';
import { chaves, pontosApi } from '../api/endpoints';
import { Botao } from '../componentes/Botao';
import { Campo } from '../componentes/Campo';
import type { MeusPontosParams } from '../navegacao/tipos';
import { cores, espaco } from '../tema';
import { temErros, validarPonto, type Erros, type FormularioPonto } from '../validacao/formularios';

type Props = NativeStackScreenProps<MeusPontosParams, 'NovoPonto'>;

const VAZIO: FormularioPonto = {
  nome: '',
  endereco: '',
  bairro: '',
  cidade: 'Goiânia',
  diasHorarios: '',
  recebe: '',
  distribui: '',
};

export function NovoPontoTela({ navigation }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormularioPonto>(VAZIO);
  const [erros, setErros] = useState<Erros<FormularioPonto>>({});

  const cadastro = useMutation({
    mutationFn: pontosApi.criar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chaves.meusPontos });
      void queryClient.invalidateQueries({ queryKey: ['pontos'] });
      navigation.goBack();
    },
  });

  const alterar = (campo: keyof FormularioPonto) => (valor: string) => setForm((atual) => ({ ...atual, [campo]: valor }));

  function enviar() {
    const encontrados = validarPonto(form);
    setErros(encontrados);
    if (temErros(encontrados)) {
      return;
    }
    cadastro.mutate({
      nome: form.nome.trim(),
      endereco: form.endereco.trim(),
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim(),
      diasHorarios: form.diasHorarios.trim(),
      recebe: form.recebe.trim() || null,
      distribui: form.distribui.trim() || null,
    });
  }

  return (
    <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
      <Campo rotulo="Nome do ponto" value={form.nome} onChangeText={alterar('nome')} erro={erros.nome} />
      <Campo rotulo="Endereço" value={form.endereco} onChangeText={alterar('endereco')} erro={erros.endereco} />
      <Campo rotulo="Bairro" value={form.bairro} onChangeText={alterar('bairro')} erro={erros.bairro} />
      <Campo rotulo="Cidade" value={form.cidade} onChangeText={alterar('cidade')} erro={erros.cidade} />
      <Campo
        rotulo="Dias e horários"
        value={form.diasHorarios}
        onChangeText={alterar('diasHorarios')}
        erro={erros.diasHorarios}
        placeholder="Ex.: Segunda a sexta, 8h às 12h"
      />
      <Campo
        rotulo="O que recebe"
        value={form.recebe}
        onChangeText={alterar('recebe')}
        erro={erros.recebe}
        placeholder="Deixe em branco se só distribui"
        multiline
      />
      <Campo
        rotulo="O que distribui"
        value={form.distribui}
        onChangeText={alterar('distribui')}
        erro={erros.distribui}
        placeholder="Deixe em branco se só recebe"
        multiline
      />
      {cadastro.isError ? (
        <Text style={estilos.erro}>
          {cadastro.error instanceof ApiError ? cadastro.error.mensagemParaUsuario : 'Não foi possível cadastrar o ponto.'}
        </Text>
      ) : null}
      <Botao titulo="Cadastrar ponto" onPress={enviar} carregando={cadastro.isPending} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, backgroundColor: cores.fundo, flexGrow: 1 },
  erro: { color: cores.erro, marginBottom: espaco.md },
});
