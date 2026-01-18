import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, TextInput, Image } from 'react-native';
import { BASE_URL } from '../src/config';
import { useFocusEffect } from '@react-navigation/native';
import Disclaimer from '../src/components/Disclaimer';
// mover enviarVoto para dentro do arquivo
const API_URL = BASE_URL;
const candidateImages = {
  10: require('../assets/11.png'),
  30: require('../assets/10.png'),
  50: require('../assets/12.png'),
  40: require('../assets/14.png'),
  20: require('../assets/13.png'),
  60: require('../assets/15.png'),
};
const getCandidateImage = (num) => candidateImages[num] || null;
const getCandidateImageUri = (candidate) => {
  const foto = String(candidate?.foto || '').trim();
  if (foto) {
    if (/^https?:\/\//i.test(foto)) return foto;
    if (foto.startsWith('assets/')) return `${BASE_URL}/` + foto;
  }
  const num = candidate?.numero ?? candidate?.id;
  return num ? `${BASE_URL}/assets/${num}.png` : null;
};
const enviarVoto = async (cpf, candidatoId) => {
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
      const data = await resp.json();
      console.log(data);
      const lista = Array.isArray(data) ? data : (data?.candidatos || []);
      if (!Array.isArray(lista)) {
        console.error('Formato inesperado de candidatos:', data);
        Alert.alert('Erro', 'Formato inesperado dos candidatos');
        setCandidates([]);
        return;
      }
      let listaFinal = lista;
      const alvo = listaFinal.find(c => /josinalvo|josivaldo/i.test(String(c.nome)));
      if (alvo && String(alvo.nome) !== 'Washington Azevedo') {
        try {
          await fetch(`${API_URL}/atualizar_candidato`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: alvo.id, nome: 'Washington Azevedo' })
          });
          listaFinal = listaFinal.map(c => c.id === alvo.id ? { ...c, nome: 'Washington Azevedo' } : c);
        } catch (e) { }
      }
      setCandidates(listaFinal);
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
          <Text style={{ textAlign: 'center', color: '#666', marginVertical: 8 }}>Nenhum candidato cadastrado</Text>
        ) : candidates.map((candidate) => (
          <TouchableOpacity
            key={String(candidate.id ?? candidate.numero)}
            style={[styles.option, (selectedCandidate?.numero ?? selectedCandidate?.id) === (candidate.numero ?? candidate.id) && styles.optionSelected]}
            onPress={() => setSelectedCandidate(candidate)}
          >
            <View style={styles.radioCircle}>
              {(selectedCandidate?.numero ?? selectedCandidate?.id) === (candidate.numero ?? candidate.id) && <View style={styles.selectedRb} />}
            </View>
            {getCandidateImage(candidate.numero) ? (
              <Image source={getCandidateImage(candidate.numero)} style={styles.avatarImg} resizeMode="cover" />
            ) : getCandidateImageUri(candidate) ? (
              <Image source={{ uri: getCandidateImageUri(candidate) }} style={styles.avatarImg} resizeMode="cover" />
            ) : (
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#003366', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Text style={{ color: '#fff' }}>👤</Text>
              </View>
            )}
            <Text style={[styles.optionText, { flex: 1 }]}>{`${candidate.nome ?? candidate.name} - ${candidate.numero ?? ''}`}</Text>
            <TouchableOpacity style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#003366', borderRadius: 6 }} onPress={() => setTypedNumber(String(candidate.numero))}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>VOTAR</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 14, marginBottom: 4, textAlign: 'center' }}>Digite o número do seu candidato e clique em corrigir</Text>
          <TextInput
            style={styles.numberInput}
            value={typedNumber}
            onChangeText={setTypedNumber}
            keyboardType="numeric"
            placeholder="Ex: 10"
            maxLength={2}
          />

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
  content: { padding: 8, justifyContent: 'flex-start', flexGrow: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 6, textAlign: 'center', color: '#003366' },
  option: { flexDirection: 'row', alignItems: 'center', padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 6 },
  optionSelected: { borderColor: '#003366', backgroundColor: '#e6f0ff' },
  optionText: { fontSize: 16, color: '#333' },
  radioCircle: { height: 16, width: 16, borderRadius: 8, borderWidth: 2, borderColor: '#003366', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  selectedRb: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#003366' },
  button: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  voteButton: { backgroundColor: '#003366' },
  resultButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#003366' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resultButtonText: { color: '#003366', fontSize: 18, fontWeight: 'bold' }
  , numberInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, fontSize: 16 }
  , previewBox: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }
  , previewAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#003366', alignItems: 'center', justifyContent: 'center' }
  , avatarImg: { width: 28, height: 28, borderRadius: 14, marginRight: 8 }
  , urnaButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }
  , urnaButton: { flex: 1, padding: 12, marginHorizontal: 6, borderRadius: 8, alignItems: 'center' }
  , corrige: { backgroundColor: '#ff8c00' }
  , confirma: { backgroundColor: '#28a745' }
  , urnaButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default VotacaoScreen;
