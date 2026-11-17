import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../auth/AuthContext';
import { Carregando } from '../componentes/Estados';
import { cores } from '../tema';
import { CadastroTela } from '../telas/CadastroTela';
import { DetalhePontoTela } from '../telas/DetalhePontoTela';
import { DoacoesDoPontoTela } from '../telas/DoacoesDoPontoTela';
import { EntrarTela } from '../telas/EntrarTela';
import { ListaPontosTela } from '../telas/ListaPontosTela';
import { MeusPontosTela } from '../telas/MeusPontosTela';
import { MinhasDoacoesTela } from '../telas/MinhasDoacoesTela';
import { NovaDoacaoTela } from '../telas/NovaDoacaoTela';
import { NovoPontoTela } from '../telas/NovoPontoTela';
import { PerfilTela } from '../telas/PerfilTela';
import type { AbasParams, AuthParams, MeusPontosParams, PontosParams } from './tipos';

const AuthStack = createNativeStackNavigator<AuthParams>();
const PontosStack = createNativeStackNavigator<PontosParams>();
const MeusPontosStack = createNativeStackNavigator<MeusPontosParams>();
const Abas = createBottomTabNavigator<AbasParams>();

function PontosNavegacao() {
  return (
    <PontosStack.Navigator>
      <PontosStack.Screen name="ListaPontos" component={ListaPontosTela} options={{ title: 'Pontos de coleta' }} />
      <PontosStack.Screen
        name="DetalhePonto"
        component={DetalhePontoTela}
        options={({ route }) => ({ title: route.params.nome })}
      />
      <PontosStack.Screen name="NovaDoacao" component={NovaDoacaoTela} options={{ title: 'Registrar doação' }} />
    </PontosStack.Navigator>
  );
}

function MeusPontosNavegacao() {
  return (
    <MeusPontosStack.Navigator>
      <MeusPontosStack.Screen name="MeusPontos" component={MeusPontosTela} options={{ title: 'Meus pontos' }} />
      <MeusPontosStack.Screen name="NovoPonto" component={NovoPontoTela} options={{ title: 'Novo ponto' }} />
      <MeusPontosStack.Screen
        name="DoacoesDoPonto"
        component={DoacoesDoPontoTela}
        options={({ route }) => ({ title: route.params.pontoNome })}
      />
    </MeusPontosStack.Navigator>
  );
}

function AbasLogado() {
  const { usuario } = useAuth();
  return (
    <Abas.Navigator
      screenOptions={{
        tabBarActiveTintColor: cores.primaria,
        tabBarIcon: () => null,
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Abas.Screen name="Pontos" component={PontosNavegacao} options={{ headerShown: false, title: 'Pontos' }} />
      {usuario?.papel === 'DOADOR' ? (
        <Abas.Screen name="MinhasDoacoes" component={MinhasDoacoesTela} options={{ title: 'Minhas doações' }} />
      ) : (
        <Abas.Screen
          name="MeusPontosAba"
          component={MeusPontosNavegacao}
          options={{ headerShown: false, title: 'Meus pontos' }}
        />
      )}
      <Abas.Screen name="Perfil" component={PerfilTela} options={{ title: 'Perfil' }} />
    </Abas.Navigator>
  );
}

export function Navegacao() {
  const { carregando, usuario } = useAuth();

  if (carregando) {
    return <Carregando />;
  }

  return (
    <NavigationContainer>
      {usuario ? (
        <AbasLogado />
      ) : (
        <AuthStack.Navigator>
          <AuthStack.Screen name="Entrar" component={EntrarTela} options={{ headerShown: false }} />
          <AuthStack.Screen name="Cadastro" component={CadastroTela} options={{ title: 'Criar conta' }} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
