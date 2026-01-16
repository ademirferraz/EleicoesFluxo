import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CadastroScreen from "./screens/CadastroScreen";
import VotacaoScreen from "./screens/VotacaoScreen";
import ResultadosScreen from "./screens/ResultadosScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Votacao" component={VotacaoScreen} />
        <Stack.Screen name="Resultados" component={ResultadosScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
