// src/screens/ListVehiculosScreen.tsx

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ViewStyle,
  TextStyle,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, Vehiculo } from "../types";
import { Colors } from "../constants/colors";
import { spacing } from "../styles/global";
import Header from "../components/header";
import { SupabaseVehiculoService } from "../services";

type ListVehiculosScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ListVehiculos"
>;

const ListVehiculosScreen: React.FC<ListVehiculosScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarVehiculos();
    }, []),
  );

  const cargarVehiculos = async () => {
    try {
      console.log("Cargando lista de vehiculos...");
      setLoading(true);
      const data = await SupabaseVehiculoService.getVehiculos();
      setVehiculos(data);
      console.log(`${data.length} vehiculos cargados`);
    } catch (error) {
      console.error("Error al cargar vehiculos:", error);
      Alert.alert("Error", "No se pudieron cargar los vehiculos");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarVehiculos();
    setRefreshing(false);
  };

  const handleAgregarVehiculo = () => {
    navigation.navigate("AnadirVehiculo");
  };

  const handleVerDetalle = (vehiculoId: string) => {
    navigation.navigate("DetalleVehiculo", { vehiculoId });
  };

  const renderVehiculo = ({ item }: { item: Vehiculo }) => (
    <TouchableOpacity
      style={styles.vehiculoCard}
      onPress={() => handleVerDetalle(item.id_vehiculo)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons name="car-sport" size={24} color={Colors.primary} />
          <View style={styles.titleContainer}>
            <Text style={styles.vehiculoMarca}>{item.marca_modelo}</Text>
            <Text style={styles.vehiculoAno}>{item.ano_fabricacion}</Text>
          </View>
        </View>
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.tipo_combustible}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.detailRow}>
          <Ionicons name="speedometer" size={16} color={Colors.textSecondary} />
          <Text style={styles.detalleText}>{item.kilometraje} km</Text>
        </View>

        {item.color && (
          <View style={styles.detailRow}>
            <Ionicons
              name="color-palette"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.detalleText}>{item.color}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="wallet" size={16} color={Colors.textSecondary} />
          <Text style={styles.precio}>EUR {item.precio.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <Ionicons name="calendar" size={14} color={Colors.textTertiary} />
          <Text style={styles.fechaText}>
            {item.fecha_creacion
              ? new Date(item.fecha_creacion).toLocaleDateString()
              : "Fecha no disponible"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={48} color={Colors.textTertiary} />
      <Text style={styles.emptyText}>No hay vehículos registrados</Text>
      <Text style={styles.emptySubtext}>Agrega tu primer vehículo</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleAgregarVehiculo}
      >
        <Ionicons name="add" size={20} color={Colors.textPrimary} />
        <Text style={styles.emptyButtonText}>Agregar vehículo</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && vehiculos.length === 0) {
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
        <Text style={styles.loadingText}>Cargando vehículos...</Text>
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Mis vehículos</Text>
        <Text style={styles.headerSubtitle}>
          {vehiculos.length} vehículo{vehiculos.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={vehiculos}
        renderItem={renderVehiculo}
        keyExtractor={(item) => item.id_vehiculo}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAgregarVehiculo}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  } as ViewStyle,
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.tertiaryBackground,
  } as ViewStyle,
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
  } as TextStyle,
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: spacing.sm,
  } as TextStyle,
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexGrow: 1,
  } as ViewStyle,
  vehiculoCard: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 16,
    marginBottom: spacing.lg,
    overflow: "hidden",
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    elevation: 2,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  } as ViewStyle,
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  } as ViewStyle,
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  } as ViewStyle,
  titleContainer: {
    flex: 1,
  } as ViewStyle,
  vehiculoMarca: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  } as TextStyle,
  vehiculoAno: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  } as TextStyle,
  badgeContainer: {
    marginLeft: spacing.md,
  } as ViewStyle,
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  } as ViewStyle,
  badgeText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: "600",
  } as TextStyle,
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  } as ViewStyle,
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  } as ViewStyle,
  detalleText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  } as TextStyle,
  precio: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    flex: 1,
  } as TextStyle,
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: Colors.tertiaryBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.primaryBackground,
  } as ViewStyle,
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  } as ViewStyle,
  fechaText: {
    fontSize: 11,
    color: Colors.textTertiary,
  } as TextStyle,
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: spacing.lg,
    textAlign: "center",
  } as TextStyle,
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    textAlign: "center",
  } as TextStyle,
  emptyButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    gap: spacing.sm,
  } as ViewStyle,
  emptyButtonText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  } as TextStyle,
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  } as ViewStyle,
  loadingText: {
    marginTop: spacing.lg,
    color: Colors.textSecondary,
    fontSize: 14,
  } as TextStyle,
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginTop: 10,
  },
  backText: {
    marginLeft: 5,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
});

export default ListVehiculosScreen;
