// src/services/imageService.ts
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

export interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  size: number;
  format: 'png' | 'jpg' | 'jpeg';
}

export const ImageService = {
  // --- Funciones de Permisos ---
  async requestGalleryPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error al solicitar permisos de galeria:', error);
      return false;
    }
  },

  async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error al solicitar permisos de camara:', error);
      return false;
    }
  },

  // --- Selección de Imágenes ---
  async pickImageFromGallery(): Promise<string | null> {
    try {
      if (!(await this.requestGalleryPermission())) return null;
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      return (!result.canceled && result.assets.length > 0) ? result.assets[0].uri : null;
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      return null;
    }
  },

  async takePictureFromCamera(): Promise<string | null> {
    try {
      if (!(await this.requestCameraPermission())) return null;
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      return (!result.canceled && result.assets.length > 0) ? result.assets[0].uri : null;
    } catch (error) {
      console.error('Error al tomar foto:', error);
      return null;
    }
  },

  // --- NUEVO: Conversión a Base64 ---
  async uriToBase64(uri: string): Promise<string | null> {
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
      } catch (error) {
        console.error('Error al convertir a Base64:', error);
        return null;
      }
    },

  // --- Utilidades ---
  detectImageFormat(uri: string): 'png' | 'jpg' | 'jpeg' {
    const lowerUri = uri.toLowerCase();
    if (lowerUri.includes('.png')) return 'png';
    if (lowerUri.includes('.jpeg')) return 'jpeg';
    return 'jpg';
  },

  getMimeType(format: 'png' | 'jpg' | 'jpeg'): string {
    return format === 'png' ? 'image/png' : 'image/jpeg';
  },

  generateImageName(deviceId: string, vehiculoId: string, index: number = 0, format: string = 'jpg'): string {
    const timestamp = Date.now();
    return `${deviceId}/${vehiculoId}-${timestamp}-${index}.${format}`;
  }
};