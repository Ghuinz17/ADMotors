// src/services/supabaseVehiculoService.ts
// ✅ iOS ONLY - Base64 Directo

import { supabase } from '../config/supabase';
import { Vehiculo, VehiculoFormData } from '../types';
import { AppStorage } from '../utils/storage';
import { decode } from 'base64-arraybuffer';
import { Platform } from 'react-native';

export const SupabaseVehiculoService = {
  /**
   * 📱 OBTENER TODOS LOS VEHÍCULOS
   */
  async getVehiculos(): Promise<Vehiculo[]> {
    try {
      const deviceId = await AppStorage.getDeviceId();
      console.log('🔍 Buscando vehículos para el Device ID:', deviceId);

      const { data, error } = await supabase
        .from('vehiculo')
        .select('*')
        .eq('device_id', deviceId)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;

      const count = data?.length || 0;
      console.log(`✅ ${count} vehículos obtenidos`);
      return data || [];
    } catch (error) {
      console.error('❌ Error al obtener vehículos:', error);
      return [];
    }
  },

  /**
   * 📱 OBTENER VEHÍCULO POR ID
   */
  async getVehiculoById(id: string): Promise<Vehiculo | null> {
    try {
      const deviceId = await AppStorage.getDeviceId();
      console.log(`📱 Obteniendo vehículo: ${id}`);

      const { data, error } = await supabase
        .from('vehiculo')
        .select('*')
        .eq('id_vehiculo', id)
        .eq('device_id', deviceId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        console.log('✅ Vehículo obtenido correctamente');
      }
      return data || null;
    } catch (error) {
      console.error('❌ Error al obtener vehículo:', error);
      return null;
    }
  },

  /**
   * 🖼️ OBTENER IMÁGENES DEL VEHÍCULO
   */
  async getImagenesVehiculo(vehiculoId: string): Promise<string[]> {
    try {
      console.log(`🖼️ Obteniendo imágenes...`);

      const { data, error } = await supabase
        .from('vehiculo_imagenes')
        .select('imagen')
        .eq('id_vehiculo', vehiculoId);

      if (error) throw error;

      // Generar URLs públicas para Storage
      const urls = (data || []).map((img) => {
        const { data: urlData } = supabase.storage
          .from('ad-motors-images')
          .getPublicUrl(img.imagen);
        return urlData.publicUrl;
      });

      console.log(`✅ ${urls.length} imágenes obtenidas`);
      return urls;
    } catch (error) {
      console.error('❌ Error al obtener imágenes:', error);
      return [];
    }
  },

  /**
   * ➕ CREAR VEHÍCULO CON IMÁGENES
   */
  async createVehiculo(formData: VehiculoFormData): Promise<string> {
    try {
      const deviceId = await AppStorage.getDeviceId();
      const vehiculoId = `v-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      console.log(`📝 Creando vehículo: ${vehiculoId}`);

      // 1️⃣ CREAR VEHÍCULO EN BASE DE DATOS
      const { data, error } = await supabase
        .from('vehiculo')
        .insert([
          {
            id_vehiculo: vehiculoId,
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
          },
        ])
        .select();

      if (error) throw error;

      console.log(`✅ Vehículo creado: ${vehiculoId}`);

      // 2️⃣ SUBIR IMÁGENES CON BASE64
      if (formData.imagenes && formData.imagenes.length > 0) {
        await this.subirImagenesBase64(vehiculoId, formData.imagenes);
      }

      return vehiculoId;
    } catch (error) {
      console.error('❌ Error al crear vehículo:', error);
      throw error;
    }
  },

  /**
   * ✏️ ACTUALIZAR VEHÍCULO
   */
  async updateVehiculo(id: string, formData: VehiculoFormData): Promise<void> {
    try {
      const deviceId = await AppStorage.getDeviceId();
      console.log(`✏️ Actualizando vehículo: ${id}`);

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
        .eq('device_id', deviceId);

      if (error) throw error;

      console.log('✅ Vehículo actualizado correctamente');

      // Subir nuevas imágenes si existen
      if (formData.imagenes && formData.imagenes.length > 0) {
        await this.subirImagenesBase64(id, formData.imagenes);
      }
    } catch (error) {
      console.error('❌ Error al actualizar vehículo:', error);
      throw error;
    }
  },

  /**
   * 📤 SUBIR IMÁGENES CON BASE64 (MÉTODO PRINCIPAL)
   * ✅ Recibe los base64 directamente desde formData.imagenes
   */
  async subirImagenesBase64(vehiculoId: string, imagenes: string[]): Promise<void> {
    try {
      const deviceId = await AppStorage.getDeviceId();
      console.log(`⬆️ Subiendo ${imagenes.length} imagen(es) con Base64...`);

      let subidosExitosos = 0;
      let errores = 0;

      for (let i = 0; i < imagenes.length; i++) {
        const base64Data = imagenes[i];

        try {
          console.log(`📤 Procesando imagen ${i + 1}/${imagenes.length}...`);

          // ✅ SALTAR SI ES URL (ya está subida)
          if (base64Data.startsWith('http')) {
            console.log('⏭️ URL detectada, saltando...');
            continue;
          }

          // Generar nombre del archivo
          const fileName = `${deviceId}/${vehiculoId}-${Date.now()}-${i}.jpg`;

          console.log(`📤 Subiendo a Storage: ${fileName}`);

          // ✅ DECODIFICAR BASE64 Y SUBIR A STORAGE
          const { error: uploadError } = await supabase.storage
            .from('ad-motors-images')
            .upload(fileName, decode(base64Data), {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (uploadError) {
            console.error(`❌ Error al subir a Storage:`, uploadError.message);
            errores++;
            continue;
          }

          console.log(`✅ Imagen subida a Storage: ${fileName}`);

          // ✅ REGISTRAR EN TABLA vehiculo_imagenes
          console.log('📝 Registrando en tabla vehiculo_imagenes...');
          const { error: dbError } = await supabase
            .from('vehiculo_imagenes')
            .insert([
              {
                id_vehiculo: vehiculoId,
                imagen: fileName,
                created_at: new Date().toISOString(),
              },
            ]);

          if (dbError) {
            console.error(`❌ Error al registrar en BD:`, dbError.message);
            errores++;
            continue;
          }

          console.log('✅ Imagen registrada en base de datos');
          subidosExitosos++;
        } catch (itemError) {
          console.error(`❌ Error procesando imagen ${i}:`, itemError);
          errores++;
        }
      }

      console.log(
        `📊 RESUMEN UPLOAD: ${subidosExitosos} exitosas, ${errores} errores`
      );
    } catch (error) {
      console.error('❌ Error general en subirImagenesBase64:', error);
    }
  },

  /**
   * 🗑️ ELIMINAR VEHÍCULO Y SUS IMÁGENES
   */
  async deleteVehiculo(id: string): Promise<void> {
    try {
      const deviceId = await AppStorage.getDeviceId();
      console.log(`🗑️ Eliminando vehículo: ${id}`);

      // Obtener imágenes
      const { data: imgs } = await supabase
        .from('vehiculo_imagenes')
        .select('imagen')
        .eq('id_vehiculo', id);

      // Eliminar del Storage
      if (imgs && imgs.length > 0) {
        console.log(`🗑️ Eliminando ${imgs.length} imágenes del Storage...`);
        await supabase.storage
          .from('ad-motors-images')
          .remove(imgs.map((i) => i.imagen));
      }

      // Eliminar de base de datos
      console.log('🗑️ Eliminando registro de base de datos...');
      const { error } = await supabase
        .from('vehiculo')
        .delete()
        .eq('id_vehiculo', id)
        .eq('device_id', deviceId);

      if (error) throw error;

      console.log('✅ Vehículo eliminado correctamente');
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      throw error;
    }
  },

  /**
   * 🔗 VERIFICAR CONEXIÓN A SUPABASE
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔗 Probando conexión a Supabase...');

      const { error } = await supabase
        .from('vehiculo')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Error de conexión:', error);
        return false;
      }

      console.log('✅ Conexión exitosa a Supabase');
      return true;
    } catch (error) {
      console.error('❌ Error en test de conexión:', error);
      return false;
    }
  },
};