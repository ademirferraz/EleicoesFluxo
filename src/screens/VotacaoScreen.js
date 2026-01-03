import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { db, doc, setDoc, getDoc } from '../services/firebaseConfig';
import CryptoJS from 'crypto-js';
import Disclaimer from '../components/Disclaimer';

const CANDIDATES_MOCK = [
    { id: '1', name: 'Lula' },
    { id: '2', name: 'Bolsonaro' },
    { id: '3', name: 'Outros' },
];

const VotacaoScreen = ({ route, navigation }) => {
    const { cpf } = route.params;
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleVote = async () => {
        if (!selectedCandidate) {
            Alert.alert('Atenção', 'Selecione um candidato para votar.');
            return;
        }

        setLoading(true);
        try {
            const hashedCpf = CryptoJS.SHA256(cpf.replace(/\D/g, '')).toString();
            const voteRef = doc(db, 'votes', hashedCpf);
            const voteSnap = await getDoc(voteRef);

            if (voteSnap.exists()) {
                Alert.alert('Erro', 'Você já votou!');
                setLoading(false);
                return;
            }

            await setDoc(voteRef, {
                candidate: selectedCandidate.name,
                votedAt: new Date().toISOString()
            });

            Alert.alert('Sucesso', 'Voto computado com sucesso!');
            setSelectedCandidate(null);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao salvar voto. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Escolha seu Candidato</Text>

                {CANDIDATES_MOCK.map((candidate) => (
                    <TouchableOpacity
                        key={candidate.id}
                        style={[
                            styles.option,
                            selectedCandidate?.id === candidate.id && styles.optionSelected
                        ]}
                        onPress={() => setSelectedCandidate(candidate)}
                    >
                        <View style={styles.radioCircle}>
                            {selectedCandidate?.id === candidate.id && <View style={styles.selectedRb} />}
                        </View>
                        <Text style={styles.optionText}>{candidate.name}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={[styles.button, styles.voteButton]}
                    onPress={handleVote}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'VOTAR'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.resultButton]}
                    onPress={() => navigation.navigate('Resultados')}
                >
                    <Text style={styles.resultButtonText}>Ver Resultados</Text>
                </TouchableOpacity>
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
    content: {
        padding: 20,
        justifyContent: 'center',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#003366',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 10,
    },
    optionSelected: {
        borderColor: '#003366',
        backgroundColor: '#e6f0ff',
    },
    optionText: {
        fontSize: 18,
        color: '#333',
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#003366',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    selectedRb: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#003366',
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    voteButton: {
        backgroundColor: '#003366',
    },
    resultButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#003366',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultButtonText: {
        color: '#003366',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default VotacaoScreen;
