import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const normalizarId = (valor) => {
  if (valor === null || valor === undefined) return null;
  const limpio = String(valor).trim();
  if (!limpio) return null;
  if (limpio.toLowerCase() === "null") return null;
  if (limpio.toLowerCase() === "undefined") return null;
  return limpio;
};

const esUuid = (valor) => {
  const limpio = normalizarId(valor);
  if (!limpio) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(limpio);
};

const MisPartidasScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [partidas, setPartidas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('pendientes');

  useEffect(() => {
    cargarPartidas();
  }, []);

  const cargarPartidas = async () => {
    if (!user?.player_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data: torneosActivos } = await supabase
        .from('torneos')
        .select('id')
        .eq('activo', true);

      const torneosIds = torneosActivos?.map(t => t.id) || [];

      if (torneosIds.length === 0) {
        setPartidas([]);
        setIsLoading(false);
        return;
      }

      const { data: inscripciones, error: inscError } = await supabase
        .from('inscripciones')
        .select('torneo_id, evento_id')
        .eq('jugador_id', user.id)
        .in('torneo_id', torneosIds);

      if (inscError) throw inscError;

      if (!inscripciones || inscripciones.length === 0) {
        setPartidas([]);
        setIsLoading(false);
        return;
      }

      const eventosIds = [...new Set(inscripciones.map(i => i.evento_id).filter(Boolean))];

      if (eventosIds.length === 0) {
        setPartidas([]);
        setIsLoading(false);
        return;
      }

      const { data: eventos, error: eventosError } = await supabase
        .from('eventos')
        .select('*')
        .in('id', eventosIds)
        .eq('archivado', false);

      if (eventosError) throw eventosError;

      if (!eventos || eventos.length === 0) {
        setPartidas([]);
        setIsLoading(false);
        return;
      }

      const todasPartidas = [];

      for (const evento of eventos) {
        if (!esUuid(evento.id)) continue;

        const { data: rondas, error: rondasError } = await supabase
          .from('rondas')
          .select('*')
          .eq('evento_id', evento.id)
          .order('numero_ronda', { ascending: false });

        if (rondasError) {
          console.log('Error en rondas:', rondasError);
          continue;
        }

        if (!rondas || rondas.length === 0) continue;

        const rondaActiva = rondas.find(r => r.status === 'activa');

        if (!rondaActiva) continue;

        const { data: matches, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .eq('ronda_id', rondaActiva.id)
          .eq('evento_id', evento.id)
          .order('mesa', { ascending: true });

        if (matchesError) {
          console.log('Error en matches:', matchesError);
          continue;
        }

        if (!matches || matches.length === 0) continue;

        const misMatches = matches.filter(m =>
          normalizarId(m.jugador1_id) === user.player_id ||
          normalizarId(m.jugador2_id) === user.player_id
        );

        if (misMatches.length === 0) continue;

        const ids = [
          ...new Set(
            misMatches
              .flatMap(m => [m.jugador1_id, m.jugador2_id])
              .map(normalizarId)
              .filter(Boolean)
          )
        ];

        let mapaNombres = {};
        if (ids.length > 0) {
          const { data: jugadores } = await supabase
            .from('jugadores')
            .select('player_id, nombre')
            .in('player_id', ids);

          (jugadores || []).forEach(j => {
            mapaNombres[j.player_id] = j.nombre;
          });
        }

        const { data: torneo } = await supabase
          .from('torneos')
          .select('nombre')
          .eq('id', evento.torneo_id)
          .single();

        const partidasFormateadas = misMatches.map(match => {
          const tieneResultado = match.confirmado === true;
          return {
            ...match,
            ronda_numero: rondaActiva.numero_ronda,
            torneoNombre: torneo?.nombre || 'Torneo',
            jugador1_nombre: mapaNombres[normalizarId(match.jugador1_id)] || match.jugador1_id || 'Desconocido',
            jugador2_nombre: match.jugador2_id ? (mapaNombres[normalizarId(match.jugador2_id)] || match.jugador2_id) : 'BYE',
            tieneResultado: tieneResultado,
            puedeReportar: !tieneResultado,
            empate: match.empate || false,
            ganador_final: match.ganador_final,
          };
        });

        todasPartidas.push(...partidasFormateadas);
      }

      setPartidas(todasPartidas);
    } catch (error) {
      console.log('Error al cargar partidas:', error);
      Alert.alert('Error', 'No se pudieron cargar tus partidas: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportar = (partida) => {
    navigation.navigate('ReportarResultado', {
      partida: partida,
      torneoId: partida.torneo_id,
      rondaActual: partida.ronda_numero,
      eventoId: partida.evento_id,
    });
  };

  const partidasPendientes = partidas.filter(p => !p.tieneResultado);
  const partidasFinalizadas = partidas.filter(p => p.tieneResultado);
  const partidasMostradas = selectedFilter === 'pendientes' ? partidasPendientes : partidasFinalizadas;

  const renderPartida = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.torneoNombre}>{item.torneoNombre}</Text>
        <Text style={styles.rondaText}>Ronda {item.ronda_numero}</Text>
      </View>
      
      <View style={styles.jugadoresContainer}>
        <View style={styles.jugador}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.jugador1_nombre?.charAt(0) || '?'}
            </Text>
          </View>
          <Text style={styles.jugadorNombre}>{item.jugador1_nombre}</Text>
          {item.ganador_final === item.jugador1_id && (
            <Text style={styles.winnerBadge}>🏆</Text>
          )}
        </View>

        <Text style={styles.vsText}>VS</Text>

        <View style={styles.jugador}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.jugador2_nombre?.charAt(0) || '?'}
            </Text>
          </View>
          <Text style={styles.jugadorNombre}>{item.jugador2_nombre}</Text>
          {item.ganador_final === item.jugador2_id && (
            <Text style={styles.winnerBadge}>🏆</Text>
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        {item.tieneResultado ? (
          <Text style={styles.finalizadoText}>
            {item.empate ? 'Empate' : 'Finalizado'}
          </Text>
        ) : (
          <TouchableOpacity
            style={styles.reportarButton}
            onPress={() => handleReportar(item)}
          >
            <Text style={styles.reportarButtonText}>Reportar resultado</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando tus partidas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'pendientes' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('pendientes')}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === 'pendientes' && styles.filterTextActive,
            ]}
          >
            Pendientes ({partidasPendientes.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'finalizadas' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter('finalizadas')}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === 'finalizadas' && styles.filterTextActive,
            ]}
          >
            Finalizadas ({partidasFinalizadas.length})
          </Text>
        </TouchableOpacity>
      </View>

      {partidasMostradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {selectedFilter === 'pendientes'
              ? 'No tienes partidas pendientes en la ronda actual'
              : 'No tienes partidas finalizadas en la ronda actual'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={partidasMostradas}
          keyExtractor={(item) => item.id}
          renderItem={renderPartida}
          contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.darkGray,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: colors.gray,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingVertical: 8,
  },
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  torneoNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  rondaText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '500',
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
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  reportarButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reportarButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  finalizadoText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
  },
});

export default MisPartidasScreen;