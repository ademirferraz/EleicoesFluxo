import React from 'react';
import { View, Text, Button } from 'react-native';
import Disclaimer from '../src/components/Disclaimer';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 16, flexGrow: 1 }}>
        <Text style={{ fontSize: 18, marginBottom: 20 }}>
          Bem-vindo ao sistema de eleições
        </Text>
        <Button title="Cadastre-se" onPress={() => navigation.navigate('Cadastro')} />
        <View style={{ marginTop: 8 }}>
          <Button title="Resultado Parcial" onPress={() => navigation.navigate('Resultados')} />
        </View>
        <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
          <Button title="Admin" onPress={() => navigation.navigate('Admin')} color="#6c757d" />
        </View>
      </View>
      <Disclaimer />
    </View>
  );
}
