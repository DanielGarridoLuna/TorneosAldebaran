import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../utils/colors';

const PartidaCard = ({ 
  partida, 
  onPress, 
  usuarioId, 
  puedeReportar = false, 
  esRondaActual = true,
}) => {
  const tieneResultado = partida.resultado !== null;
  const esMiPartida =
    partida.jugadorA.id === usuarioId || partida.jugadorB.id === usuarioId;

  const getGanadorTexto = () => {
    if (!tieneResultado) return null;
    
    // Verificar si es empate
    const esEmpate = partida.resultado.marcador && partida.resultado.marcador.includes('Empate');
    
    if (esEmpate) {
      return `Empate (${partida.resultado.marcador})`;
    }
    
    const ganador =
      partida.resultado.ganadorId === partida.jugadorA.id
        ? partida.jugadorA.nombre
        : partida.jugadorB.nombre;
    return `${ganador} ganó ${partida.resultado.marcador}`;
  };

  // Determinar si se puede tocar la tarjeta
  const esTocable = puedeReportar;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        esMiPartida && styles.miPartidaCard,
        !esRondaActual && tieneResultado === false && styles.rondaCerradaCard,
        tieneResultado && styles.partidaFinalizadaCard,
      ]}
      onPress={() => esTocable && onPress(partida)}
      disabled={!esTocable}
      activeOpacity={esTocable ? 0.7 : 1}
    >
      <View style={styles.rondaHeader}>
        <Text style={styles.rondaText}>Ronda {partida.ronda}</Text>
        <Text style={styles.horaText}>{partida.hora}</Text>
      </View>

      <View style={styles.jugadoresContainer}>
        <View style={styles.jugador}>
          <View style={[
            styles.avatar,
            tieneResultado && partida.resultado?.ganadorId === partida.jugadorA.id && styles.winnerAvatar
          ]}>
            <Text style={styles.avatarText}>
              {partida.jugadorA.nombre.charAt(0)}
            </Text>
          </View>
          <Text style={styles.jugadorNombre}>{partida.jugadorA.nombre}</Text>
          {tieneResultado && partida.resultado?.ganadorId === partida.jugadorA.id && (
            <Text style={styles.winnerBadge}>🏆</Text>
          )}
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.jugador}>
          <View style={[
            styles.avatar,
            tieneResultado && partida.resultado?.ganadorId === partida.jugadorB.id && styles.winnerAvatar
          ]}>
            <Text style={styles.avatarText}>
              {partida.jugadorB.nombre.charAt(0)}
            </Text>
          </View>
          <Text style={styles.jugadorNombre}>{partida.jugadorB.nombre}</Text>
          {tieneResultado && partida.resultado?.ganadorId === partida.jugadorB.id && (
            <Text style={styles.winnerBadge}>🏆</Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.canchaText}>📍 {partida.cancha}</Text>
        {tieneResultado && (
          <Text style={styles.resultadoText}>{getGanadorTexto()}</Text>
        )}
        {puedeReportar && !tieneResultado && (
          <View style={styles.reportarButton}>
            <Text style={styles.reportarButtonText}>Reportar resultado</Text>
          </View>
        )}
        {!puedeReportar && !tieneResultado && esMiPartida && !esRondaActual && (
          <View style={styles.bloqueadoBadge}>
            <Text style={styles.bloqueadoText}>Ronda cerrada</Text>
          </View>
        )}
        {!puedeReportar && !tieneResultado && !esMiPartida && (
          <View style={styles.infoBadge}>
            <Text style={styles.infoText}>No es tu partida</Text>
          </View>
        )}
        {tieneResultado && (
          <View style={styles.finalizadoBadge}>
            <Text style={styles.finalizadoText}>Finalizado</Text>
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  miPartidaCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  rondaCerradaCard: {
    opacity: 0.7,
    backgroundColor: colors.gray,
  },
  partidaFinalizadaCard: {
    backgroundColor: colors.gray,
  },
  rondaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  rondaText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  horaText: {
    fontSize: 12,
    color: colors.darkGray,
  },
  jugadoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jugador: {
    flex: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  winnerAvatar: {
    backgroundColor: colors.success,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  jugadorNombre: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginHorizontal: 16,
  },
  winnerBadge: {
    fontSize: 16,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    flexWrap: 'wrap',
  },
  canchaText: {
    fontSize: 12,
    color: colors.darkGray,
  },
  resultadoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.success,
  },
  reportarButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  reportarButtonText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  bloqueadoBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  bloqueadoText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoBadge: {
    backgroundColor: colors.darkGray,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  infoText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  finalizadoBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  finalizadoText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default PartidaCard;