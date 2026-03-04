// src/services/imageService.ts
// ✅ iOS ONLY - Base64 Directo

import * as ImagePicker from 'expo-image-picker';

export interface ImagePickerResult {
  uri: string;
  base64: string;
  fileName: string;
}

export const ImageService = {
  /**
   * 📱 SOLICITAR PERMISO DE GALERÍA
   */
  async requestGalleryPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('⚠️ Permiso de galería denegado');
        return false;
      }
      
      console.log('✅ Permiso de galería otorgado');
      return true;
    } catch (error) {
      console.error('❌ Error al solicitar permisos de galería:', error);
      return false;
    }
  },

  /**
   * 📱 SOLICITAR PERMISO DE CÁMARA
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('⚠️ Permiso de cámara denegado');
        return false;
      }
      
      console.log('✅ Permiso de cámara otorgado');
      return true;
    } catch (error) {
      console.error('❌ Error al solicitar permisos de cámara:', error);
      return false;
    }
  },

  /**
   * 🖼️ SELECCIONAR IMAGEN DE GALERÍA
   * ✅ Retorna BASE64 directamente
   */
  async pickImageFromGallery(): Promise<ImagePickerResult | null> {
    try {
      if (!(await this.requestGalleryPermission())) {
        console.warn('Permisos de galería no otorgados');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true, // ✅ OBTENER BASE64 DIRECTAMENTE
        exif: false,   // No incluir datos EXIF
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('Usuario canceló la selección de imagen');
        return null;
      }

      const asset = result.assets[0];

      // Verificar que tenemos base64
      if (!asset.base64) {
        console.error('❌ No se obtuvo base64 de la imagen');
        return null;
      }

      console.log('✅ Imagen seleccionada (galería) con base64');
      return {
        uri: asset.uri,
        base64: asset.base64,
        fileName: `image-${Date.now()}.jpg`,
      };
    } catch (error) {
      console.error('❌ Error al seleccionar imagen:', error);
      return null;
    }
  },

  /**
   * 📷 TOMAR FOTO CON CÁMARA
   * ✅ Retorna BASE64 directamente
   */
  async takePictureFromCamera(): Promise<ImagePickerResult | null> {
    try {
      if (!(await this.requestCameraPermission())) {
        console.warn('Permisos de cámara no otorgados');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true, // ✅ OBTENER BASE64 DIRECTAMENTE
        exif: false,   // No incluir datos EXIF
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('Usuario canceló la cámara');
        return null;
      }

      const asset = result.assets[0];

      // Verificar que tenemos base64
      if (!asset.base64) {
        console.error('❌ No se obtuvo base64 de la foto');
        return null;
      }

      console.log('✅ Foto tomada (cámara) con base64');
      return {
        uri: asset.uri,
        base64: asset.base64,
        fileName: `photo-${Date.now()}.jpg`,
      };
    } catch (error) {
      console.error('❌ Error al tomar foto:', error);
      return null;
    }
  },

  /**
   * 🔧 GENERAR NOMBRE DE ARCHIVO
   */
  generateFileName(timestamp: string = ''): string {
    const time = timestamp || Date.now().toString();
    const random = Math.random().toString(36).substring(7);
    return `vehicle-${time}-${random}.jpg`;
  },

  /**
   * 🔧 OBTENER MIME TYPE
   */
  getMimeType(): string {
    return 'image/jpeg';
  },
};