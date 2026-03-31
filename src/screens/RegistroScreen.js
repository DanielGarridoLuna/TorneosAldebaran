import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const RegistroScreen = ({ route, navigation }) => {
  const { identificador } = route.params || { identificador: '' };
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    player_id: identificador,
    telefono: '',
    nombre: '',
    anio_nacimiento: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validar = () => {
    if (!formData.player_id.trim()) {
      Alert.alert('Error', 'El Player ID es requerido');
      return false;
    }
    if (!/^[0-9]+$/.test(formData.player_id)) {
      Alert.alert('Error', 'Player ID solo debe contener números');
      return false;
    }
    if (!formData.telefono.trim()) {
      Alert.alert('Error', 'El teléfono es requerido');
      return false;
    }
    if (!/^[0-9]+$/.test(formData.telefono)) {
      Alert.alert('Error', 'Teléfono solo debe contener números');
      return false;
    }
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(formData.nombre)) {
      Alert.alert('Error', 'El nombre solo debe contener letras');
      return false;
    }
    if (formData.anio_nacimiento && formData.anio_nacimiento.length !== 4) {
      Alert.alert('Error', 'El año debe tener 4 dígitos');
      return false;
    }
    return true;
  };

  const registrar = async () => {
    if (!validar()) return;

    setIsLoading(true);

    try {
      const { data: existe } = await supabase
        .from('jugadores')
        .select('id')
        .or(`player_id.eq.${formData.player_id},telefono.eq.${formData.telefono}`);

      if (existe && existe.length > 0) {
        Alert.alert('Error', 'Ya existe un jugador con ese Player ID o teléfono');
        setIsLoading(false);
        return;
      }

      const { data: jugador, error } = await supabase
        .from('jugadores')
        .insert({
          player_id: formData.player_id,
          nombre: formData.nombre,
          telefono: formData.telefono,
          anio_nacimiento: formData.anio_nacimiento ? parseInt(formData.anio_nacimiento) : null,
        })
        .select()
        .single();

      if (error) {
        console.log('Error al insertar:', error);
        Alert.alert('Error', 'Error al registrar el jugador: ' + error.message);
        return;
      }

      if (jugador) {
        const result = await login(jugador);
        
        if (result.success) {
          Alert.alert('¡Registro exitoso!', `Bienvenido ${jugador.nombre}`);
        } else {
          Alert.alert('Error', result.error);
        }
      }
    } catch (error) {
      console.log('Error al registrar:', error);
      Alert.alert('Error', 'Ocurrió un error al registrar el jugador');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Registro de jugador</Text>
          <Text style={styles.subtitle}>Completa tus datos</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Player ID *</Text>
            <TextInput
              style={styles.input}
              value={formData.player_id}
              onChangeText={(text) => handleChange('player_id', text.replace(/\D/g, ''))}
              placeholder="Ej: 12345"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Teléfono *</Text>
            <TextInput
              style={styles.input}
              value={formData.telefono}
              onChangeText={(text) => handleChange('telefono', text.replace(/\D/g, ''))}
              placeholder="Ej: 5551234567"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre completo *</Text>
            <TextInput
              style={styles.input}
              value={formData.nombre}
              onChangeText={(text) => handleChange('nombre', text.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, ''))}
              placeholder="Ej: Ash Ketchum"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Año de nacimiento</Text>
            <TextInput
              style={styles.input}
              value={formData.anio_nacimiento}
              onChangeText={(text) => handleChange('anio_nacimiento', text.replace(/\D/g, ''))}
              placeholder="Ej: 2005"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={registrar}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.registerButtonText}>Registrarme</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  registerButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  registerButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default RegistroScreen;