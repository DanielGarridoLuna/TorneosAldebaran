import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { useAuth } from '../context/AuthContext';

// Pantallas de autenticación
import LoginScreen from '../screens/LoginScreen';
import RegistroScreen from '../screens/RegistroScreen';

// Pantallas principales
import TorneosScreen from '../screens/TorneosScreen';
import DetalleTorneoScreen from '../screens/DetalleTorneoScreen';
import ReportarResultadoScreen from '../screens/ReportarResultadoScreen';
import MisPartidasScreen from '../screens/MisPartidasScreen';
import StandingsScreen from '../screens/StandingsScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack de autenticación
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registro" component={RegistroScreen} />
    </Stack.Navigator>
  );
};

// Stack de Torneos
const TorneosStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="TorneosList" component={TorneosScreen} options={{ title: 'Torneos' }} />
      <Stack.Screen name="DetalleTorneo" component={DetalleTorneoScreen} options={{ title: 'Detalle del Torneo' }} />
      <Stack.Screen name="ReportarResultado" component={ReportarResultadoScreen} options={{ title: 'Reportar Resultado' }} />
    </Stack.Navigator>
  );
};

// Stack de Mis Partidas
const MisPartidasStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="MisPartidasList" component={MisPartidasScreen} options={{ title: 'Mis Partidas' }} />
      <Stack.Screen name="ReportarResultado" component={ReportarResultadoScreen} options={{ title: 'Reportar Resultado' }} />
    </Stack.Navigator>
  );
};

// Stack de Standings
const StandingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="StandingsList" component={StandingsScreen} options={{ title: 'Clasificación' }} />
    </Stack.Navigator>
  );
};

// Stack de Perfil
const PerfilStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="PerfilMain" component={PerfilScreen} options={{ title: 'Mi Perfil' }} />
    </Stack.Navigator>
  );
};

// Tabs principales
const MainTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Torneos') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Mis Partidas') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Standings') {
            iconName = focused ? 'podium' : 'podium-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.darkGray,
     tabBarStyle: {
  backgroundColor: colors.white,
  borderTopWidth: 1,
  borderTopColor: colors.gray,
  height: 60,
  paddingBottom: 8,
  paddingTop: 8,
},
        headerShown: false,
      })}
    >
      <Tab.Screen name="Torneos" component={TorneosStack} />
      <Tab.Screen name="Mis Partidas" component={MisPartidasStack} />
      <Tab.Screen name="Standings" component={StandingsStack} />
      <Tab.Screen name="Perfil" component={PerfilStack} />
    </Tab.Navigator>
  );
};

// Navegador principal
const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;