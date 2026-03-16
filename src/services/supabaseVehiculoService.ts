import { supabase } from '../config/supabase';
import { Vehiculo, VehiculoFormData } from '../types';
import { decode } from 'base64-arraybuffer';

export const SupabaseVehiculoService = {
  /**
   *  OBTENER TODOS LOS VEHÍCULOS
   */
  async getVehiculos(): Promise<Vehiculo[]> {
    try {
      console.log('Obteniendo todos los vehículos...');

      const { data, error } = await supabase
        .from('vehiculo')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;

      const count = data?.length || 0;
      console.log(`${count} vehículos obtenidos`);
      return data || [];
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      return [];
    }
  },

  /**
   * OBTENER VEHÍCULO POR ID
   */
  async getVehiculoById(id: string): Promise<Vehiculo | null> {
    try {
      console.log(`Obteniendo vehículo: ${id}`);

      const { data, error } = await supabase
        .from('vehiculo')
        .select('*')
        .eq('id_vehiculo', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        console.log('Vehículo obtenido correctamente');
      }
      return data || null;
    } catch (error) {
      console.error('Error al obtener vehículo:', error);
      return null;
    }
  },

  /**
   * OBTENER IMÁGENES DEL VEHÍCULO
   */
  async getImagenesVehiculo(vehiculoId: string): Promise<string[]> {
    try {
      console.log(`Obteniendo imágenes...`);

      const { data, error } = await supabase
        .from('vehiculo_imagenes')
        .select('imagen')
        .eq('id_vehiculo', vehiculoId);

      if (error) throw error;

      const urls = (data || []).map((img) => {
        const { data: urlData } = supabase.storage
          .from('ad-motors-images')
          .getPublicUrl(img.imagen);
        return urlData.publicUrl;
      });

      console.log(`${urls.length} imágenes obtenidas`);
      return urls;
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
      return [];
    }
  },

  /**
   * CREAR VEHÍCULO CON IMÁGENES
   */
  async createVehiculo(formData: VehiculoFormData): Promise<string> {
    try {
      const vehiculoId = `v-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      console.log(`Creando vehículo: ${vehiculoId}`);

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
            color: formData.color || null,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      console.log(`Vehículo creado: ${vehiculoId}`);

      if (formData.imagenes && formData.imagenes.length > 0) {
        await this.subirImagenesBase64(vehiculoId, formData.imagenes);
      }

      return vehiculoId;
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      throw error;
    }
  },

  /**
   * ACTUALIZAR VEHÍCULO
   */
  async updateVehiculo(id: string, formData: VehiculoFormData): Promise<void> {
    try {
      console.log(`Actualizando vehículo: ${id}`);

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
        .eq('id_vehiculo', id);

      if (error) throw error;

      console.log('Vehículo actualizado correctamente');

      if (formData.imagenes && formData.imagenes.length > 0) {
        await this.subirImagenesBase64(id, formData.imagenes);
      }
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      throw error;
    }
  },

  /**
   * SUBIR IMÁGENES CON BASE64
   */
  async subirImagenesBase64(vehiculoId: string, imagenes: string[]): Promise<void> {
    try {
      console.log(`⬆️ Subiendo ${imagenes.length} imagen(es)...`);

      let subidosExitosos = 0;
      let errores = 0;

      for (let i = 0; i < imagenes.length; i++) {
        const base64Data = imagenes[i];

        try {
          console.log(`Procesando imagen ${i + 1}/${imagenes.length}...`);

          if (base64Data.startsWith('http')) {
            console.log('⏭️ URL detectada, saltando...');
            continue;
          }

          const fileName = `${vehiculoId}-${Date.now()}-${i}.jpg`;

          const { error: uploadError } = await supabase.storage
            .from('ad-motors-images')
            .upload(fileName, decode(base64Data), {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (uploadError) {
            console.error(`Error al subir a Storage:`, uploadError.message);
            errores++;
            continue;
          }

          console.log(`Imagen subida: ${fileName}`);

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
            console.error(`Error al registrar en BD:`, dbError.message);
            errores++;
            continue;
          }

          console.log('Imagen registrada en base de datos');
          subidosExitosos++;
        } catch (itemError) {
          console.error(`❌ Error procesando imagen ${i}:`, itemError);
          errores++;
        }
      }

      console.log(`RESUMEN: ${subidosExitosos} exitosas, ${errores} errores`);
    } catch (error) {
      console.error('Error general en subirImagenesBase64:', error);
    }
  },

  /**
   * ELIMINAR VEHÍCULO Y SUS IMÁGENES
   */
  async deleteVehiculo(id: string): Promise<void> {
    try {
      console.log(`Eliminando vehículo: ${id}`);

      const { data: imgs } = await supabase
        .from('vehiculo_imagenes')
        .select('imagen')
        .eq('id_vehiculo', id);

      if (imgs && imgs.length > 0) {
        console.log(`Eliminando ${imgs.length} imágenes del Storage...`);
        await supabase.storage
          .from('ad-motors-images')
          .remove(imgs.map((i) => i.imagen));
      }

      const { error } = await supabase
        .from('vehiculo')
        .delete()
        .eq('id_vehiculo', id);

      if (error) throw error;

      console.log('Vehículo eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      throw error;
    }
  },

  /**
   * VERIFICAR CONEXIÓN A SUPABASE
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('Probando conexión a Supabase...');

      const { error } = await supabase
        .from('vehiculo')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Error de conexión:', error);
        return false;
      }

      console.log('Conexión exitosa a Supabase');
      return true;
    } catch (error) {
      console.error('Error en test de conexión:', error);
      return false;
    }
  },
};