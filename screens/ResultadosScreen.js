import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView, Platform, BackHandler, TouchableOpacity, FlatList } from 'react-native';
import { BASE_URL } from '../src/config';
import { BarChart } from 'react-native-gifted-charts';
import Disclaimer from '../src/components/Disclaimer';

const API_URL = BASE_URL;
const screenWidth = Dimensions.get('window').width;

const ResultadosScreen = () => {
  const [votos, setVotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/candidatos`);
      const json = await resp.json();
      console.log(json);
      const entries = Array.isArray(json) ? json : (json?.candidatos || []);
      const formatado = entries.map(item => ({ label: item.nome, value: parseInt(item.votos_recebidos) || 0 }));
      setVotos(formatado);
      const total = formatado.reduce((sum, it) => sum + Number(it.value || 0), 0);
      setTotalVotes(total);
    } catch (e) {
      setVotos([]);
      setTotalVotes(0);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);
  useFocusEffect(React.useCallback(() => { load(); }, []));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  if (!votos || votos.length === 0) {
    return <Text>Carregando dados...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resultados em Tempo Real</Text>
        <Text style={styles.subtitle}>Total de Votos: {totalVotes}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {votos.length > 0 ? (
          <View style={styles.chartArea}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <BarChart
                data={votos.map(it => ({
                  label: it.label,
                  value: it.value,
                  topLabelComponent: () => (
                    <Text style={{ color: 'blue', fontSize: 10, marginBottom: 6 }}>
                      {totalVotes > 0 ? ((Number(it.value) / totalVotes) * 100).toFixed(1) : 0}%
                    </Text>
                  ),
                  frontColor: '#2ecc71',
                  labelTextStyle: {
                    color: '#333',
                    fontSize: 11,
                    width: 150,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    marginTop: 0,
                  },
                }))}
                width={1200}
                height={300}
                barWidth={50}
                noOfSections={4}
                barBorderRadius={4}
                yAxisThickness={1}
                xAxisThickness={1}
                initialSpacing={50}
                spacing={120}
                isAnimated
                xAxisLabelsVerticalShift={0} 
              />
            </ScrollView>
          </View>
        ) : (
          <Text style={styles.noVotes}>Nenhum voto registrado ainda.</Text>
        )}

        <View style={{ marginTop: 20, width: '100%' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Resumo (Texto)</Text>
          <FlatList
            data={votos}
            keyExtractor={(item, index) => `${item.label}-${index}`}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                <Text style={{ fontSize: 14, color: '#333' }}>{item.label}: {item.value} votos</Text>
              </View>
            )}
          />
        </View>

        <TouchableOpacity style={styles.exitButton} onPress={() => {
          if (Platform.OS === 'web') { window.close(); } else { BackHandler.exitApp(); }
        }}>
          <Text style={styles.exitButtonText}>Fechar App</Text>
        </TouchableOpacity>
      </ScrollView>
      <Disclaimer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  content: { padding: 10, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#003366' },
  subtitle: { fontSize: 16, color: '#666' },
  chartArea: { 
    marginTop: 20, 
    height: 450, 
    paddingBottom: 50 
  },
  noVotes: { marginTop: 50, fontSize: 18, color: '#999' },
  exitButton: { marginTop: 40, padding: 15, borderRadius: 8, backgroundColor: '#6c757d', width: 200 },
  exitButtonText: { color: '#fff', textAlign: 'center', fontSize: 16 }
});

export default ResultadosScreen;
