import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from './src/api/cliente';
import { AuthProvider } from './src/auth/AuthContext';
import { Navegacao } from './src/navegacao/Navegacao';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (tentativas, erro) => {
        const erroDoCliente = erro instanceof ApiError && erro.status >= 400 && erro.status < 500;
        return !erroDoCliente && tentativas < 2;
      },
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="dark" />
          <Navegacao />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
