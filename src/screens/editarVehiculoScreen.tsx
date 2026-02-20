// src/screens/EditarVehiculoScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, CombustibleType, VehiculoFormData, Vehiculo } from '../types';
import { Colors } from '../constants/colors';
import { spacing } from '../styles/global';
import Header from '../components/header';
import Input from '../components/input';
import RadioButton from '../components/radioButton';
import { SupabaseVehiculoService, ImageService } from '../services';

type EditarVehiculoScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'EditarVehiculo'
>;

const EditarVehiculoScreen: React.FC<EditarVehiculoScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { vehiculoId } = route.params;

  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [formData, setFormData] = useState<VehiculoFormData>({
    marca_modelo: '',
    descripcion: '',
    precio: '',
    ano_fabricacion: '',
    tipo_combustible: CombustibleType.GASOLINA,
    kilometraje: '',
    imagenes: [],
    color: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarVehiculo();
  }, [vehiculoId]);

  const cargarVehiculo = async () => {
    setLoading(true);
    try {
      console.log('Cargando vehiculo:', vehiculoId);
      const data = await SupabaseVehiculoService.getVehiculoById(vehiculoId);

      if (data) {
        setVehiculo(data);
        setFormData({
          marca_modelo: data.marca_modelo,
          descripcion: data.descripcion || '',
          precio: data.precio.toString(),
          ano_fabricacion: data.ano_fabricacion.toString(),
          tipo_combustible: data.tipo_combustible as CombustibleType,
          kilometraje: data.kilometraje.toString(),
          imagenes: [],
          color: data.color || '',
        });
        console.log('Vehiculo cargado correctamente');
      } else {
        Alert.alert('Error', 'Vehiculo no encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error al cargar vehiculo:', error);
      Alert.alert('Error', 'No se pudo cargar el vehiculo');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

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

    setSaving(true);
    try {
      console.log('Actualizando vehiculo...');
      await SupabaseVehiculoService.updateVehiculo(vehiculoId, formData);

      Alert.alert('Exito', 'Vehiculo actualizado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('DetalleVehiculo', { vehiculoId }),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el vehiculo');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContainer,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando vehículo...</Text>
      </View>
    );
  }

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
      <Header title="Editar vehiculo" onBackPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.formTitle}>Editar vehículo</Text>

          <Text style={styles.label}>Marca y modelo *</Text>
          <Input
            placeholder="Ej: Toyota Corolla 2024"
            value={formData.marca_modelo}
            onChangeText={(text) => setFormData({ ...formData, marca_modelo: text })}
            icon="car"
          />

          <Text style={styles.label}>Descripción</Text>
          <Input
            placeholder="Descripcion del vehiculo..."
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

          <Text style={styles.label}>Color</Text>
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

          <Text style={styles.label}>Imagenes adicionales</Text>
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity
              style={[styles.imageButton, styles.imageButtonGallery]}
              onPress={handleAgregarImagen}
              disabled={saving}
            >
              <Ionicons name="image" size={20} color={Colors.textPrimary} />
              <Text style={styles.imageButtonText}>Galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imageButton, styles.imageButtonCamera]}
              onPress={handleTamarFoto}
              disabled={saving}
            >
              <Ionicons name="camera" size={20} color={Colors.textPrimary} />
              <Text style={styles.imageButtonText}>Camara</Text>
            </TouchableOpacity>
          </View>

          {formData.imagenes.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imageCountText}>
                {formData.imagenes.length} imagen{formData.imagenes.length > 1 ? 'es' : ''} por subir
              </Text>
              {formData.imagenes.map((imageUri, index) => (
                <View key={`${imageUri}-${index}`} style={styles.imagePreviewItem}>
                  <View style={styles.imagePreview}>
                    <Ionicons name="image" size={30} color={Colors.textTertiary} />
                  </View>
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleEliminarImagen(index)}
                    disabled={saving}
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
              disabled={saving}
            >
              <Ionicons name="close" size={18} color={Colors.danger} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleGuardar}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.textPrimary} size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color={Colors.textPrimary} />
                  <Text style={styles.saveButtonText}>Actualizar</Text>
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
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingText: {
    marginTop: spacing.lg,
    color: Colors.textSecondary,
    fontSize: 14,
  } as TextStyle,
});

export default EditarVehiculoScreen;