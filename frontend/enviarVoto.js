import { Alert, Platform } from 'react-native';

function getBackendHost() {
  // For Android emulator use 10.0.2.2, for iOS simulator and web use localhost.
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
  if (Platform.OS === 'web') return `${window.location.protocol}//${window.location.hostname}:5000`;
  return 'http://localhost:5000';
}

export async function enviarVoto(cpf, numero) {
  const host = getBackendHost();
  try {
    const resp = await fetch(`${host}/votar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, numero_candidato: numero }),
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
    console.error('enviarVoto error', err);
    Alert.alert('Erro', 'Falha de conexão com o servidor.');
    return { ok: false, message: err.message };
  }
}
