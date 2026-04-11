import React, { useState, useEffect } from "react";
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
  Image,
  ImageStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  RootStackParamList,
  CombustibleType,
  VehiculoFormData,
  Vehiculo,
} from "../types";
import { Colors } from "../constants/colors";
import { spacing } from "../styles/global";
import Header from "../components/header";
import Input from "../components/input";
import RadioButton from "../components/radioButton";
import { SupabaseVehiculoService, ImageService } from "../services";
import type { ImagePickerResult } from "../services/imageService";

type Props = NativeStackScreenProps<RootStackParamList, "EditarVehiculo">;

const EditarVehiculoScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { vehiculoId } = route.params;

  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [formData, setFormData] = useState<VehiculoFormData>({
    marca: "",
    modelo: "",
    descripcion: "",
    precio: "",
    ano_fabricacion: "",
    tipo_combustible: CombustibleType.GASOLINA,
    kilometraje: "",
    imagenes: [],
    color: "",
  });
  const [imagenesPreview, setImagenesPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarVehiculo();
  }, [vehiculoId]);

  const cargarVehiculo = async () => {
    setLoading(true);
    try {
      const data = await SupabaseVehiculoService.getVehiculoById(vehiculoId);
      if (data) {
        setVehiculo(data);
        setFormData({
          marca: data.marca,
          modelo: data.modelo,
          descripcion: data.descripcion || "",
          precio: data.precio.toString(),
          ano_fabricacion: data.ano_fabricacion.toString(),
          tipo_combustible: data.tipo_combustible as CombustibleType,
          kilometraje: data.kilometraje.toString(),
          imagenes: [],
          color: data.color || "",
        });
      } else {
        Alert.alert("Error", "Vehículo no encontrado");
        navigation.goBack();
      }
    } catch {
      Alert.alert("Error", "No se pudo cargar el vehículo");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.marca.trim()) {
      Alert.alert("Error", "La marca es obligatoria");
      return false;
    }
    if (!formData.modelo.trim()) {
      Alert.alert("Error", "El modelo es obligatorio");
      return false;
    }
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      Alert.alert("Error", "El precio debe ser mayor a 0");
      return false;
    }
    if (
      !formData.ano_fabricacion ||
      parseInt(formData.ano_fabricacion, 10) < 1900
    ) {
      Alert.alert("Error", "El año debe ser válido");
      return false;
    }
    return true;
  };

  const handleAgregarImagen = async () => {
    try {
      const r = await ImageService.pickImageFromGallery();
      if (r) {
        setFormData((p) => ({ ...p, imagenes: [...p.imagenes, r.base64] }));
        setImagenesPreview((p) => [...p, r.uri]);
      }
    } catch {
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const handleTomarFoto = async () => {
    try {
      const r = await ImageService.takePictureFromCamera();
      if (r) {
        setFormData((p) => ({ ...p, imagenes: [...p.imagenes, r.base64] }));
        setImagenesPreview((p) => [...p, r.uri]);
      }
    } catch {
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  const handleEliminarImagen = (i: number) => {
    setFormData((p) => ({
      ...p,
      imagenes: p.imagenes.filter((_, idx) => idx !== i),
    }));
    setImagenesPreview((p) => p.filter((_, idx) => idx !== i));
  };

  const handleGuardar = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      await SupabaseVehiculoService.updateVehiculo(vehiculoId, formData);
      Alert.alert("Éxito", "Vehículo actualizado correctamente", [
        {
          text: "OK",
          onPress: () => navigation.navigate("DetalleVehiculo", { vehiculoId }),
        },
      ]);
    } catch {
      Alert.alert("Error", "No se pudo actualizar el vehículo");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof VehiculoFormData) => (val: any) =>
    setFormData((p) => ({ ...p, [key]: val }));

  if (loading) {
    return (
      <View
        style={[styles.container, styles.center, { paddingTop: insets.top }]}
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
      <Header title="Editar vehículo" onBackPress={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.formTitle}>Editar vehículo</Text>

          <Text style={styles.label}>Marca *</Text>
          <Input
            placeholder="Ej: Toyota, BMW, Seat..."
            value={formData.marca}
            onChangeText={set("marca")}
            icon="car"
          />

          <Text style={styles.label}>Modelo *</Text>
          <Input
            placeholder="Ej: Corolla, Serie 3, Ibiza..."
            value={formData.modelo}
            onChangeText={set("modelo")}
            icon="car-sport"
          />

          <Text style={styles.label}>Descripción</Text>
          <Input
            placeholder="Descripción del vehículo..."
            value={formData.descripcion}
            onChangeText={set("descripcion")}
            icon="document"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Año de fabricación *</Text>
          <Input
            placeholder="2024"
            value={formData.ano_fabricacion}
            onChangeText={set("ano_fabricacion")}
            keyboardType="numeric"
            icon="calendar"
          />

          <Text style={styles.label}>Precio *</Text>
          <Input
            placeholder="25000"
            value={formData.precio}
            onChangeText={set("precio")}
            keyboardType="decimal-pad"
            icon="wallet"
          />

          <Text style={styles.label}>Kilometraje *</Text>
          <Input
            placeholder="0"
            value={formData.kilometraje}
            onChangeText={set("kilometraje")}
            keyboardType="numeric"
            icon="speedometer"
          />

          <Text style={styles.label}>Color</Text>
          <Input
            placeholder="Ej: Rojo, Azul..."
            value={formData.color}
            onChangeText={set("color")}
            icon="color-palette"
          />

          <Text style={styles.label}>Tipo de combustible *</Text>
          <View style={styles.radioGroup}>
            {Object.values(CombustibleType).map((tipo) => (
              <RadioButton
                key={tipo}
                label={tipo}
                selected={formData.tipo_combustible === tipo}
                onPress={() =>
                  setFormData((p) => ({ ...p, tipo_combustible: tipo }))
                }
              />
            ))}
          </View>

          <Text style={styles.label}>Imágenes adicionales</Text>
          <View style={styles.imgBtns}>
            <TouchableOpacity
              style={[styles.imgBtn, { backgroundColor: Colors.primary }]}
              onPress={handleAgregarImagen}
              disabled={saving}
            >
              <Ionicons name="image" size={20} color={Colors.textPrimary} />
              <Text style={styles.imgBtnText}>Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imgBtn, { backgroundColor: Colors.success }]}
              onPress={handleTomarFoto}
              disabled={saving}
            >
              <Ionicons name="camera" size={20} color={Colors.textPrimary} />
              <Text style={styles.imgBtnText}>Cámara</Text>
            </TouchableOpacity>
          </View>

          {imagenesPreview.length > 0 && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewCount}>
                {imagenesPreview.length} imagen
                {imagenesPreview.length > 1 ? "es" : ""} por subir
              </Text>
              <View style={styles.previewGrid}>
                {imagenesPreview.map((uri, i) => (
                  <View key={i} style={styles.previewItem}>
                    <Image
                      source={{ uri }}
                      style={styles.previewImg as ImageStyle}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => handleEliminarImagen(i)}
                      disabled={saving}
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Ionicons name="close" size={18} color={Colors.danger} />
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.saveBtn]}
              onPress={handleGuardar}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.textPrimary} size="small" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={Colors.textPrimary}
                  />
                  <Text style={styles.saveText}>Actualizar</Text>
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
  center: { justifyContent: "center", alignItems: "center" } as ViewStyle,
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  } as ViewStyle,
  form: { marginBottom: spacing.xl } as ViewStyle,
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: spacing.lg,
  } as TextStyle,
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  } as TextStyle,
  radioGroup: { marginBottom: spacing.lg, gap: spacing.md } as ViewStyle,
  loadingText: {
    marginTop: spacing.lg,
    color: Colors.textSecondary,
    fontSize: 14,
  } as TextStyle,
  actions: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.xxl,
  } as ViewStyle,
  btn: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  } as ViewStyle,
  cancelBtn: {
    backgroundColor: Colors.tertiaryBackground,
    borderWidth: 1,
    borderColor: Colors.danger,
  } as ViewStyle,
  cancelText: {
    color: Colors.danger,
    fontWeight: "600",
    fontSize: 14,
  } as TextStyle,
  saveBtn: { backgroundColor: Colors.primary } as ViewStyle,
  saveText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  } as TextStyle,
  imgBtns: {
    flexDirection: "row",
    gap: spacing.md,
    marginVertical: spacing.lg,
  } as ViewStyle,
  imgBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  } as ViewStyle,
  imgBtnText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 12,
  } as TextStyle,
  previewContainer: { marginVertical: spacing.lg } as ViewStyle,
  previewCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
  } as TextStyle,
  previewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  } as ViewStyle,
  previewItem: { position: "relative", width: 100, height: 100 } as ViewStyle,
  previewImg: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: Colors.tertiaryBackground,
  },
  removeBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
});

export default EditarVehiculoScreen;
