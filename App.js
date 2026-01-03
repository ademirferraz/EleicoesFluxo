import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CadastroScreen from './src/screens/CadastroScreen';
import VotacaoScreen from './src/screens/VotacaoScreen';
import ResultadosScreen from './src/screens/ResultadosScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Cadastro" screenOptions={{
        headerStyle: { backgroundColor: '#003366' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{ title: 'Identificação' }}
        />
        <Stack.Screen
          name="Votacao"
          component={VotacaoScreen}
          options={{ title: 'Urna Eletrônica', headerLeft: () => null, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Resultados"
          component={ResultadosScreen}
          options={{ title: 'Apuração' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
