// src/screens/DetalleVehiculoScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Vehiculo } from '../types';
import { Colors } from '../constants/colors';
import { spacing } from '../styles/global';
import Header from '../components/header';
import { SupabaseVehiculoService } from '../services';

type DetalleVehiculoScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'DetalleVehiculo'
>;

const DetalleVehiculoScreen: React.FC<DetalleVehiculoScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { vehiculoId } = route.params;

  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    cargarVehiculo();
  }, [vehiculoId]);

  const cargarVehiculo = async () => {
    try {
      setLoading(true);
      console.log('Cargando detalle de vehiculo:', vehiculoId);

      const data = await SupabaseVehiculoService.getVehiculoById(vehiculoId);
      if (data) {
        setVehiculo(data);

        const imgs = await SupabaseVehiculoService.getImagenesVehiculo(vehiculoId);
        setImagenes(imgs);

        console.log(`Vehiculo cargado con ${imgs.length} imagenes`);
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

  const handleEditar = () => {
    navigation.navigate('EditarVehiculo', { vehiculoId });
  };

  const handleEliminar = () => {
    Alert.alert(
      'Eliminar vehiculo',
      'Estas seguro de que deseas eliminar este vehiculo?',
      [
        {
          text: 'Cancelar',
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: eliminarVehiculo,
          style: 'destructive',
        },
      ]
    );
  };

  const eliminarVehiculo = async () => {
    setDeleting(true);
    try {
      console.log('Eliminando vehiculo...');
      await SupabaseVehiculoService.deleteVehiculo(vehiculoId);

      Alert.alert('Exito', 'Vehiculo eliminado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ListVehiculos'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el vehiculo');
      console.error('Error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const renderImagen = ({ item }: { item: string; index: number }) => (
    <View style={styles.imagenItem}>
      <Image
        source={{ uri: item }}
        style={styles.imagenGaleria}
        resizeMode="cover"
      />
    </View>
  );

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

  if (!vehiculo) {
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
        <Text style={styles.errorText}>Vehículo no encontrado</Text>
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
      <Header title="Detalle del vehiculo" onBackPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {imagenes.length > 0 ? (
          <View style={styles.galeriaContainer}>
            <FlatList
              data={imagenes}
              renderItem={renderImagen}
              keyExtractor={(item, index) => `imagen-${index}`}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.galeriaRow}
            />
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Ionicons name="image-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.noImageText}>Sin imagenes</Text>
          </View>
        )}

        <View style={styles.mainInfoSection}>
          <Text style={styles.marca}>{vehiculo.marca_modelo}</Text>
          <Text style={styles.combustible}>{vehiculo.tipo_combustible}</Text>
        </View>

        <View style={styles.infoCard}>
          <DetailRow
            icon="wallet"
            label="Precio"
            value={`EUR ${vehiculo.precio.toLocaleString()}`}
            isHighlight={true}
          />
          <Divider />
          <DetailRow
            icon="speedometer"
            label="Kilometraje"
            value={`${vehiculo.kilometraje} km`}
            isHighlight={false}
          />
          <Divider />
          <DetailRow
            icon="calendar"
            label="Ano"
            value={vehiculo.ano_fabricacion.toString()}
            isHighlight={false}
          />
          <Divider />
          {vehiculo.color && (
            <>
              <DetailRow
                icon="color-palette"
                label="Color"
                value={vehiculo.color}
                isHighlight={false}
              />
              <Divider />
            </>
          )}
          <DetailRow
            icon="images"
            label="Imagenes"
            value={imagenes.length.toString()}
            isHighlight={false}
          />
        </View>

        {vehiculo.descripcion && (
          <View style={styles.descriptionSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Descripción</Text>
            </View>
            <Text style={styles.descriptionText}>{vehiculo.descripcion}</Text>
          </View>
        )}

        <View style={styles.dateSection}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
            <View>
              <Text style={styles.dateLabel}>Creado</Text>
              <Text style={styles.dateValue}>
                {vehiculo.fecha_creacion
                  ? new Date(vehiculo.fecha_creacion).toLocaleDateString()
                  : 'No disponible'}
              </Text>
            </View>
          </View>

          {vehiculo.fecha_actualizacion && (
            <View style={styles.dateItem}>
              <Ionicons name="refresh" size={16} color={Colors.textSecondary} />
              <View>
                <Text style={styles.dateLabel}>Actualizado</Text>
                <Text style={styles.dateValue}>
                  {new Date(vehiculo.fecha_actualizacion).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEditar}
            disabled={deleting}
          >
            <Ionicons name="pencil" size={18} color={Colors.textPrimary} />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleEliminar}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color={Colors.textPrimary} size="small" />
            ) : (
              <>
                <Ionicons name="trash" size={18} color={Colors.textPrimary} />
                <Text style={styles.actionButtonText}>Eliminar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
  isHighlight?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({
  icon,
  label,
  value,
  isHighlight = false,
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabel}>
      <Ionicons
        name={icon as any}
        size={18}
        color={isHighlight ? Colors.primary : Colors.textSecondary}
      />
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={[styles.value, isHighlight && styles.highlightValue]}>
      {value}
    </Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

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
  galeriaContainer: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: Colors.secondaryBackground,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  } as ViewStyle,
  galeriaRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  } as ViewStyle,
  imagenItem: {
    width: '48%',
    aspectRatio: 1,
  } as ViewStyle,
  imagenGaleria: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: Colors.tertiaryBackground,
  } as ImageStyle,
  imageContainer: {
    backgroundColor: Colors.tertiaryBackground,
    borderRadius: 12,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  } as ViewStyle,
  noImageText: {
    marginTop: spacing.lg,
    color: Colors.textTertiary,
    fontSize: 14,
  } as TextStyle,
  mainInfoSection: {
    marginBottom: spacing.lg,
  } as ViewStyle,
  marca: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: spacing.sm,
  } as TextStyle,
  combustible: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  } as TextStyle,
  infoCard: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  } as ViewStyle,
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  } as ViewStyle,
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  } as ViewStyle,
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  } as TextStyle,
  value: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
  } as TextStyle,
  highlightValue: {
    color: Colors.primary,
    fontSize: 16,
  } as TextStyle,
  divider: {
    height: 1,
    backgroundColor: Colors.tertiaryBackground,
    marginHorizontal: spacing.lg,
  } as ViewStyle,
  descriptionSection: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  } as ViewStyle,
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  } as TextStyle,
  descriptionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  } as TextStyle,
  dateSection: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.lg,
  } as ViewStyle,
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  } as ViewStyle,
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  } as TextStyle,
  dateValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  } as TextStyle,
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  } as ViewStyle,
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: 12,
  } as ViewStyle,
  editButton: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  deleteButton: {
    backgroundColor: Colors.danger,
  } as ViewStyle,
  actionButtonText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  } as TextStyle,
  loadingText: {
    marginTop: spacing.lg,
    color: Colors.textSecondary,
    fontSize: 14,
  } as TextStyle,
  errorText: {
    color: Colors.textPrimary,
    fontSize: 16,
  } as TextStyle,
});

export default DetalleVehiculoScreen;