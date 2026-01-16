import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import CryptoJS from 'crypto-js';
// Removido Firebase para evitar travamentos quando não configurado
import Disclaimer from '../src/components/Disclaimer';
import { BASE_URL } from '../src/config';

const CadastroScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [cpfValue, setCpfValue] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [loading, setLoading] = useState(false);
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');

  const calcularIdade = (dataStr) => {
    const partes = dataStr.split('/');
    if (partes.length !== 3) return NaN;
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = parseInt(partes[2], 10);
    if ([dia, mes, ano].some((v) => Number.isNaN(v))) return NaN;
    const hoje = new Date();
    const nasc = new Date(ano, mes, dia);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  const validaSenha = (s) => {
    if (!s || s.length < 6) return false;
    if (!/[A-Z]/.test(s)) return false;
    if (!/[a-z]/.test(s)) return false;
    if (!/[0-9]/.test(s)) return false;
    return true;
  };

  const handleCadastro = async () => {
    if (!nome.trim()) { Alert.alert('Erro', 'Informe seu nome.'); return; }
    const idade = calcularIdade(dataNascimento);
    if (Number.isNaN(idade)) { Alert.alert('Erro', 'Data de nascimento inválida.'); return; }
    const cpfClean = cpfValue.replace(/\D/g, '');
    if (!cpfValidator.isValid(cpfClean)) { Alert.alert('Erro', 'CPF inválido.'); return; }
    if (idade < 16) { Alert.alert('Acesso Negado', 'Você não pode votar (idade mínima 16 anos no Brasil).'); return; }
    if (!validaSenha(senha)) { Alert.alert('Atenção', 'A senha deve conter, no mínimo 6 caracteres, sendo uma letra maiúscula, uma letra minúscula e um número.'); return; }
    if (senha !== confirmSenha) { Alert.alert('Atenção', 'As senhas não coincidem.'); return; }

    setLoading(true);
    try {
      const resp = await fetch(`${BASE_URL}/cadastrar_eleitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), cpf: cpfClean, data_nascimento: dataNascimento })
      });
      const json = await resp.json();
      if (!resp.ok) {
        const msg = json?.message || 'Falha no cadastro do eleitor';
        Alert.alert('Erro', msg);
        return;
      }
      navigation.navigate('Votacao', { cpf: cpfValue });
    } catch (e) {
      Alert.alert('Erro', 'Falha no fluxo de cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Cadastro Eleitor</Text>

        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>CPF</Text>
        {Platform.OS === 'web' ? (
          <TextInput
            style={styles.input}
            value={cpfValue}
            onChangeText={(t)=>{
              const s = t.replace(/\D/g, '').slice(0,11);
              const masked = s.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
              setCpfValue(masked);
            }}
            keyboardType="numeric"
            placeholder="000.000.000-00"
            maxLength={14}
          />
        ) : (
          <TextInputMask
            type={'cpf'}
            style={styles.input}
            value={cpfValue}
            onChangeText={setCpfValue}
            placeholder="000.000.000-00"
          />
        )}

        <Text style={styles.label}>Data de Nascimento</Text>
        {Platform.OS === 'web' ? (
          <TextInput
            style={styles.input}
            value={dataNascimento}
            onChangeText={(t)=>{
              const s = t.replace(/\D/g, '').slice(0,8);
              const masked = s.replace(/(\d{2})(\d{1,2})(\d{1,4})/, (m,a,b,c)=>{ if(!b) return a; if(!c) return a+'/'+b; return `${a}/${b}/${c}` });
              setDataNascimento(masked);
            }}
            keyboardType="numeric"
            placeholder="00/00/0000"
            maxLength={10}
          />
        ) : (
          <TextInputMask
            type={'datetime'}
            options={{ format: 'DD/MM/YYYY' }}
            style={styles.input}
            value={dataNascimento}
            onChangeText={setDataNascimento}
            keyboardType="numeric"
            placeholder="00/00/0000"
          />
        )}

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          placeholder="Digite sua senha"
        />
        <Text style={{ fontSize: 12, color: '#666', marginTop: -12, marginBottom: 16 }}>
          A senha deve conter, no mínimo 6 caracteres, sendo uma letra maiúscula, uma letra minúscula e um número.
        </Text>

        <Text style={styles.label}>Confirmar Senha</Text>
        <TextInput
          style={styles.input}
          value={confirmSenha}
          onChangeText={setConfirmSenha}
          secureTextEntry
          placeholder="Redigite sua senha"
        />

        <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Cadastrar'}</Text>
        </TouchableOpacity>
      </ScrollView>
      <Disclaimer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100, flexGrow: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#003366' },
  label: { fontSize: 15, marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 15 },
  button: { backgroundColor: '#003366', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default CadastroScreen;
