import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import MaskInput from 'react-native-mask-input';
import { cpf } from 'cpf-cnpj-validator';
import Disclaimer from '../components/Disclaimer';

const CadastroScreen = ({ navigation }) => {
    const [nome, setNome] = useState('');
    const [cpfValue, setCpfValue] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');

    const handleCadastro = () => {
        // Validação CPF
        if (!cpf.isValid(cpfValue)) {
            Alert.alert('Erro', 'CPF inválido.');
            return;
        }

        // Validação Data de Nascimento e Idade
        const dateParts = dataNascimento.split('/');
        if (dateParts.length !== 3) {
            Alert.alert('Erro', 'Data de nascimento inválida.');
            return;
        }

        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);

        const birthDate = new Date(year, month - 1, day);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (isNaN(age)) {
            Alert.alert('Erro', 'Data de nascimento inválida.');
            return;
        }

        if (age < 16) {
            Alert.alert('Acesso Negado', 'Você não pode votar (idade mínima 16 anos no Brasil).');
            return;
        }

        // Sucesso
        navigation.replace('Votacao', { cpf: cpfValue });
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
                <MaskInput
                    style={styles.input}
                    value={cpfValue}
                    onChangeText={(masked, unmasked) => setCpfValue(masked)}
                    mask={[/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/]}
                    keyboardType="numeric"
                    placeholder="XXX.XXX.XXX-XX"
                />

                <Text style={styles.label}>Data de Nascimento</Text>
                <MaskInput
                    style={styles.input}
                    value={dataNascimento}
                    onChangeText={(masked, unmasked) => setDataNascimento(masked)}
                    mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
                    keyboardType="numeric"
                    placeholder="DD/MM/AAAA"
                />

                <TouchableOpacity style={styles.button} onPress={handleCadastro}>
                    <Text style={styles.buttonText}>Cadastrar</Text>
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
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#003366',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CadastroScreen;
