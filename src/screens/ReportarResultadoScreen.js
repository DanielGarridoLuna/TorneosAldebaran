import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const ReportarResultadoScreen = ({ route, navigation }) => {
  const { partida, torneoId, rondaActual, eventoId } = route.params;
  const { user } = useAuth();
  const [selectedGanador, setSelectedGanador] = useState(null);
  const [selectedMarcador, setSelectedMarcador] = useState(null);
  const [esEmpate, setEsEmpate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const marcadoresVictoria = ['2-0', '2-1'];
  const marcadoresEmpate = ['1-1 (Empate)'];

  const jugadorANombre = partida.jugador1_nombre;
  const jugadorBNombre = partida.jugador2_nombre;

  const handleGanadorSelect = (ganador) => {
    setSelectedGanador(ganador);
    setEsEmpate(false);
    setSelectedMarcador(null);
  };

  const handleEmpateSelect = () => {
    setEsEmpate(true);
    setSelectedGanador(null);
    setSelectedMarcador('1-1 (Empate)');
  };

  const handleReportar = async () => {
    if (!esEmpate && !selectedGanador) {
      Alert.alert('Error', 'Debes seleccionar un ganador o declarar empate');
      return;
    }

    if (!selectedMarcador) {
      Alert.alert('Error', 'Debes seleccionar el marcador');
      return;
    }

    setIsLoading(true);

    try {
      const jugadorId = user.player_id;
      const esJugador1 = partida.jugador1_id === jugadorId;
      const esJugador2 = partida.jugador2_id === jugadorId;

      if (!esJugador1 && !esJugador2) {
        Alert.alert('Error', 'No puedes reportar esta partida');
        return;
      }

      let ganadorReportado = null;
      let empate = false;

      if (esEmpate) {
        empate = true;
      } else {
        if (selectedGanador === 'A') {
          ganadorReportado = partida.jugador1_id;
        } else {
          ganadorReportado = partida.jugador2_id;
        }
      }

      const campo = esJugador1 ? 'ganador_reportado_1' : 'ganador_reportado_2';
      const updateData = {
        [campo]: ganadorReportado,
        empate: empate,
      };

      // Si es empate, limpiamos los ganadores
      if (empate) {
        updateData.ganador_reportado_1 = null;
        updateData.ganador_reportado_2 = null;
      }

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', partida.id);

      if (error) throw error;

      // Verificar si ambos jugadores reportaron el mismo ganador
      const { data: matchActualizado } = await supabase
        .from('matches')
        .select('*')
        .eq('id', partida.id)
        .single();

      if (matchActualizado.ganador_reportado_1 && 
          matchActualizado.ganador_reportado_2 && 
          matchActualizado.ganador_reportado_1 === matchActualizado.ganador_reportado_2) {
        
        await supabase
          .from('matches')
          .update({
            ganador_final: matchActualizado.ganador_reportado_1,
            confirmado: true
          })
          .eq('id', partida.id);
      }

      Alert.alert('Éxito', 'Resultado reportado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.log('Error al reportar:', error);
      Alert.alert('Error', 'No se pudo reportar el resultado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <Text style={styles.title}>Reportar resultado</Text>
        <Text style={styles.subtitle}>
          Ronda {partida.ronda_numero || partida.ronda}
        </Text>

        <View style={styles.jugadoresContainer}>
          <TouchableOpacity
            style={[
              styles.jugadorCard,
              selectedGanador === 'A' && !esEmpate && styles.jugadorCardSelected,
            ]}
            onPress={() => handleGanadorSelect('A')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{jugadorANombre?.charAt(0) || '?'}</Text>
            </View>
            <Text style={styles.jugadorNombre}>{jugadorANombre}</Text>
            {selectedGanador === 'A' && !esEmpate && (
              <Text style={styles.checkMark}>✓</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.vsText}>VS</Text>

          <TouchableOpacity
            style={[
              styles.jugadorCard,
              selectedGanador === 'B' && !esEmpate && styles.jugadorCardSelected,
            ]}
            onPress={() => handleGanadorSelect('B')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{jugadorBNombre?.charAt(0) || '?'}</Text>
            </View>
            <Text style={styles.jugadorNombre}>{jugadorBNombre}</Text>
            {selectedGanador === 'B' && !esEmpate && (
              <Text style={styles.checkMark}>✓</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.empateButton,
            esEmpate && styles.empateButtonActive,
          ]}
          onPress={handleEmpateSelect}
        >
          <Text style={[styles.empateButtonText, esEmpate && styles.empateButtonTextActive]}>
            🤝 Declarar empate
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Marcador (mejor de 3)</Text>

        {!esEmpate ? (
          <View style={styles.marcadoresContainer}>
            {marcadoresVictoria.map((marcador) => (
              <TouchableOpacity
                key={marcador}
                style={[
                  styles.marcadorButton,
                  selectedMarcador === marcador && !esEmpate && styles.marcadorButtonSelected,
                ]}
                onPress={() => setSelectedMarcador(marcador)}
              >
                <Text
                  style={[
                    styles.marcadorText,
                    selectedMarcador === marcador && !esEmpate && styles.marcadorTextSelected,
                  ]}
                >
                  {marcador}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.marcadoresContainer}>
            {marcadoresEmpate.map((marcador) => (
              <TouchableOpacity
                key={marcador}
                style={[
                  styles.marcadorButton,
                  styles.marcadorButtonEmpate,
                  selectedMarcador === marcador && styles.marcadorButtonSelected,
                ]}
                onPress={() => setSelectedMarcador(marcador)}
              >
                <Text
                  style={[
                    styles.marcadorText,
                    selectedMarcador === marcador && styles.marcadorTextSelected,
                  ]}
                >
                  {marcador}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.reportarButton}
          onPress={handleReportar}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.reportarButtonText}>Confirmar resultado</Text>
          )}
        </TouchableOpacity>
      </View>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 30,
  },
  jugadoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  jugadorCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jugadorCardSelected: {
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  jugadorNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.darkGray,
    marginHorizontal: 8,
  },
  checkMark: {
    fontSize: 24,
    color: colors.success,
    marginTop: 8,
  },
  empateButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.warning,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  empateButtonActive: {
    backgroundColor: colors.warning,
  },
  empateButtonText: {
    fontSize: 16,
    color: colors.warning,
    fontWeight: '500',
  },
  empateButtonTextActive: {
    color: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  marcadoresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 12,
  },
  marcadorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  marcadorButtonEmpate: {
    borderColor: colors.warning,
  },
  marcadorButtonSelected: {
    backgroundColor: colors.secondary,
  },
  marcadorText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '500',
  },
  marcadorTextSelected: {
    color: colors.white,
  },
  reportarButton: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  reportarButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReportarResultadoScreen;