// src/services/imageService.ts
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // ✅ Corregido sin /legacy
import { Platform } from 'react-native';

export const ImageService = {
  async pickImage(useCamera: boolean = false): Promise<{uri: string, base64: string} | null> {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true, // ✅ Pedimos base64 directo para evitar conversiones manuales
      };

      const result = useCamera 
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled || !result.assets) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        base64: asset.base64 || ''
      };
    } catch (error) {
      console.error('Error en ImageService:', error);
      return null;
    }
  },

  async uriToBase64(uri: string): Promise<string | null> {
    try {
      return await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
    } catch (error) {
      console.error('Error convirtiendo a Base64:', error);
      return null;
    }
  }
};