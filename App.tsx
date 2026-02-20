
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
//import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import ListVehiculosScreen from './src/screens/ListVehiculosScreen';
import AnadirVehiculoScreen from './src/screens/AnadirVehiculoScreen';
import DetalleVehiculoScreen from './src/screens/DetalleVehiculoScreen';
import EditarVehiculoScreen from './src/screens/EditarVehiculoScreen';
import { RootStackParamList } from './src/types';
import { supabase } from './src/config/supabase';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
 /** // Inicializar autenticacion al cargar la app
  useEffect(() => {
    signInAnonymously();
  }, []);

  
   * Loguearse como usuario anonimo
   * Esto es necesario para que el usuario pueda:
   * - Subir imagenes a Storage
   * - Guardar datos en las tablas
 
  async function signInAnonymously() {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('Error de autenticacion Supabase:', error.message);
      } else {
        console.log('✅ Usuario autenticado anonimamente:', data.user?.id);
      }
    } catch (error) {
      console.error('Error al autenticar:', error);
    }
  }
  */
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            name="ListVehiculos"
            component={ListVehiculosScreen}
          />
          <Stack.Screen
            name="AnadirVehiculo"
            component={AnadirVehiculoScreen}
          />
          <Stack.Screen
            name="DetalleVehiculo"
            component={DetalleVehiculoScreen}
          />
          <Stack.Screen
            name="EditarVehiculo"
            component={EditarVehiculoScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}