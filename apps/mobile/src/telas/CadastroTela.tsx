import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApiError } from '../api/cliente';
import type { Papel } from '../api/tipos';
import { useAuth } from '../auth/AuthContext';
import { Botao } from '../componentes/Botao';
import { Campo } from '../componentes/Campo';
import { cores, espaco } from '../tema';
import { temErros, validarCadastro, type Erros, type FormularioCadastro } from '../validacao/formularios';

const PAPEIS: { valor: Papel; titulo: string; descricao: string }[] = [
  { valor: 'DOADOR', titulo: 'Quero doar', descricao: 'Registro doações e acompanho a entrega.' },
  { valor: 'RESPONSAVEL', titulo: 'Cuido de um ponto', descricao: 'Recebo doações e confirmo o que chegou.' },
];

export function CadastroTela() {
  const { cadastrar } = useAuth();
  const [form, setForm] = useState<FormularioCadastro>({ nome: '', email: '', senha: '' });
  const [papel, setPapel] = useState<Papel>('DOADOR');
  const [erros, setErros] = useState<Erros<FormularioCadastro>>({});
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo: keyof FormularioCadastro) => (valor: string) => setForm((atual) => ({ ...atual, [campo]: valor }));

  async function enviar() {
    const encontrados = validarCadastro(form);
    setErros(encontrados);
    if (temErros(encontrados)) {
      return;
    }
    setErroServidor(null);
    setEnviando(true);
    try {
      await cadastrar({ ...form, nome: form.nome.trim(), email: form.email.trim(), papel });
    } catch (e) {
      setErroServidor(e instanceof ApiError ? e.mensagemParaUsuario : 'Não foi possível criar a conta.');
      setEnviando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
      <Campo rotulo="Nome" value={form.nome} onChangeText={alterar('nome')} erro={erros.nome} autoComplete="name" />
      <Campo
        rotulo="E-mail"
        value={form.email}
        onChangeText={alterar('email')}
        erro={erros.email}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <Campo
        rotulo="Senha"
        value={form.senha}
        onChangeText={alterar('senha')}
        erro={erros.senha}
        secureTextEntry
        autoComplete="new-password"
      />

      <Text style={estilos.rotulo}>Como você vai usar o app?</Text>
      <View style={estilos.papeis}>
        {PAPEIS.map((opcao) => (
          <View key={opcao.valor} style={estilos.papel}>
            <Botao
              titulo={opcao.titulo}
              variante={papel === opcao.valor ? 'primario' : 'secundario'}
              onPress={() => setPapel(opcao.valor)}
            />
            <Text style={estilos.descricao}>{opcao.descricao}</Text>
          </View>
        ))}
      </View>

      {erroServidor ? <Text style={estilos.erro}>{erroServidor}</Text> : null}
      <Botao titulo="Criar conta" onPress={enviar} carregando={enviando} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { padding: espaco.lg, backgroundColor: cores.fundo, flexGrow: 1 },
  rotulo: { fontWeight: '600', color: cores.texto, marginBottom: espaco.sm },
  papeis: { gap: espaco.md, marginBottom: espaco.lg },
  papel: { gap: espaco.xs },
  descricao: { color: cores.textoSuave, fontSize: 13 },
  erro: { color: cores.erro, marginBottom: espaco.md },
});
