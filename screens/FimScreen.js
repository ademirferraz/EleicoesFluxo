import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Disclaimer from '../src/components/Disclaimer';

const FimScreen = ({ navigation }) => {
  useEffect(() => {
    const t = setTimeout(() => {
      navigation.navigate('Home');
    }, 3000);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>FIM</Text>
        <Text style={styles.subtitle}>Seu voto foi computado com sucesso.</Text>
      </View>
      <Disclaimer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 48, fontWeight: 'bold', color: '#28a745' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 12 }
});

export default FimScreen;
