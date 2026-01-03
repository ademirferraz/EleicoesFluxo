import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { db, collection, onSnapshot } from '../services/firebaseConfig';
import Disclaimer from '../components/Disclaimer';

const screenWidth = Dimensions.get('window').width;

const ResultadosScreen = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalVotes, setTotalVotes] = useState(0);

    useEffect(() => {
        const votesRef = collection(db, 'votes');
        const unsubscribe = onSnapshot(votesRef, (snapshot) => {
            const votes = snapshot.docs.map(doc => doc.data());
            const counts = {};
            let total = 0;

            votes.forEach(vote => {
                const candidate = vote.candidate;
                if (candidate) {
                    counts[candidate] = (counts[candidate] || 0) + 1;
                    total++;
                }
            });

            setTotalVotes(total);

            // Transforma em formato para o gráfico
            const data = Object.keys(counts).map(key => {
                const count = counts[key];
                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                return {
                    value: count,
                    label: key,
                    topLabelComponent: () => (
                        <Text style={{ color: 'blue', fontSize: 10, marginBottom: 6 }}>
                            {percentage}%
                        </Text>
                    ),
                    frontColor: '#003366',
                };
            });

            setChartData(data);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar votos:", error);
            setLoading(false);
        });

        return () => unsubscribe();
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
                        <BarChart
                            data={chartData}
                            width={screenWidth - 60}
                            height={300}
                            barWidth={50}
                            noOfSections={4}
                            barBorderRadius={4}
                            frontColor="#003366"
                            yAxisThickness={0}
                            xAxisThickness={0}
                            isAnimated
                        />
                    </View>
                ) : (
                    <Text style={styles.noVotes}>Nenhum voto registrado ainda.</Text>
                )}
            </ScrollView>
            <Disclaimer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        alignItems: 'center',
        flexGrow: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#003366',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        color: '#666',
    },
    chartContainer: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    noVotes: {
        marginTop: 50,
        fontSize: 18,
        color: '#999',
    },
});

export default ResultadosScreen;
