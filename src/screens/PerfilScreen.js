import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { estadisticasJugador } from '../data/mockData';
import EditarPerfilModal from '../components/EditarPerfilModal';

const PerfilScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const estadisticas = estadisticasJugador[user?.player_id] || {
    torneosParticipados: 0,
    torneosGanados: 0,
    partidasJugadas: 0,
    partidasGanadas: 0,
    partidasPerdidas: 0,
    tasaVictorias: 0,
    mejorPosicion: 0,
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleSaveProfile = async (updatedData) => {
    const result = await updateUser(updatedData);
    if (result.success) {
      setModalVisible(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.nombre?.charAt(0) || user?.player_id?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.nombre || 'Jugador'}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del jugador</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Player ID:</Text>
            <Text style={styles.infoValue}>{user?.player_id || 'No especificado'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{user?.nombre || 'No especificado'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>{user?.telefono || 'No especificado'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Año de nacimiento:</Text>
            <Text style={styles.infoValue}>{user?.anio_nacimiento || 'No especificado'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas de carrera</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{estadisticas.torneosParticipados}</Text>
              <Text style={styles.statLabel}>Torneos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{estadisticas.torneosGanados}</Text>
              <Text style={styles.statLabel}>Torneos ganados</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{estadisticas.tasaVictorias}%</Text>
              <Text style={styles.statLabel}>Win rate</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statsRowItem}>
              <Text style={styles.statsRowNumber}>{estadisticas.partidasJugadas}</Text>
              <Text style={styles.statsRowLabel}>Partidas</Text>
            </View>
            <View style={styles.statsRowItem}>
              <Text style={styles.statsRowNumber}>{estadisticas.partidasGanadas}</Text>
              <Text style={styles.statsRowLabel}>Ganadas</Text>
            </View>
            <View style={styles.statsRowItem}>
              <Text style={styles.statsRowNumber}>{estadisticas.partidasPerdidas}</Text>
              <Text style={styles.statsRowLabel}>Perdidas</Text>
            </View>
            <View style={styles.statsRowItem}>
              <Text style={styles.statsRowNumber}>#{estadisticas.mejorPosicion}</Text>
              <Text style={styles.statsRowLabel}>Mejor puesto</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Notificaciones</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Idioma</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Términos y condiciones</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      <EditarPerfilModal
        visible={modalVisible}
        user={user}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveProfile}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  profileHeader: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.darkGray,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: colors.gray,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  statsRowItem: {
    alignItems: 'center',
  },
  statsRowNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  statsRowLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.primary,
  },
  logoutButton: {
    marginTop: 30,
    marginHorizontal: 16,
    marginBottom: 40,
    backgroundColor: colors.error,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PerfilScreen;