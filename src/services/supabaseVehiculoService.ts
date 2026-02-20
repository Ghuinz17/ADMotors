// src/services/supabaseVehiculoService.ts
import { supabase } from '../config/supabase';
import { Vehiculo, VehiculoFormData } from '../types';
import { AppStorage } from '../utils/storage';
import { ImageService } from './imageService';
import { decode } from 'base64-arraybuffer';

export const SupabaseVehiculoService = {
  // --- Lectura de Datos ---
  async getVehiculos(): Promise<Vehiculo[]> {
    try {
      const deviceId = await AppStorage.getDeviceId();
      const { data, error } = await supabase
        .from('vehiculo')
        .select('*')
        .eq('device_id', deviceId)
        .order('fecha_creacion', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener vehiculos:', error);
      return [];
    }
  },

  async getVehiculoById(id: string): Promise<Vehiculo | null> {
    try {
      const deviceId = await AppStorage.getDeviceId();
      const { data, error } = await supabase
        .from('vehiculo')
        .select('*')
        .eq('id_vehiculo', id)
        .eq('device_id', deviceId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener vehiculo:', error);
      return null;
    }
  },

  async getImagenesVehiculo(vehiculoId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('vehiculo_imagenes')
        .select('imagen')
        .eq('id_vehiculo', vehiculoId);
      if (error) throw error;
      return (data || []).map(img =>
        supabase.storage.from('ad-motors-images').getPublicUrl(img.imagen).data.publicUrl
      );
    } catch (error) {
      console.error('Error al obtener imagenes:', error);
      return [];
    }
  },

  // --- Escritura y Actualización ---
  async createVehiculo(formData: VehiculoFormData): Promise<string> {
    try {
      const deviceId = await AppStorage.getDeviceId();
      const { data, error } = await supabase.from('vehiculo').insert([{
        marca_modelo: formData.marca_modelo,
        descripcion: formData.descripcion || null,
        precio: parseFloat(formData.precio),
        ano_fabricacion: parseInt(formData.ano_fabricacion, 10),
        tipo_combustible: formData.tipo_combustible,
        kilometraje: parseInt(formData.kilometraje, 10),
        device_id: deviceId,
        color: formData.color || null,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
      }]).select();

      if (error) throw error;
      const vehiculoId = data[0].id_vehiculo;
      if (formData.imagenes?.length) await this.subirImagenes(vehiculoId, formData.imagenes);
      return vehiculoId;
    } catch (error) {
      console.error('Error al crear vehiculo:', error);
      throw error;
    }
  },

  async updateVehiculo(id: string, formData: VehiculoFormData): Promise<void> {
    try {
      const deviceId = await AppStorage.getDeviceId(); //
      const updateData = {
        marca_modelo: formData.marca_modelo,
        descripcion: formData.descripcion || null,
        precio: parseFloat(formData.precio),
        ano_fabricacion: parseInt(formData.ano_fabricacion, 10),
        tipo_combustible: formData.tipo_combustible,
        kilometraje: parseInt(formData.kilometraje, 10),
        color: formData.color || null,
        fecha_actualizacion: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('vehiculo')
        .update(updateData)
        .eq('id_vehiculo', id)
        .eq('device_id', deviceId); //

      if (error) throw error;

      if (formData.imagenes && formData.imagenes.length > 0) {
        await this.subirImagenes(id, formData.imagenes); //
      }
    } catch (error) {
      console.error('Error al actualizar vehiculo:', error);
      throw error;
    }
  },

  // --- Lógica de Imágenes ---
  async subirImagenes(vehiculoId: string, imagenes: string[]): Promise<void> {
    try {
      const deviceId = await AppStorage.getDeviceId();

      for (let i = 0; i < imagenes.length; i++) {
        const imageUri = imagenes[i];
        // Saltamos si es una URL de internet (ya subida)
        if (imageUri.startsWith('http')) continue;

        console.log(`Procesando imagen local: ${imageUri}`);
        const base64Data = await ImageService.uriToBase64(imageUri);

        if (base64Data) {
          const format = ImageService.detectImageFormat(imageUri);
          const fileName = ImageService.generateImageName(deviceId, vehiculoId, i, format);

          // SUBIDA: Decodificamos el base64 a ArrayBuffer
          const { error: uploadError } = await supabase.storage
            .from('ad-motors-images')
            .upload(fileName, decode(base64Data), {
              contentType: ImageService.getMimeType(format),
              upsert: true
            });

          if (uploadError) {
            console.error('Error subiendo al Storage:', uploadError.message);
            continue;
          }

          // REGISTRO EN TABLA: Importante para que aparezcan en el detalle
          await supabase.from('vehiculo_imagenes').insert([{
            id_vehiculo: vehiculoId,
            imagen: fileName,
            created_at: new Date().toISOString()
          }]);
        }
      }
    } catch (error) {
      console.error('Error general en subirImagenes:', error);
    }
  },
  // --- Borrado ---
  async deleteVehiculo(id: string): Promise<void> {
    try {
      const deviceId = await AppStorage.getDeviceId();
      const { data: imgs } = await supabase.from('vehiculo_imagenes').select('imagen').eq('id_vehiculo', id);
      if (imgs?.length) {
        await supabase.storage.from('ad-motors-images').remove(imgs.map(i => i.imagen));
      }
      await supabase.from('vehiculo').delete().eq('id_vehiculo', id).eq('device_id', deviceId);
    } catch (error) {
      console.error('Error al eliminar:', error);
      throw error;
    }
  }
};