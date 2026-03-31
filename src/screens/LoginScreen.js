import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/colors';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [identificador, setIdentificador] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const buscarJugador = async () => {
    const valor = identificador.trim();
    if (!valor) {
      Alert.alert('Error', 'Ingresa tu Player ID o número de teléfono');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('jugadores')
        .select('*')
        .or(`player_id.eq.${valor},telefono.eq.${valor}`);

      if (error) throw error;

      if (data && data.length > 0) {
        const jugador = data[0];
        const result = await login(jugador);
        
        if (result.success) {
          Alert.alert('Éxito', `Bienvenido ${jugador.nombre}`);
        } else {
          Alert.alert('Error', result.error);
        }
      } else {
        Alert.alert(
          'Jugador no encontrado',
          'No encontramos un jugador con ese Player ID o teléfono. ¿Deseas registrarte?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Registrarme', 
              onPress: () => navigation.navigate('Registro', { identificador: valor })
            }
          ]
        );
      }
    } catch (error) {
      console.log('Error al buscar jugador:', error);
      Alert.alert('Error', 'Ocurrió un error al buscar el jugador');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Sistema de torneos</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Player ID o Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 12345 o 5551234567"
              placeholderTextColor={colors.darkGray}
              value={identificador}
              onChangeText={setIdentificador}
              keyboardType="numeric"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={buscarJugador}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Registro', { identificador: '' })}
            >
              <Text style={styles.registerButtonText}>
                ¿No tienes cuenta? Regístrate
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 26,
    color: colors.white,
    fontWeight: 'bold',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    alignItems: 'center',
  },
  registerButtonText: {
    color: colors.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;