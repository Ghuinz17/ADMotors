import { supabase } from '../config/supabase';
import { Vehiculo, VehiculoFormData } from '../types';
import { decode } from 'base64-arraybuffer';

export const SupabaseVehiculoService = {

  // READ: Obtiene todos los vehículos ordenados por fecha de creación
  async getVehiculos(): Promise<Vehiculo[]> {
    try {
      const { data, error } = await supabase
        .from('vehiculo')
        .select('*')
        .order('fecha_creacion', { ascending: false });
      if (error) throw error;
      console.log(`${data?.length || 0} vehículos obtenidos`);
      return data || [];
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      return [];
    }
  },

  // READ: Obtiene un vehículo por su ID y devuelve null si no existe
  async getVehiculoById(id: string): Promise<Vehiculo | null> {
    try {
      const { data, error } = await supabase
        .from('vehiculo').select('*').eq('id_vehiculo', id).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error al obtener vehículo:', error);
      return null;
    }
  },

  // READ: Obtiene las URLs públicas de las imágenes de un vehículo 
  // Consulta vehiculo_imagenes y construye la URL pública desde Supabase Storage
  async getImagenesVehiculo(vehiculoId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('vehiculo_imagenes').select('imagen').eq('id_vehiculo', vehiculoId);
      if (error) throw error;
      return (data || []).map((img) => {
        const { data: urlData } = supabase.storage
          .from('ad-motors-images').getPublicUrl(img.imagen);
        return urlData.publicUrl;
      });
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
      return [];
    }
  },

  // CREATE
  // Devuelve el ID del vehículo creado
  async createVehiculo(formData: VehiculoFormData): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('vehiculo')
        .insert([{
          marca:               formData.marca,
          modelo:              formData.modelo,
          descripcion:         formData.descripcion || null,
          precio:              parseFloat(formData.precio),
          ano_fabricacion:     parseInt(formData.ano_fabricacion, 10),
          tipo_combustible:    formData.tipo_combustible,
          kilometraje:         parseInt(formData.kilometraje, 10),
          color:               formData.color || null,
          fecha_creacion:      new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString(),
        }])
        .select();
      if (error) throw error;
      const vehiculoId = data[0].id_vehiculo;
      console.log(`Vehículo creado: ${vehiculoId}`);
      if (formData.imagenes?.length > 0) {
        await this.subirImagenesBase64(vehiculoId, formData.imagenes);
      }
      return vehiculoId;
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      throw error;
    }
  },

  // UPDATE
  async updateVehiculo(id: string, formData: VehiculoFormData): Promise<void> {
    try {
      const { error } = await supabase
        .from('vehiculo')
        .update({
          marca:               formData.marca,
          modelo:              formData.modelo,
          descripcion:         formData.descripcion || null,
          precio:              parseFloat(formData.precio),
          ano_fabricacion:     parseInt(formData.ano_fabricacion, 10),
          tipo_combustible:    formData.tipo_combustible,
          kilometraje:         parseInt(formData.kilometraje, 10),
          color:               formData.color || null,
          fecha_actualizacion: new Date().toISOString(),
        })
        .eq('id_vehiculo', id);
      if (error) throw error;
      console.log('Vehículo actualizado');
      if (formData.imagenes?.length > 0) {
        await this.subirImagenesBase64(id, formData.imagenes);
      }
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      throw error;
    }
  },

  // Genera un nombre único por imagen y registra la referencia en vehiculo_imagenes
  // Las imágenes que ya sean URLs (http) se saltan automáticamente
  async subirImagenesBase64(vehiculoId: string, imagenes: string[]): Promise<void> {
    let ok = 0, err = 0;
    for (let i = 0; i < imagenes.length; i++) {
      try {
        if (imagenes[i].startsWith('http')) continue;
        const fileName = `${vehiculoId}-${Date.now()}-${i}.jpg`;
        const { error: upErr } = await supabase.storage
          .from('ad-motors-images')
          .upload(fileName, decode(imagenes[i]), { contentType: 'image/jpeg', upsert: true });
        if (upErr) { err++; continue; }
        const { error: dbErr } = await supabase.from('vehiculo_imagenes')
          .insert([{ id_vehiculo: vehiculoId, imagen: fileName, created_at: new Date().toISOString() }]);
        if (dbErr) { err++; continue; }
        ok++;
      } catch { err++; }
    }
    console.log(`Imágenes: ${ok} OK, ${err} errores`);
  },

  // DELETE
  // Primero borra los archivos de Storage y luego la fila de la BD
  async deleteVehiculo(id: string): Promise<void> {
    try {
      const { data: imgs } = await supabase
        .from('vehiculo_imagenes').select('imagen').eq('id_vehiculo', id);
      if (imgs?.length) {
        await supabase.storage.from('ad-motors-images').remove(imgs.map(i => i.imagen));
      }
      const { error } = await supabase.from('vehiculo').delete().eq('id_vehiculo', id);
      if (error) throw error;
      console.log('Vehículo eliminado');
    } catch (error) {
      console.error('Error al eliminar:', error);
      throw error;
    }
  },

  // Devuelve true si la consulta de prueba no produce error
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('vehiculo').select('count').limit(1);
      return !error;
    } catch { return false; }
  },
};