import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView, Platform, BackHandler, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import Disclaimer from '../src/components/Disclaimer';
const API_URL = 'http://127.0.0.1:5000';

const screenWidth = Dimensions.get('window').width;

const ResultadosScreen = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${API_URL}/resultados`);
        const json = await resp.json();
        console.log('Resultados recebidos:', json);
        const entries = Array.isArray(json) ? json : (json?.resultados || []);
        const total = entries.reduce((sum, it) => sum + Number(it.value ?? it.votos ?? it.votos_recebidos ?? 0), 0);
        setTotalVotes(total);
        const data = entries.map((it) => {
          const lbl = it.label ?? it.nome ?? 'Desconhecido';
          const val = Number(it.value ?? it.votos ?? it.votos_recebidos ?? 0);
          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
          return {
            value: val,
            label: lbl,
            topLabelComponent: () => (
              <Text style={{ color: 'blue', fontSize: 10, marginBottom: 6 }}>{pct}%</Text>
            ),
            frontColor: '#003366'
          };
        });
        console.log('Gráfico carregou:', data);
        setChartData(data);
      } catch (e) {
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Resultados em Tempo Real</Text>
        <Text style={styles.subtitle}>Total de Votos: {totalVotes}</Text>
        {chartData.length > 0 ? (
          <View style={styles.chartContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <BarChart
                data={chartData.map(it => ({
                  ...it,
                  labelTextStyle: { transform: [{ rotate: '45deg' }], fontSize: 10 }
                }))}
                width={Math.max(screenWidth - 60, chartData.length * 80)}
                height={300}
                barWidth={40}
                noOfSections={4}
                barBorderRadius={4}
                frontColor="#003366"
                yAxisThickness={0}
                xAxisThickness={0}
                initialSpacing={20}
                spacing={20}
                isAnimated
              />
            </ScrollView>
          </View>
        ) : (
          <Text style={styles.noVotes}>Nenhum voto registrado ainda.</Text>
        )}
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
  content: { padding: 20, alignItems: 'center', flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#003366' },
  subtitle: { fontSize: 16, marginBottom: 30, color: '#666' },
  chartContainer: { marginTop: 20, alignItems: 'center', justifyContent: 'center' },
  noVotes: { marginTop: 50, fontSize: 18, color: '#999' }
  ,exitButton: { marginTop: 24, padding: 12, borderRadius: 8, backgroundColor: '#6c757d' }
  ,exitButtonText: { color: '#fff', textAlign: 'center', fontSize: 16 }
});

export default ResultadosScreen;
