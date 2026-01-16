import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Disclaimer from '../src/components/Disclaimer';
// mover enviarVoto para dentro do arquivo
const API_URL = 'http://127.0.0.1:5000';
const enviarVoto = async (cpf, candidatoId) => {
  const host = getBackendHost();
  try {
    const resp = await fetch(`${API_URL}/votar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, candidato_id: candidatoId }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      const msg = data && data.message ? data.message : 'Erro desconhecido';
      Alert.alert('Erro', msg);
      return { ok: false, message: msg };
    }
    Alert.alert('Sucesso', data.message || 'Voto registrado');
    return { ok: true, message: data.message };
  } catch (err) {
    Alert.alert('Erro', 'Falha de conexão com o servidor.');
    return { ok: false, message: err.message };
  }
};


const VotacaoScreen = ({ route, navigation }) => {
  const { cpf } = route.params;
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typedNumber, setTypedNumber] = useState('');
  const [previewCandidate, setPreviewCandidate] = useState(null);

  const carregarCandidatos = async () => {
    try {
      const resp = await fetch(`${API_URL}/candidatos`);
      if (!resp.ok) {
        const text = await resp.text();
        console.error('Falha ao buscar candidatos:', resp.status, text);
        Alert.alert('Erro', 'Conexão recusada ou resposta inválida ao buscar candidatos');
        setCandidates([]);
        return;
      }
      const dados = await resp.json();
      console.log('Dados recebidos:', dados);
      const lista = Array.isArray(dados) ? dados : (dados?.candidatos || []);
      if (!Array.isArray(lista)) {
        console.error('Formato inesperado de candidatos:', dados);
        Alert.alert('Erro', 'Formato inesperado dos candidatos');
        setCandidates([]);
        return;
      }
      setCandidates(lista.slice(0,5));
    } catch (e) {
      console.error('Erro de conexão ao buscar candidatos:', e);
      Alert.alert('Erro', 'Conexão recusada ao buscar candidatos');
      setCandidates([]);
    }
  };

  useEffect(() => { carregarCandidatos(); }, []);
  useFocusEffect(React.useCallback(() => { carregarCandidatos(); }, []));

  useEffect(() => {
    const n = typedNumber.replace(/\D/g, '');
    const found = candidates.find(c => String(c.numero ?? c.id) === n);
    setPreviewCandidate(found || null);
  }, [typedNumber, candidates]);

  const handleVote = async () => {
    if (!selectedCandidate) { Alert.alert('Atenção', 'Selecione um candidato para votar.'); return; }
    setLoading(true);
    const cid = parseInt(selectedCandidate.id ?? selectedCandidate.numero, 10);
    try {
      const res = await enviarVoto(cpf.replace(/\D/g, ''), cid);
      if (res?.ok) {
        setSelectedCandidate(null);
        setTypedNumber('');
        setPreviewCandidate(null);
        navigation.navigate('Fim');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao computar voto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Escolha seu Candidato</Text>
        {candidates.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#666', marginVertical: 20 }}>Nenhum candidato cadastrado</Text>
        ) : candidates.map((candidate) => (
          <TouchableOpacity
            key={String(candidate.id ?? candidate.numero)}
            style={[styles.option, (selectedCandidate?.numero ?? selectedCandidate?.id) === (candidate.numero ?? candidate.id) && styles.optionSelected]}
            onPress={() => setSelectedCandidate(candidate)}
          >
            <View style={styles.radioCircle}>
              {(selectedCandidate?.numero ?? selectedCandidate?.id) === (candidate.numero ?? candidate.id) && <View style={styles.selectedRb} />}
            </View>
            <Text style={styles.optionText}>{candidate.nome ?? candidate.name}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 6 }}>Digite o número do candidato</Text>
          <TextInput
            style={styles.numberInput}
            value={typedNumber}
            onChangeText={setTypedNumber}
            keyboardType="numeric"
            placeholder="Ex: 10"
            maxLength={2}
          />
          {previewCandidate && (
            <View style={styles.previewBox}>
              <View style={styles.previewAvatar}><Text style={{ color: '#fff', fontWeight: 'bold' }}>👤</Text></View>
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{previewCandidate.nome}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>Número: {previewCandidate.numero}</Text>
              </View>
            </View>
          )}
          <View style={styles.urnaButtons}>
            <TouchableOpacity style={[styles.urnaButton, styles.corrige]} onPress={() => { setTypedNumber(''); setSelectedCandidate(null); setPreviewCandidate(null); }}>
              <Text style={styles.urnaButtonText}>CORRIGE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.urnaButton, styles.confirma]} onPress={() => {
              if (previewCandidate) { setSelectedCandidate(previewCandidate); handleVote(); }
              else if (selectedCandidate) { handleVote(); }
              else { Alert.alert('Atenção', 'Selecione ou digite um candidato válido.'); }
            }}>
              <Text style={styles.urnaButtonText}>CONFIRMA</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={[styles.button, styles.resultButton]} onPress={() => navigation.navigate('Resultados')}>
          <Text style={styles.resultButtonText}>Ver Resultados</Text>
        </TouchableOpacity>
      </ScrollView>
      <Disclaimer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, justifyContent: 'center', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#003366' },
  option: { flexDirection: 'row', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10 },
  optionSelected: { borderColor: '#003366', backgroundColor: '#e6f0ff' },
  optionText: { fontSize: 18, color: '#333' },
  radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#003366', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  selectedRb: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#003366' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  voteButton: { backgroundColor: '#003366' },
  resultButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#003366' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resultButtonText: { color: '#003366', fontSize: 18, fontWeight: 'bold' }
  ,numberInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16 }
  ,previewBox: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }
  ,previewAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#003366', alignItems: 'center', justifyContent: 'center' }
  ,urnaButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }
  ,urnaButton: { flex: 1, padding: 14, marginHorizontal: 6, borderRadius: 8, alignItems: 'center' }
  ,corrige: { backgroundColor: '#dc3545' }
  ,confirma: { backgroundColor: '#28a745' }
  ,urnaButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default VotacaoScreen;
