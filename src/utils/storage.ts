// src/utils/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sistema de almacenamiento local de la aplicación
 * Gestiona: Device ID, caché local, preferencias, etc.
 */

const DEVICE_ID_KEY = 'APP_DEVICE_ID';
const VEHICULOS_CACHE_KEY = 'VEHICULOS_CACHE';
const USER_PREFERENCES_KEY = 'USER_PREFERENCES';
const LAST_SYNC_KEY = 'LAST_SYNC';

/**
 * AppStorage - Utilidades de almacenamiento
 */
export const AppStorage = {
  /**
   * Obtener o crear Device ID único para el dispositivo
   */
  async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      
      if (!deviceId) {
        deviceId = `device-${uuidv4()}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
        console.log('✅ Device ID creado:', deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Error al obtener Device ID:', error);
      return `device-${uuidv4()}`;
    }
  },

  /**
   * Guardar datos en AsyncStorage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
      console.log(`✅ Datos guardados: ${key}`);
    } catch (error) {
      console.error(`Error al guardar ${key}:`, error);
    }
  },

  /**
   * Obtener datos de AsyncStorage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error al obtener ${key}:`, error);
      return null;
    }
  },

  /**
   * Guardar JSON
   */
  async setJSON(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      console.log(`✅ JSON guardado: ${key}`);
    } catch (error) {
      console.error(`Error al guardar JSON ${key}:`, error);
    }
  },

  /**
   * Obtener JSON
   */
  async getJSON(key: string): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error al obtener JSON ${key}:`, error);
      return null;
    }
  },

  /**
   * Eliminar datos
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`✅ Datos eliminados: ${key}`);
    } catch (error) {
      console.error(`Error al eliminar ${key}:`, error);
    }
  },

  /**
   * Limpiar toda la base de datos local
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('✅ Storage limpiado completamente');
    } catch (error) {
      console.error('Error al limpiar storage:', error);
    }
  },

  /**
   * Obtener todas las claves
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return Array.isArray(keys) ? keys : [];
    } catch (error) {
      console.error('Error al obtener todas las claves:', error);
      return [];
    }
  },

  /**
   * Guardar caché de vehículos
   */
  async setVehiculosCache(vehiculos: any[]): Promise<void> {
    await this.setJSON(VEHICULOS_CACHE_KEY, {
      data: vehiculos,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Obtener caché de vehículos
   */
  async getVehiculosCache(): Promise<any | null> {
    return await this.getJSON(VEHICULOS_CACHE_KEY);
  },

  /**
   * Guardar preferencias del usuario
   */
  async setUserPreferences(preferences: any): Promise<void> {
    await this.setJSON(USER_PREFERENCES_KEY, preferences);
  },

  /**
   * Obtener preferencias del usuario
   */
  async getUserPreferences(): Promise<any | null> {
    return await this.getJSON(USER_PREFERENCES_KEY);
  },

  /**
   * Guardar timestamp del último sync
   */
  async setLastSyncTime(timestamp: string): Promise<void> {
    await this.setItem(LAST_SYNC_KEY, timestamp);
  },

  /**
   * Obtener timestamp del último sync
   */
  async getLastSyncTime(): Promise<string | null> {
    return await this.getItem(LAST_SYNC_KEY);
  },

  /**
   * Verificar si es necesario sincronizar
   */
  async shouldSync(minutosTranscurridos: number = 5): Promise<boolean> {
    try {
      const lastSync = await this.getLastSyncTime();
      
      if (!lastSync) {
        return true; // Nunca se sincronizó
      }

      const lastSyncTime = new Date(lastSync).getTime();
      const ahora = new Date().getTime();
      const diferencia = (ahora - lastSyncTime) / (1000 * 60); // en minutos

      return diferencia >= minutosTranscurridos;
    } catch (error) {
      console.error('Error al verificar sync:', error);
      return true;
    }
  },
};

/**
 * Funciones auxiliares (compatibilidad)
 */
export const getVehiculos = async () => {
  return AppStorage.getVehiculosCache();
};

export const getDeviceId = async () => {
  return AppStorage.getDeviceId();
};