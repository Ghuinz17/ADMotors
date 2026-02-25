// src/services/supabaseVehiculoService.ts
import { supabase } from '../config/supabase';
import { AppStorage } from '../utils/storage';
import { decode } from 'base64-arraybuffer';

export const SupabaseVehiculoService = {
  async getVehiculos() {
    try {
      const deviceId = await AppStorage.getDeviceId();
      console.log("🔍 Buscando vehículos para el Device ID:", deviceId);

      const { data, error } = await supabase
        .from('vehiculo')
        .select('*')
        .eq('device_id', deviceId)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error al obtener vehículos:', error);
      return [];
    }
  },

  async crearVehiculo(formData: any, imageBase64: string) {
    try {
      const deviceId = await AppStorage.getDeviceId();
      const vehiculoId = Math.random().toString(36).substring(2, 11);
      const fileName = `${deviceId}/${vehiculoId}.jpg`;

      // Subir imagen decodificada
      const { error: uploadError } = await supabase.storage
        .from('ad-motors-images')
        .upload(fileName, decode(imageBase64), {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Guardar en Base de Datos
      const { data, error } = await supabase
        .from('vehiculo')
        .insert([{
          ...formData,
          id_vehiculo: vehiculoId,
          device_id: deviceId,
          imagen_url: fileName,
          fecha_creacion: new Date().toISOString()
        }]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error al crear vehículo:', error);
      throw error;
    }
  }
};