import React, { useState, useEffect } from 'react';
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
import { torneos, partidas } from '../data/mockData';
import PartidaCard from '../components/PartidaCard';
import { useAuth } from '../context/AuthContext';

const DetalleTorneoScreen = ({ route, navigation }) => {
  const { torneoId } = route.params;
  const { user } = useAuth();
  const [selectedRonda, setSelectedRonda] = useState(null);

  const torneo = torneos.find((t) => t.id === torneoId);
  const torneoPartidas = partidas[torneoId] || { rondas: [] };
  const rondasDisponibles = torneoPartidas.rondas;

  const esTorneoActivo = torneo?.estado === 'activo';
  const esTorneoFinalizado = torneo?.estado === 'finalizado';
  const rondaActual = torneo?.rondaActual || 0;

  const rondasMostradas = rondasDisponibles.filter((ronda) => {
    if (esTorneoFinalizado) {
      return true;
    }
    if (esTorneoActivo) {
      return ronda.numero <= rondaActual;
    }
    return false;
  });

  useEffect(() => {
    if (esTorneoActivo && rondaActual > 0) {
      setSelectedRonda(rondaActual);
    } else if (rondasMostradas.length > 0) {
      setSelectedRonda(rondasMostradas[0]?.numero);
    }
  }, []);

  const rondaActualData = rondasMostradas.find(
    (r) => r.numero === selectedRonda
  );

  const handlePartidaPress = (partida) => {
    const esMiPartida =
      partida.jugadorA.id === user.id || partida.jugadorB.id === user.id;
    const yaTieneResultado = partida.resultado !== null;
    const esRondaActualNum = selectedRonda === rondaActual;

    const puedeReportar = esMiPartida && !yaTieneResultado && esRondaActualNum && esTorneoActivo;

    if (puedeReportar) {
      navigation.navigate('ReportarResultado', {
        partida: partida,
        torneoId: torneoId,
        rondaActual: rondaActual,
      });
    } else if (!esRondaActualNum && !yaTieneResultado && esMiPartida) {
      Alert.alert(
        'Ronda no disponible',
        `Solo puedes reportar resultados de la ronda actual (Ronda ${rondaActual})`
      );
    } else if (!esMiPartida) {
      Alert.alert('Información', 'Esta partida no te pertenece');
    } else if (yaTieneResultado) {
      Alert.alert('Información', 'Esta partida ya tiene resultado registrado');
    }
  };

  if (!torneo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Torneo no encontrado</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.header}>
          <Text style={styles.titulo}>{torneo.nombre}</Text>
          <Text style={styles.fecha}>📅 {torneo.fecha}</Text>
          <Text style={styles.ubicacion}>📍 {torneo.ubicacion}</Text>
          <Text style={styles.descripcion}>{torneo.descripcion}</Text>

          {esTorneoActivo && rondaActual > 0 && (
            <View style={styles.rondaActualBadge}>
              <Text style={styles.rondaActualText}>
                Ronda actual: {rondaActual}
              </Text>
            </View>
          )}

          {esTorneoFinalizado && (
            <View style={[styles.rondaActualBadge, styles.finalizadoBadge]}>
              <Text style={styles.rondaActualText}>Torneo finalizado</Text>
            </View>
          )}

          {esTorneoActivo && rondaActual === 0 && (
            <View style={[styles.rondaActualBadge, styles.proximoBadge]}>
              <Text style={styles.rondaActualText}>Torneo por iniciar</Text>
            </View>
          )}
        </View>

        {rondasMostradas.length > 0 ? (
          <>
            <Text style={styles.rondasTitle}>Rondas</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.rondasScroll}
            >
              {rondasMostradas.map((ronda) => {
                const esRondaActualNum = ronda.numero === rondaActual;
                const esRondaCerrada = ronda.numero < rondaActual;
                const esRondaFutura = ronda.numero > rondaActual;

                return (
                  <TouchableOpacity
                    key={ronda.numero}
                    style={[
                      styles.rondaButton,
                      selectedRonda === ronda.numero && styles.rondaButtonActive,
                      esRondaActualNum && styles.rondaButtonCurrent,
                      esRondaCerrada && styles.rondaButtonClosed,
                      esRondaFutura && styles.rondaButtonFuture,
                    ]}
                    onPress={() => setSelectedRonda(ronda.numero)}
                    disabled={esRondaFutura}
                  >
                    <Text
                      style={[
                        styles.rondaButtonText,
                        selectedRonda === ronda.numero &&
                          styles.rondaButtonTextActive,
                        esRondaActualNum && styles.rondaButtonTextCurrent,
                        esRondaCerrada && styles.rondaButtonTextClosed,
                      ]}
                    >
                      Ronda {ronda.numero}
                      {esRondaActualNum && ' (Actual)'}
                      {esRondaCerrada && ' ✓'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.partidasTitle}>
              Partidas - Ronda {selectedRonda}
              {selectedRonda === rondaActual && esTorneoActivo && (
                <Text style={styles.partidasSubtitle}> (Ronda actual - puedes reportar tus partidas)</Text>
              )}
              {selectedRonda < rondaActual && (
                <Text style={styles.partidasSubtitleClosed}> (Ronda cerrada - solo lectura)</Text>
              )}
              {selectedRonda > rondaActual && esTorneoActivo && (
                <Text style={styles.partidasSubtitleClosed}> (Ronda futura - no disponible)</Text>
              )}
            </Text>

            {rondaActualData?.partidas
              .filter((partida) => 
                partida.jugadorA.id === user.id || partida.jugadorB.id === user.id
              )
              .length === 0 ? (
                <View style={styles.noPartidasContainer}>
                  <Text style={styles.noPartidasText}>
                    No tienes partidas en esta ronda
                  </Text>
                </View>
              ) : (
                rondaActualData?.partidas
                  .filter((partida) => 
                    partida.jugadorA.id === user.id || partida.jugadorB.id === user.id
                  )
                  .map((partida) => {
                    const esRondaActualNum = selectedRonda === rondaActual;
                    const esMiPartida =
                      partida.jugadorA.id === user.id || partida.jugadorB.id === user.id;
                    const yaTieneResultado = partida.resultado !== null;
                    const puedeReportar = esMiPartida && !yaTieneResultado && esRondaActualNum && esTorneoActivo;

                    return (
                      <PartidaCard
                        key={partida.id}
                        partida={partida}
                        onPress={handlePartidaPress}
                        usuarioId={user.id}
                        puedeReportar={puedeReportar}
                        esRondaActual={esRondaActualNum}
                      />
                    );
                  })
              )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {torneo.estado === 'proximo'
                ? 'Las rondas se generarán cuando comience el torneo'
                : 'No hay rondas disponibles'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
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
    lineHeight: 20,
    marginBottom: 12,
  },
  rondaActualBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  finalizadoBadge: {
    backgroundColor: colors.darkGray,
  },
  proximoBadge: {
    backgroundColor: colors.warning,
  },
  rondaActualText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  rondasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  rondasScroll: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  rondaButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  rondaButtonActive: {
    backgroundColor: colors.secondary,
  },
  rondaButtonCurrent: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  rondaButtonClosed: {
    backgroundColor: colors.gray,
    borderColor: colors.darkGray,
    opacity: 0.7,
  },
  rondaButtonFuture: {
    backgroundColor: colors.gray,
    borderColor: colors.gray,
    opacity: 0.5,
  },
  rondaButtonText: {
    color: colors.secondary,
    fontWeight: '500',
  },
  rondaButtonTextActive: {
    color: colors.white,
  },
  rondaButtonTextCurrent: {
    color: colors.success,
  },
  rondaButtonTextClosed: {
    color: colors.darkGray,
  },
  partidasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  partidasSubtitle: {
    fontSize: 12,
    fontWeight: 'normal',
    color: colors.success,
  },
  partidasSubtitleClosed: {
    fontSize: 12,
    fontWeight: 'normal',
    color: colors.darkGray,
  },
  noPartidasContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  noPartidasText: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default DetalleTorneoScreen;