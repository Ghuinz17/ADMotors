
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/homeScreen';
import ListVehiculosScreen from './src/screens/listVehiculosScreen';
import AnadirVehiculoScreen from './src/screens/anadirVehiculoScreen';
import DetalleVehiculoScreen from './src/screens/detalleVehiculoScreen';
import EditarVehiculoScreen from './src/screens/editarVehiculoScreen';
import { RootStackParamList } from './src/types';
import { supabase } from './src/config/supabase';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {

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