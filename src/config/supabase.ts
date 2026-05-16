import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mgbftvxlqinxrthswqih.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nYmZ0dnhscWlueHJ0aHN3cWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjQyNDQsImV4cCI6MjA4NDYwMDI0NH0.f6c8-_Yc59Y2D3JNk5PV6rxYFBHxg0nT9ng6IElbuBU';

// Crear cliente de Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  // Opciones de realtime
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Función para probar la conexión
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('vehiculo')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Error de conexión a Supabase:', error);
      return false;
    }

    console.log('Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('Error al conectar con Supabase:', error);
    return false;
  }
};

// Función para obtener el estado de la sesión
export const getSessionStatus = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

