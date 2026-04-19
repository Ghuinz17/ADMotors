
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { RootStackParamList } from './src/types';

import HomeScreen           from './src/screens/HomeScreen';
import ListVehiculosScreen  from './src/screens/ListVehiculosScreen';
import AnadirVehiculoScreen from './src/screens/AnadirVehiculoScreen';
import EditarVehiculoScreen from './src/screens/EditarVehiculoScreen';
import DetalleVehiculoScreen from './src/screens/DetalleVehiculoScreen';
import SolicitudesScreen    from './src/screens/SolicitudesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home"            component={HomeScreen} />
          <Stack.Screen name="ListVehiculos"   component={ListVehiculosScreen} />
          <Stack.Screen name="AnadirVehiculo"  component={AnadirVehiculoScreen} />
          <Stack.Screen name="EditarVehiculo"  component={EditarVehiculoScreen} />
          <Stack.Screen name="DetalleVehiculo" component={DetalleVehiculoScreen} />
          <Stack.Screen name="Solicitudes"     component={SolicitudesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}