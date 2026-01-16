import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Image } from 'react-native';
import { BASE_URL } from '../src/config';
import Disclaimer from '../src/components/Disclaimer';

const API_URL = BASE_URL;

const AdminScreen = () => {
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [count, setCount] = useState(0);
  const [candidatos, setCandidatos] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [resumo, setResumo] = useState({ votosTotais: 0, mediaIdade: 0, cpfsUnicos: 0 });
  const [statusMsg, setStatusMsg] = useState('');

  const loadCandidatos = async () => {
    try {
      const resp = await fetch(`${API_URL}/candidatos`);
      const data = await resp.json();
      console.log(data);
      const lista = Array.isArray(data) ? data : (data?.candidatos || []);
      setCandidatos(lista);
      setCount(lista.length);
    } catch (e) {
      setCandidatos([]);
      setCount(0);
    }
  };

  const loadResumo = async () => {
    try {
      const resp = await fetch(`${API_URL}/admin_resumo`);
      const data = await resp.json();
      console.log(data);
      if (resp.ok) setResumo({
        votosTotais: data?.votosTotais ?? 0,
        mediaIdade: data?.mediaIdade ?? 0,
        cpfsUnicos: data?.cpfsUnicos ?? 0
      });
    } catch (e) {}
  };

  useEffect(() => { loadCandidatos(); loadResumo(); }, []);
  useEffect(() => { setAuthorized(adminPass === '1234'); }, [adminPass]);

  const handleCadastrar = async () => {
    if (!authorized) return;
    // removido limite de 5 candidatos para permitir cadastro ilimitado
    const n = numero.replace(/\D/g, '');
    if (!nome.trim() || !n) { Alert.alert('Erro', 'Preencha nome e número.'); return; }
    
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/cadastrar_candidato`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), numero: parseInt(n, 10) })
      });
      if (resp.ok) { setNome(''); setNumero(''); await loadCandidatos(); }
    } catch (e) {
      Alert.alert('Erro', 'Falha de conexão.');
    } finally { setLoading(false); }
  };

  const atualizarNome = async (id, nomeNovo) => {
    if (!authorized || !String(nomeNovo).trim()) return;
    try {
      setSavingId(id);
      const resp = await fetch(`${API_URL}/atualizar_candidato`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, nome: String(nomeNovo).trim() })
      });
      if (resp.ok) { Alert.alert('Sucesso', 'Candidato atualizado'); await loadCandidatos(); }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao salvar.');
    } finally { setSavingId(null); }
  };

  const handleZerarPesquisa = async () => {
    Alert.alert('Tem certeza?', 'Isso apagará todos os votos.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', style: 'destructive', onPress: async () => {
        try {
          const resp = await fetch(`${API_URL}/limpar_votos`, { method: 'POST' });
          const json = await resp.json();
          if (!resp.ok) Alert.alert('Erro', json?.message || 'Falha ao zerar votos');
          await loadCandidatos();
          setStatusMsg('Operação concluída');
          setTimeout(() => setStatusMsg(''), 3000);
        } catch (e) { Alert.alert('Erro', 'Falha de conexão'); }
      } }
    ]);
  };

  const handleResetCandidatos = async () => {
    Alert.alert('Tem certeza?', 'Isso removerá todos os candidatos.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', style: 'destructive', onPress: async () => {
        try {
          const resp = await fetch(`${API_URL}/resetar_candidatos`, { method: 'POST' });
          const json = await resp.json();
          if (!resp.ok) Alert.alert('Erro', json?.message || 'Falha ao resetar candidatos');
          await loadCandidatos();
          setStatusMsg('Operação concluída');
          setTimeout(() => setStatusMsg(''), 3000);
        } catch (e) { Alert.alert('Erro', 'Falha de conexão'); }
      } }
    ]);
  };

  return (
    <View style={[styles.container, Platform.OS === 'web' ? { maxHeight: '100vh', height: '100vh' } : {}]}>
      <View style={styles.content}>
        <Text style={styles.title}>Painel de Controle</Text>
        {Boolean(statusMsg) && (
          <Text style={styles.statusBanner}>{statusMsg}</Text>
        )}
        
        {/* Bloco de Senha Compacto */}
        <View style={styles.authSection}>
          <TextInput 
            style={[styles.input, { marginBottom: 0, flex: 1 }]} 
            value={adminPass} 
            onChangeText={setAdminPass} 
            secureTextEntry 
            placeholder="Senha Admin" 
          />
          <Text style={[styles.statusText, { color: authorized ? '#28a745' : '#dc3545' }]}>
            {authorized ? '● Liberado' : '● Bloqueado'}
          </Text>
        </View>

        

        {authorized && (
          <View style={[styles.row, { marginBottom: 6 }]}>
            <TextInput 
              style={[styles.input, { flex: 2, marginRight: 5 }]} 
              value={nome} 
              onChangeText={setNome} 
              placeholder="Nome" 
            />
            <TextInput 
              style={[styles.input, { flex: 1, marginRight: 5 }]} 
              value={numero} 
              onChangeText={setNumero} 
              keyboardType="numeric" 
              placeholder="Nº" 
            />
            <TouchableOpacity style={styles.miniButton} onPress={handleCadastrar} disabled={loading}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Candidatos Cadastrados</Text>
        {candidatos.map((c) => (
          <View key={c.id} style={[styles.listRow, { flexDirection: 'row', alignItems: 'center' }] }>
            <Image source={{ uri: `${BASE_URL}/assets/${c.numero}.png` }} style={styles.avatarImg} />
            <Text style={styles.listText}>{c.nome} - {c.numero} ({Number(c.votos_recebidos || 0)} votos)</Text>
          </View>
        ))}

        {authorized && (
          <View style={[styles.opsRow, { marginTop: 8 }] }>
            <TouchableOpacity style={styles.dangerButton} onPress={handleZerarPesquisa}>
              <Text style={styles.dangerText}>Zerar Pesquisa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orangeButton} onPress={handleResetCandidatos}>
              <Text style={styles.orangeText}>Reset de Candidatos</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Disclaimer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 8, paddingBottom: 8 },
  title: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#003366' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 6, marginBottom: 4, color: '#444' },
  authSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  statusText: { fontWeight: 'bold', fontSize: 12, width: 80 },
  statusBanner: { textAlign: 'center', fontSize: 12, color: '#28a745', marginBottom: 6 },
  opsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dangerButton: { backgroundColor: '#dc3545', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  dangerText: { color: '#fff', fontWeight: 'bold' },
  orangeButton: { backgroundColor: '#ff8c00', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  orangeText: { color: '#fff', fontWeight: 'bold' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, color: '#666' },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, fontSize: 14, backgroundColor: '#fff' },
  miniButton: { backgroundColor: '#003366', padding: 8, borderRadius: 6, width: 40, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  listRow: { paddingVertical: 2, paddingHorizontal: 0, marginBottom: 0 },
  listText: { fontSize: 14, color: '#333' }
  ,avatarImg: { width: 28, height: 28, borderRadius: 14, marginRight: 8 }
});

export default AdminScreen;
