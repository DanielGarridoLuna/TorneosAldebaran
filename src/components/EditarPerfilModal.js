import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../utils/colors';

const EditarPerfilModal = ({ visible, user, onClose, onSave }) => {
  const [player_id, setPlayerId] = useState(user?.player_id || '');
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [anio_nacimiento, setAnioNacimiento] = useState(
    user?.anio_nacimiento ? String(user.anio_nacimiento) : ''
  );

  const handleSave = () => {
    if (!player_id.trim()) {
      Alert.alert('Error', 'El Player ID es requerido');
      return;
    }
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    if (!telefono.trim()) {
      Alert.alert('Error', 'El teléfono es requerido');
      return;
    }

    onSave({
      player_id: player_id.trim(),
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      anio_nacimiento: anio_nacimiento ? parseInt(anio_nacimiento) : null,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar perfil</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Player ID *</Text>
            <TextInput
              style={styles.input}
              value={player_id}
              onChangeText={setPlayerId}
              placeholder="Ej: 12345"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre completo *</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Ash Ketchum"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Teléfono *</Text>
            <TextInput
              style={styles.input}
              value={telefono}
              onChangeText={setTelefono}
              placeholder="Ej: 5551234567"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Año de nacimiento</Text>
            <TextInput
              style={styles.input}
              value={anio_nacimiento}
              onChangeText={setAnioNacimiento}
              placeholder="Ej: 2005"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={handleSave}
            >
              <Text style={styles.modalButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.gray,
  },
  modalButtonSave: {
    backgroundColor: colors.secondary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default EditarPerfilModal;