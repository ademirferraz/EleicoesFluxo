import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import CadastroScreen from './screens/CadastroScreen';
import VotacaoScreen from './screens/VotacaoScreen';
import ResultadosScreen from './screens/ResultadosScreen';
import AdminScreen from './screens/AdminScreen';
import FimScreen from './screens/FimScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{
        headerStyle: { backgroundColor: '#003366' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Bem-vindo' }} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Identificação' }} />
        <Stack.Screen name="Votacao" component={VotacaoScreen} options={{ title: 'Urna Eletrônica' }} />
        <Stack.Screen name="Resultados" component={ResultadosScreen} options={{ title: 'Apuração' }} />
        <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Administrador' }} />
        <Stack.Screen name="Fim" component={FimScreen} options={{ title: 'Fim' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
