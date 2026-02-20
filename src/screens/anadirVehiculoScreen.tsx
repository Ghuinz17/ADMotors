// src/screens/AnadirVehiculoScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, CombustibleType, VehiculoFormData } from '../types';
import { Colors } from '../constants/colors';
import { spacing } from '../styles/global';
import Header from '../components/header';
import Input from '../components/input';
import RadioButton from '../components/radioButton';
import { SupabaseVehiculoService, ImageService } from '../services';

type AnadirVehiculoScreenProps = NativeStackScreenProps<RootStackParamList, 'AnadirVehiculo'>;

const AnadirVehiculoScreen: React.FC<AnadirVehiculoScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<VehiculoFormData>({
    marca_modelo: '',
    descripcion: '',
    precio: '',
    ano_fabricacion: new Date().getFullYear().toString(),
    tipo_combustible: CombustibleType.GASOLINA,
    kilometraje: '0',
    imagenes: [],
    color: '',
  });
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!formData.marca_modelo.trim()) {
      Alert.alert('Error', 'La marca y modelo es obligatorio');
      return false;
    }
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return false;
    }
    if (!formData.ano_fabricacion || parseInt(formData.ano_fabricacion, 10) < 1900) {
      Alert.alert('Error', 'El ano debe ser valido');
      return false;
    }
    if (!formData.kilometraje || parseInt(formData.kilometraje, 10) < 0) {
      Alert.alert('Error', 'El kilometraje debe ser valido');
      return false;
    }
    return true;
  };

  const handleAgregarImagen = async () => {
    try {
      const imageUri = await ImageService.pickImageFromGallery();
      if (imageUri) {
        setFormData({
          ...formData,
          imagenes: [...formData.imagenes, imageUri],
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
      console.error('Error:', error);
    }
  };

  const handleTamarFoto = async () => {
    try {
      const imageUri = await ImageService.takePictureFromCamera();
      if (imageUri) {
        setFormData({
          ...formData,
          imagenes: [...formData.imagenes, imageUri],
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
      console.error('Error:', error);
    }
  };

  const handleEliminarImagen = (index: number) => {
    const nuevasImagenes = formData.imagenes.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      imagenes: nuevasImagenes,
    });
  };

  const handleGuardar = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Guardando vehiculo...');
      await SupabaseVehiculoService.createVehiculo(formData);

      Alert.alert('Exito', 'Vehiculo guardado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ListVehiculos'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el vehiculo');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <Header title="Anadir vehiculo" onBackPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.formTitle}>Añadir nuevo vehículo</Text>

          <Text style={styles.label}>Marca y modelo *</Text>
          <Input
            placeholder="Ej: Toyota Corolla 2024"
            value={formData.marca_modelo}
            onChangeText={(text) => setFormData({ ...formData, marca_modelo: text })}
            icon="car"
          />

          <Text style={styles.label}>Descripción *</Text>
          <Input
            placeholder="Descripción del vehículo..."
            value={formData.descripcion}
            onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
            icon="document"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Año de fabricación *</Text>
          <Input
            placeholder="2024"
            value={formData.ano_fabricacion}
            onChangeText={(text) => setFormData({ ...formData, ano_fabricacion: text })}
            keyboardType="numeric"
            icon="calendar"
          />

          <Text style={styles.label}>Precio *</Text>
          <Input
            placeholder="25000"
            value={formData.precio}
            onChangeText={(text) => setFormData({ ...formData, precio: text })}
            keyboardType="decimal-pad"
            icon="wallet"
          />

          <Text style={styles.label}>Kilometraje *</Text>
          <Input
            placeholder="0"
            value={formData.kilometraje}
            onChangeText={(text) => setFormData({ ...formData, kilometraje: text })}
            keyboardType="numeric"
            icon="speedometer"
          />

          <Text style={styles.label}>Color *</Text>
          <Input
            placeholder="Ej: Rojo, Azul..."
            value={formData.color}
            onChangeText={(text) => setFormData({ ...formData, color: text })}
            icon="color-palette"
          />

          <Text style={styles.label}>Tipo de combustible *</Text>
          <View style={styles.radioGroup}>
            <RadioButton
              label={CombustibleType.GASOLINA}
              selected={formData.tipo_combustible === CombustibleType.GASOLINA}
              onPress={() => setFormData({ ...formData, tipo_combustible: CombustibleType.GASOLINA })}
            />
            <RadioButton
              label={CombustibleType.DIESEL}
              selected={formData.tipo_combustible === CombustibleType.DIESEL}
              onPress={() => setFormData({ ...formData, tipo_combustible: CombustibleType.DIESEL })}
            />
            <RadioButton
              label={CombustibleType.ELECTRICO}
              selected={formData.tipo_combustible === CombustibleType.ELECTRICO}
              onPress={() => setFormData({ ...formData, tipo_combustible: CombustibleType.ELECTRICO })}
            />
            <RadioButton
              label={CombustibleType.HIBRIDO}
              selected={formData.tipo_combustible === CombustibleType.HIBRIDO}
              onPress={() => setFormData({ ...formData, tipo_combustible: CombustibleType.HIBRIDO })}
            />
          </View>

          <Text style={styles.label}>Imagenes del vehículo</Text>
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity
              style={[styles.imageButton, styles.imageButtonGallery]}
              onPress={handleAgregarImagen}
              disabled={loading}
            >
              <Ionicons name="image" size={20} color={Colors.textPrimary} />
              <Text style={styles.imageButtonText}>Galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imageButton, styles.imageButtonCamera]}
              onPress={handleTamarFoto}
              disabled={loading}
            >
              <Ionicons name="camera" size={20} color={Colors.textPrimary} />
              <Text style={styles.imageButtonText}>Camara</Text>
            </TouchableOpacity>
          </View>

          {formData.imagenes.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imageCountText}>
                {formData.imagenes.length} imagen{formData.imagenes.length > 1 ? 'es' : ''} seleccionada{formData.imagenes.length > 1 ? 's' : ''}
              </Text>
              {formData.imagenes.map((imageUri, index) => (
                <View key={`${imageUri}-${index}`} style={styles.imagePreviewItem}>
                  <View style={styles.imagePreview}>
                    <Ionicons name="image" size={30} color={Colors.textTertiary} />
                  </View>
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleEliminarImagen(index)}
                    disabled={loading}
                  >
                    <Ionicons name="close" size={16} color={Colors.primaryBackground} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Ionicons name="close" size={18} color={Colors.danger} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleGuardar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textPrimary} size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color={Colors.textPrimary} />
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  } as ViewStyle,
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  } as ViewStyle,
  form: {
    marginBottom: spacing.xl,
  } as ViewStyle,
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: spacing.lg,
  } as TextStyle,
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  } as TextStyle,
  radioGroup: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  } as ViewStyle,
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xxl,
  } as ViewStyle,
  button: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  } as ViewStyle,
  cancelButton: {
    backgroundColor: Colors.tertiaryBackground,
    borderWidth: 1,
    borderColor: Colors.danger,
  } as ViewStyle,
  cancelButtonText: {
    color: Colors.danger,
    fontWeight: '600',
    fontSize: 14,
  } as TextStyle,
  saveButton: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  saveButtonText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  } as TextStyle,
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.lg,
  } as ViewStyle,
  imageButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  } as ViewStyle,
  imageButtonGallery: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  imageButtonCamera: {
    backgroundColor: Colors.success,
  } as ViewStyle,
  imageButtonText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  } as TextStyle,
  imagePreviewContainer: {
    marginVertical: spacing.lg,
  } as ViewStyle,
  imageCountText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
  } as TextStyle,
  imagePreviewItem: {
    position: 'relative',
    width: '30%',
    marginRight: spacing.md,
    marginBottom: spacing.md,
  } as ViewStyle,
  imagePreview: {
    width: 80,
    height: 80,
    backgroundColor: Colors.tertiaryBackground,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
});

export default AnadirVehiculoScreen;