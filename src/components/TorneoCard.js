import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../utils/colors';

const TorneoCard = ({ torneo, onPress, onRegister }) => {
  const getEstadoColor = () => {
    switch (torneo.estado) {
      case 'activo':
        return colors.success;
      case 'proximo':
        return colors.warning;
      case 'finalizado':
        return colors.darkGray;
      default:
        return colors.darkGray;
    }
  };

  const getEstadoTexto = () => {
    switch (torneo.estado) {
      case 'activo':
        return 'En curso';
      case 'proximo':
        return 'Próximo';
      case 'finalizado':
        return 'Finalizado';
      default:
        return torneo.estado;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(torneo)}>
      <View style={styles.header}>
        <Text style={styles.nombre}>{torneo.nombre}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor() }]}>
          <Text style={styles.estadoTexto}>{getEstadoTexto()}</Text>
        </View>
      </View>

      <Text style={styles.fecha}>📅 {torneo.fecha}</Text>
      <Text style={styles.ubicacion}>📍 {torneo.ubicacion}</Text>
      <Text style={styles.descripcion} numberOfLines={2}>
        {torneo.descripcion}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.inscripcion}>
          👥 {torneo.jugadoresInscritos}/{torneo.capacidadMaxima} inscritos
        </Text>
        {torneo.estado !== 'finalizado' && !torneo.inscrito && (
          <TouchableOpacity style={styles.registerButton} onPress={() => onRegister(torneo)}>
            <Text style={styles.registerButtonText}>Inscribirse</Text>
          </TouchableOpacity>
        )}
        {torneo.inscrito && torneo.estado !== 'finalizado' && (
          <View style={styles.inscritoBadge}>
            <Text style={styles.inscritoTexto}>✓ Inscrito</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoTexto: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  fecha: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 4,
  },
  ubicacion: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  inscripcion: {
    fontSize: 12,
    color: colors.darkGray,
  },
  registerButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  registerButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  inscritoBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  inscritoTexto: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TorneoCard;