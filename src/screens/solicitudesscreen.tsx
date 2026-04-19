import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Colors } from "../constants/colors";
import { spacing } from "../styles/global";
import Header from "../components/header";
import { supabase } from "../config/supabase";

type Props = NativeStackScreenProps<RootStackParamList, "Solicitudes">;

interface Solicitud {
  id_solicitud: string;
  id_vehiculo: string;
  nombre_asistente: string;
  telefono: string;
  fecha_visita: string;
  hora_visita: string;
  estado: string;
  fecha_creacion: string;
  marca?: string;
  modelo?: string;
  vehiculo?: { marca: string; modelo: string } | null;
}

type FiltroEstado = "TODOS" | "PENDIENTE" | "CONFIRMADA" | "CANCELADA";

const ESTADOS: { key: FiltroEstado; label: string; color: string }[] = [
  { key: "TODOS", label: "Todos", color: Colors.primary },
  { key: "PENDIENTE", label: "Pendientes", color: "#f59e0b" },
  { key: "CONFIRMADA", label: "Confirmadas", color: "#22c55e" },
  { key: "CANCELADA", label: "Canceladas", color: Colors.danger },
];

const SolicitudesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<FiltroEstado>("TODOS");
  const [updating, setUpdating] = useState<string | null>(null);

  const cargarSolicitudes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("solicitudes_revision")
        .select("*, vehiculo(marca, modelo)")
        .order("fecha_creacion", { ascending: false });

      if (error) throw error;
      setSolicitudes(data || []);
    } catch (err) {
      Alert.alert("Error", "No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarSolicitudes();
  };

  const cambiarEstado = async (
    id: string,
    nuevoEstado: "CONFIRMADA" | "CANCELADA",
  ) => {
    const accion = nuevoEstado === "CONFIRMADA" ? "Aceptar" : "Rechazar";
    const msg =
      nuevoEstado === "CONFIRMADA"
        ? "¿Confirmar esta solicitud de visita?"
        : "¿Rechazar esta solicitud de visita?";

    Alert.alert(accion, msg, [
      { text: "Cancelar", style: "cancel" },
      {
        text: accion,
        style: nuevoEstado === "CANCELADA" ? "destructive" : "default",
        onPress: async () => {
          setUpdating(id);
          try {
            const { error } = await supabase
              .from("solicitudes_revision")
              .update({ estado: nuevoEstado })
              .eq("id_solicitud", id);
            if (error) throw error;
            setSolicitudes((prev) =>
              prev.map((s) =>
                s.id_solicitud === id ? { ...s, estado: nuevoEstado } : s,
              ),
            );
          } catch {
            Alert.alert("Error", "No se pudo actualizar la solicitud");
          } finally {
            setUpdating(null);
          }
        },
      },
    ]);
  };

  const contactarCliente = (s: Solicitud) => {
    const tel = s.telefono.replace(/\s/g, "");
    Alert.alert(
      `Contactar con ${s.nombre_asistente}`,
      `Teléfono: ${s.telefono}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "📞 Llamar",
          onPress: () => Linking.openURL(`tel:${tel}`),
        },
        {
          text: "💬 WhatsApp",
          onPress: () => {
            const waNum = tel.startsWith("+") ? tel.slice(1) : tel;
            const vehNombre = s.vehiculo
              ? `${s.vehiculo.marca} ${s.vehiculo.modelo}`
              : s.marca && s.modelo
                ? `${s.marca} ${s.modelo}`
                : "el vehículo";
            const msg = encodeURIComponent(
              `Hola ${s.nombre_asistente}, soy AD Motor's. Te contacto respecto a tu solicitud de visita para ver ${vehNombre} el ${formatFecha(s.fecha_visita)} a las ${s.hora_visita?.slice(0, 5)}.`,
            );
            Linking.openURL(`https://wa.me/${waNum}?text=${msg}`);
          },
        },
      ],
    );
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return "—";
    return new Date(fecha + "T00:00:00").toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case "CONFIRMADA":
        return { bg: "#14532d", text: "#4ade80" };
      case "CANCELADA":
        return { bg: "#450a0a", text: "#f87171" };
      default:
        return { bg: "#451a03", text: "#fbbf24" };
    }
  };

  const getNombreVehiculo = (s: Solicitud) => {
    if (s.vehiculo?.marca) return `${s.vehiculo.marca} ${s.vehiculo.modelo}`;
    if (s.marca) return `${s.marca} ${s.modelo || ""}`;
    return "Vehículo";
  };

  const filtradas =
    filtro === "TODOS"
      ? solicitudes
      : solicitudes.filter((s) => s.estado === filtro);

  const renderSolicitud = ({ item: s }: { item: Solicitud }) => {
    const estadoStyle = getEstadoStyle(s.estado);
    const isUpdating = updating === s.id_solicitud;
    const isPendiente = s.estado === "PENDIENTE";

    return (
      <View style={styles.card}>
        {/* Cabecera */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.cardIcon}>
              <Ionicons name="calendar" size={18} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.cardVehiculo}>{getNombreVehiculo(s)}</Text>
              <Text style={styles.cardFecha}>
                {formatFecha(s.fecha_visita)} ·{" "}
                {s.hora_visita?.slice(0, 5) || "—"}
              </Text>
            </View>
          </View>
          <View
            style={[styles.estadoBadge, { backgroundColor: estadoStyle.bg }]}
          >
            <Text style={[styles.estadoText, { color: estadoStyle.text }]}>
              {s.estado}
            </Text>
          </View>
        </View>

        {/* Info cliente */}
        <View style={styles.clienteInfo}>
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.infoText}>{s.nombre_asistente}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="call-outline"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.infoText}>{s.telefono}</Text>
          </View>
        </View>

        <View style={styles.acciones}>
          <TouchableOpacity
            style={[styles.accionBtn, styles.btnContactar]}
            onPress={() => contactarCliente(s)}
            disabled={isUpdating}
          >
            <Ionicons name="call" size={15} color="#fff" />
            <Text style={styles.accionText}>Contactar</Text>
          </TouchableOpacity>

          {isPendiente && (
            <TouchableOpacity
              style={[styles.accionBtn, styles.btnAceptar]}
              onPress={() => cambiarEstado(s.id_solicitud, "CONFIRMADA")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={15} color="#fff" />
                  <Text style={styles.accionText}>Aceptar</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {isPendiente && (
            <TouchableOpacity
              style={[styles.accionBtn, styles.btnRechazar]}
              onPress={() => cambiarEstado(s.id_solicitud, "CANCELADA")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="close" size={15} color="#fff" />
                  <Text style={styles.accionText}>Rechazar</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[styles.container, styles.center, { paddingTop: insets.top }]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando solicitudes...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Header
        title="Solicitudes de visita"
        onBackPress={() => navigation.goBack()}
      />

      {/* Filtros */}
      <View style={styles.filtros}>
        {ESTADOS.map((e) => (
          <TouchableOpacity
            key={e.key}
            style={[
              styles.filtroBtn,
              filtro === e.key && {
                backgroundColor: e.color,
                borderColor: e.color,
              },
            ]}
            onPress={() => setFiltro(e.key)}
          >
            <Text
              style={[styles.filtroText, filtro === e.key && { color: "#fff" }]}
            >
              {e.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contador */}
      <Text style={styles.contador}>
        {filtradas.length} solicitud{filtradas.length !== 1 ? "es" : ""}
      </Text>

      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id_solicitud}
        renderItem={renderSolicitud}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={Colors.textTertiary}
            />
            <Text style={styles.emptyTitle}>Sin solicitudes</Text>
            <Text style={styles.emptySub}>
              {filtro === "TODOS"
                ? "No hay solicitudes de visita"
                : `No hay solicitudes ${filtro.toLowerCase()}s`}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  } as ViewStyle,
  center: { justifyContent: "center", alignItems: "center" } as ViewStyle,
  loadingText: {
    marginTop: spacing.lg,
    color: Colors.textSecondary,
    fontSize: 14,
  } as TextStyle,
  filtros: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    flexWrap: "wrap",
  } as ViewStyle,
  filtroBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  } as ViewStyle,
  filtroText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  } as TextStyle,
  contador: {
    fontSize: 12,
    color: Colors.textTertiary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  } as TextStyle,
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  } as ViewStyle,
  card: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  } as ViewStyle,
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  } as ViewStyle,
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  } as ViewStyle,
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.tertiaryBackground,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  cardVehiculo: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  } as TextStyle,
  cardFecha: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  } as TextStyle,
  estadoBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 6,
  } as ViewStyle,
  estadoText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  } as TextStyle,
  clienteInfo: {
    backgroundColor: Colors.tertiaryBackground,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  } as ViewStyle,
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  } as ViewStyle,
  infoText: { fontSize: 13, color: Colors.textSecondary } as TextStyle,
  acciones: { flexDirection: "row", gap: spacing.sm } as ViewStyle,
  accionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 10,
  } as ViewStyle,
  accionText: { fontSize: 13, fontWeight: "700", color: "#fff" } as TextStyle,
  btnContactar: { backgroundColor: Colors.primary } as ViewStyle,
  btnAceptar: { backgroundColor: "#16a34a" } as ViewStyle,
  btnRechazar: { backgroundColor: Colors.danger } as ViewStyle,
  empty: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
  } as ViewStyle,
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: spacing.lg,
  } as TextStyle,
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  } as TextStyle,
});

export default SolicitudesScreen;
