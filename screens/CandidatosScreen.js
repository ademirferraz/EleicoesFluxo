import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, TextInput, Alert, ScrollView, StyleSheet } from 'react-native';
import Disclaimer from '../src/components/Disclaimer';

const DEFAULT_CANDIDATES = [
  { id: '1', name: 'Candidato A' },
  { id: '2', name: 'Candidato B' },
  { id: '3', name: 'Candidato C' },
  { id: '4', name: 'Candidato D' },
  { id: '5', name: 'Candidato E' },
];

export default function CandidatosScreen({ navigation, route }) {
  const cpfHash = route?.params?.cpfHash || '';
  const [candidates, setCandidates] = useState(DEFAULT_CANDIDATES);
  const [selectedId, setSelectedId] = useState(null);

  const saveCandidates = async () => {
    Alert.alert('Debug', 'Persistência de candidatos não implementada neste fluxo');
  };

  const handleVote = async () => {
    if (!selectedId) {
      Alert.alert('Atenção', 'Selecione um candidato antes de votar.');
      return;
    }
    Alert.alert('Debug', `Voto: ${selectedId} para eleitor ${cpfHash}`);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, marginBottom: 12 }}>Editar candidatos (até 5):</Text>
        {candidates.map((c, idx) => (
          <View key={c.id} style={{ marginBottom: 8 }}>
            <TextInput
              value={c.name}
              onChangeText={(t) => {
                const next = [...candidates];
                next[idx] = { ...next[idx], name: t };
                setCandidates(next);
              }}
              placeholder={`Candidato ${idx + 1}`}
              style={{ padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 6 }}
            />
            <TouchableOpacity
              onPress={() => setSelectedId(c.id)}
              style={[styles.option, selectedId === c.id ? styles.optionSelected : null]}
            >
              <View style={styles.radioCircle}>{selectedId === c.id && <View style={styles.selectedRb} />}</View>
              <Text style={styles.optionText}>{c.name}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <Button title="Salvar candidatos" onPress={saveCandidates} />
          <Button title="VOTAR" onPress={handleVote} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Button title="Ver Resultados" onPress={() => navigation.navigate('Resultados')} />
        </View>
      </ScrollView>
      <Disclaimer />
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginTop: 6,
  },
  optionSelected: {
    backgroundColor: '#e6f0ff',
  },
  optionText: {
    fontSize: 16,
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#003366',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedRb: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#003366',
  },
});
