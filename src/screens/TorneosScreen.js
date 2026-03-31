import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { obtenerEventoActual } from '../utils/evento';

const TorneosScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [torneos, setTorneos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registroAbierto, setRegistroAbierto] = useState(false);
  const [selectedTorneo, setSelectedTorneo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [inscribiendo, setInscribiendo] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        cargarTorneos(),
        cargarEstadoRegistro(),
      ]);
    } catch (error) {
      console.log('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarTorneos = async () => {
    try {
      const { data, error } = await supabase
        .from('torneos')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) throw error;

      if (data && user?.id) {
        const torneosConInscripcion = await Promise.all(
          data.map(async (torneo) => {
            // Obtener evento actual usando la misma función que la webapp
            const eventoActual = await obtenerEventoActual(torneo.id);
            
            let inscrito = false;
            if (eventoActual?.id) {
              const { data: inscripcion } = await supabase
                .from('inscripciones')
                .select('id')
                .eq('jugador_id', user.id)
                .eq('torneo_id', torneo.id)
                .eq('evento_id', eventoActual.id)
                .maybeSingle();
              
              inscrito = !!inscripcion;
            }
            
            return {
              ...torneo,
              inscrito,
              eventoActualId: eventoActual?.id,
            };
          })
        );
        setTorneos(torneosConInscripcion);
      } else {
        setTorneos(data || []);
      }
    } catch (error) {
      console.log('Error al cargar torneos:', error);
      Alert.alert('Error', 'No se pudieron cargar los torneos');
    }
  };

  const cargarEstadoRegistro = async () => {
    try {
      const { data, error } = await supabase
        .from('torneo_estado')
        .select('registro_abierto')
        .single();

      if (error) throw error;
      setRegistroAbierto(data?.registro_abierto || false);
    } catch (error) {
      console.log('Error al cargar estado:', error);
    }
  };

  const handleInscribir = (torneo) => {
    if (!registroAbierto) {
      Alert.alert('Registro cerrado', 'El registro para torneos está cerrado en este momento');
      return;
    }
    
    if (!torneo.eventoActualId) {
      Alert.alert('Sin evento activo', 'No hay un evento activo para este torneo. Contacta al administrador.');
      return;
    }
    
    setSelectedTorneo(torneo);
    setShowModal(true);
  };

  const confirmarInscripcion = async () => {
    if (!selectedTorneo) return;
    
    setInscribiendo(true);
    
    try {
      const today = new Date().toLocaleDateString('en-CA');
      
      // Obtener evento actual nuevamente para confirmar
      const eventoActual = await obtenerEventoActual(selectedTorneo.id);
      
      if (!eventoActual?.id) {
        Alert.alert('Error', 'No hay evento activo para este torneo');
        setShowModal(false);
        setInscribiendo(false);
        return;
      }
      
      // Verificar si ya está inscrito
      const { data: existe } = await supabase
        .from('inscripciones')
        .select('id')
        .eq('jugador_id', user.id)
        .eq('torneo_id', selectedTorneo.id)
        .eq('evento_id', eventoActual.id)
        .maybeSingle();
      
      if (existe) {
        Alert.alert('Ya inscrito', 'Ya estás inscrito en este torneo');
        setShowModal(false);
        setInscribiendo(false);
        return;
      }
      
      // Obtener estado de registro abierto
      const { data: estado } = await supabase
        .from('torneo_estado')
        .select('registro_abierto')
        .single();
      
      const late = !estado?.registro_abierto;
      
      // Crear inscripción
      const { error } = await supabase
        .from('inscripciones')
        .insert({
          jugador_id: user.id,
          torneo_id: selectedTorneo.id,
          evento_id: eventoActual.id,
          fecha: today,
          pagado: false,
          late: late,
          checkin: false,
        });
      
      if (error) throw error;
      
      Alert.alert('¡Inscripción exitosa!', `Te has inscrito a ${selectedTorneo.nombre}`);
      
      // Actualizar estado local
      setTorneos(prev => 
        prev.map(t => 
          t.id === selectedTorneo.id 
            ? { ...t, inscrito: true }
            : t
        )
      );
      
      setShowModal(false);
    } catch (error) {
      console.log('Error al inscribir:', error);
      Alert.alert('Error', 'No se pudo completar la inscripción');
    } finally {
      setInscribiendo(false);
    }
  };

  const handlePressTorneo = (torneo) => {
    navigation.navigate('DetalleTorneo', { torneoId: torneo.id });
  };

  const renderTorneo = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePressTorneo(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        {item.inscrito && (
          <View style={styles.inscritoBadge}>
            <Text style={styles.inscritoText}>Inscrito</Text>
          </View>
        )}
      </View>
      
      {item.descripcion && (
        <Text style={styles.descripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>
      )}
      
      <View style={styles.cardFooter}>
        {!item.inscrito && registroAbierto && item.eventoActualId ? (
          <TouchableOpacity
            style={styles.inscribirButton}
            onPress={() => handleInscribir(item)}
          >
            <Text style={styles.inscribirButtonText}>Inscribirse</Text>
          </TouchableOpacity>
        ) : item.inscrito ? (
          <Text style={styles.yaInscritoText}>✓ Ya inscrito</Text>
        ) : !registroAbierto ? (
          <Text style={styles.cerradoText}>Registro cerrado</Text>
        ) : !item.eventoActualId ? (
          <Text style={styles.sinEventoText}>Sin evento activo</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando torneos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Torneos Activos</Text>
        <View style={[styles.estadoBadge, registroAbierto ? styles.estadoAbierto : styles.estadoCerrado]}>
          <Text style={styles.estadoText}>
            Registro: {registroAbierto ? 'Abierto' : 'Cerrado'}
          </Text>
        </View>
      </View>

      {torneos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay torneos activos</Text>
        </View>
      ) : (
        <FlatList
          data={torneos}
          keyExtractor={(item) => item.id}
          renderItem={renderTorneo}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de confirmación */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar inscripción</Text>
            <Text style={styles.modalText}>
              ¿Deseas inscribirte al torneo "{selectedTorneo?.nombre}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowModal(false)}
                disabled={inscribiendo}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmarInscripcion}
                disabled={inscribiendo}
              >
                {inscribiendo ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  estadoAbierto: {
    backgroundColor: colors.success,
  },
  estadoCerrado: {
    backgroundColor: colors.error,
  },
  estadoText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 20,
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
    marginBottom: 8,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
  },
  inscritoBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  inscritoText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  descripcion: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 12,
    lineHeight: 18,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  inscribirButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  inscribirButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  yaInscritoText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '500',
  },
  cerradoText: {
    color: colors.error,
    fontSize: 13,
  },
  sinEventoText: {
    color: colors.warning,
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGray,
  },
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
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
  modalButtonConfirm: {
    backgroundColor: colors.secondary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default TorneosScreen;