import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

const Disclaimer = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Enquete simulada para fins educativos, não oficial do TSE.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderTopWidth: 1,
        borderTopColor: '#dee2e6',
        alignItems: 'center',
    },
    text: {
        fontSize: 10,
        color: '#6c757d',
        textAlign: 'center',
    },
});

export default Disclaimer;
