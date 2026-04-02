import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { obtenerEventoActual } from '../utils/evento';

const StandingsScreen = () => {
  const { user } = useAuth();
  const [torneos, setTorneos] = useState([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
  const [eventoActual, setEventoActual] = useState(null);
  const [standings, setStandings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarTorneos();
  }, []);

  useEffect(() => {
    if (torneoSeleccionado) {
      cargarEventoYStandings();
    }
  }, [torneoSeleccionado]);

  const cargarTorneos = async () => {
    try {
      const { data, error } = await supabase
        .from('torneos')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) throw error;

      setTorneos(data || []);
      
      if (data && data.length > 0) {
        setTorneoSeleccionado(data[0]);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.log('Error al cargar torneos:', error);
      Alert.alert('Error', 'No se pudieron cargar los torneos');
      setIsLoading(false);
    }
  };

  const cargarEventoYStandings = async () => {
    if (!torneoSeleccionado) return;
    
    setIsLoading(true);
    try {
      const evento = await obtenerEventoActual(torneoSeleccionado.id);
      setEventoActual(evento);

      if (!evento) {
        setStandings([]);
        setIsLoading(false);
        return;
      }

      const { data: standingsData, error: standingsError } = await supabase
        .from('standings')
        .select('*')
        .eq('evento_id', evento.id)
        .order('posicion', { ascending: true });

      if (standingsError) throw standingsError;

      if (standingsData && standingsData.length > 0) {
        const playerIds = standingsData.map(s => s.player_id).filter(Boolean);
        
        let mapaNombres = {};
        if (playerIds.length > 0) {
          const { data: jugadores } = await supabase
            .from('jugadores')
            .select('player_id, nombre')
            .in('player_id', playerIds);
          
          mapaNombres = (jugadores || []).reduce((acc, j) => {
            acc[j.player_id] = j.nombre;
            return acc;
          }, {});
        }

        const standingsConNombres = standingsData.map(s => ({
          ...s,
          nombre: mapaNombres[s.player_id] || s.player_id,
        }));

        setStandings(standingsConNombres);
      } else {
        setStandings([]);
      }
    } catch (error) {
      console.log('Error al cargar standings:', error);
      Alert.alert('Error', 'No se pudieron cargar las clasificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStandingItem = ({ item, index }) => (
    <View style={[
      styles.standingRow,
      item.player_id === user?.player_id && styles.usuarioRow
    ]}>
      <View style={[styles.cell, styles.posicionCell]}>
        <Text style={[
          styles.posicionText,
          item.player_id === user?.player_id && styles.usuarioText
        ]}>
          {item.posicion}
        </Text>
      </View>
      <View style={[styles.cell, styles.nombreCell]}>
        <Text style={[
          styles.nombreText,
          item.player_id === user?.player_id && styles.usuarioText
        ]}>
          {item.nombre}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando clasificación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {torneos.length > 0 && (
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Torneo:</Text>
          <FlatList
            horizontal
            data={torneos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.torneoButton,
                  torneoSeleccionado?.id === item.id && styles.torneoButtonActive,
                ]}
                onPress={() => setTorneoSeleccionado(item)}
              >
                <Text
                  style={[
                    styles.torneoButtonText,
                    torneoSeleccionado?.id === item.id && styles.torneoButtonTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.torneosList}
          />
        </View>
      )}

      {eventoActual && (
        <View style={styles.eventoInfo}>
          <Text style={styles.eventoFecha}>
            Evento: {new Date(eventoActual.fecha).toLocaleDateString('es-MX')}
          </Text>
        </View>
      )}

      {standings.length > 0 ? (
        <>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.posicionCell]}>#</Text>
            <Text style={[styles.headerCell, styles.nombreCell]}>Jugador</Text>
          </View>

          <FlatList
            data={standings}
            keyExtractor={(item, index) => `${item.player_id}-${index}`}
            renderItem={renderStandingItem}
            contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              Clasificación del evento {new Date(eventoActual.fecha).toLocaleDateString('es-MX')}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {eventoActual 
              ? 'No hay clasificación disponible para este evento'
              : 'No hay evento activo para este torneo'}
          </Text>
        </View>
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
  selectorContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  torneosList: {
    paddingHorizontal: 12,
  },
  torneoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: colors.gray,
  },
  torneoButtonActive: {
    backgroundColor: colors.secondary,
  },
  torneoButtonText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  torneoButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  eventoInfo: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  eventoFecha: {
    fontSize: 12,
    color: colors.darkGray,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  headerCell: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  standingRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  usuarioRow: {
    backgroundColor: colors.secondary + '20',
  },
  cell: {
    flex: 1,
  },
  posicionCell: {
    flex: 0.5,
  },
  nombreCell: {
    flex: 3,
  },
  posicionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  nombreText: {
    fontSize: 14,
    color: colors.black,
  },
  usuarioText: {
    color: colors.secondary,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 16,
  },
  footerInfo: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.darkGray,
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

export default StandingsScreen;