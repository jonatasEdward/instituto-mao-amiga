import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError } from '../api/cliente';
import { useAuth } from '../auth/AuthContext';
import { Botao } from '../componentes/Botao';
import { Campo } from '../componentes/Campo';
import type { AuthParams } from '../navegacao/tipos';
import { cores, espaco } from '../tema';

type Props = NativeStackScreenProps<AuthParams, 'Entrar'>;

export function EntrarTela({ navigation }: Props) {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.');
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email, senha);
    } catch (e) {
      setErro(e instanceof ApiError ? e.mensagemParaUsuario : 'Não foi possível entrar. Tente de novo.');
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <Text style={estilos.marca}>Mão Amiga</Text>
          <Text style={estilos.subtitulo}>Encontre um ponto de coleta e acompanhe suas doações.</Text>

          <Campo
            rotulo="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <Campo rotulo="Senha" value={senha} onChangeText={setSenha} secureTextEntry autoComplete="password" />

          {erro ? <Text style={estilos.erro}>{erro}</Text> : null}

          <View style={estilos.acoes}>
            <Botao titulo="Entrar" onPress={enviar} carregando={enviando} />
            <Botao titulo="Criar conta" variante="secundario" onPress={() => navigation.navigate('Cadastro')} />
          </View>

          {__DEV__ ? (
            <Text style={estilos.dica}>
              Ambiente de desenvolvimento: doador@maoamiga.dev ou responsavel@maoamiga.dev, senha maoamiga123
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: espaco.lg },
  marca: { fontSize: 32, fontWeight: '700', color: cores.primaria, marginBottom: espaco.xs },
  subtitulo: { color: cores.textoSuave, fontSize: 16, marginBottom: espaco.lg },
  erro: { color: cores.erro, marginBottom: espaco.md },
  acoes: { gap: espaco.sm },
  dica: { color: cores.textoSuave, fontSize: 12, marginTop: espaco.lg, textAlign: 'center' },
});
