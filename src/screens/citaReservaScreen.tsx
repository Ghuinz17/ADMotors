import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Colors } from "../constants/colors";
import { spacing } from "../styles/global";
import Header from "../components/header";
import Input from "../components/input";
import { supabase } from "../config/supabase";

type Props = NativeStackScreenProps<RootStackParamList, "CitaReserva">;
type TipoCita = "visita" | "pago";

interface VehiculoItem {
  id_vehiculo: string;
  marca: string;
  modelo: string;
}

const CitaReservaScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { vehiculoId: initId, vehiculoNombre: initNombre } = route.params;

  const [tipoCita, setTipoCita] = useState<TipoCita>("visita");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehiculos, setVehiculos] = useState<VehiculoItem[]>([]);
  const [selectedId, setSelectedId] = useState(initId || "");
  const [selectedName, setSelectedName] = useState(initNombre || "");
  const [loadingVehs, setLoadingVehs] = useState(false);
  const [showPicker, setShowPicker] = useState(!initId);

  useEffect(() => {
    if (!initId) cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    setLoadingVehs(true);
    try {
      const { data } = await supabase
        .from("vehiculo")
        .select("id_vehiculo, marca, modelo")
        .eq("reservado", true)
        .order("fecha_creacion", { ascending: false });
      setVehiculos(data || []);
    } finally {
      setLoadingVehs(false);
    }
  };

  const validarFecha = (f: string): boolean => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(f)) return false;
    const [d, m, a] = f.split("/").map(Number);
    const fecha = new Date(a, m - 1, d);
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(0, 0, 0, 0);
    return fecha >= manana;
  };

  const validarHora = (h: string): boolean =>
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(h);

  const handleConfirmar = async () => {
    if (!selectedId) {
      Alert.alert("Error", "Selecciona un vehículo");
      return;
    }
    if (!nombre.trim()) {
      Alert.alert("Error", "Introduce el nombre del asistente");
      return;
    }
    if (!telefono.trim() || !/^[0-9+\s]{9,15}$/.test(telefono)) {
      Alert.alert("Error", "Introduce un teléfono válido");
      return;
    }
    if (!validarFecha(fecha)) {
      Alert.alert("Error", "Fecha inválida. Formato DD/MM/AAAA, desde mañana");
      return;
    }
    if (!validarHora(hora)) {
      Alert.alert("Error", "Hora inválida. Formato HH:MM (09:00-20:00)");
      return;
    }

    const [d, m, a] = fecha.split("/");
    const fechaISO = `${a}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

    setLoading(true);
    try {
      const { error } = await supabase.from("solicitudes_revision").insert([
        {
          id_vehiculo: selectedId,
          marca_modelo: selectedName,
          nombre_asistente: nombre,
          telefono,
          fecha_visita: fechaISO,
          hora_visita: hora,
        },
      ]);
      if (error) throw error;

      Alert.alert(
        "Cita registrada",
        `La cita de ${tipoCita === "visita" ? "visita" : "pago"} ha sido registrada correctamente.`,
        [{ text: "Aceptar", onPress: () => navigation.navigate("Home") }],
      );
    } catch (err: any) {
      Alert.alert("Error", err?.message || "No se pudo registrar la cita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Header title="Registrar cita" onBackPress={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Selector vehículo */}
        <Text style={styles.label}>Vehículo reservado *</Text>
        {selectedId ? (
          <TouchableOpacity
            style={styles.vehiculoSelected}
            onPress={() => {
              setSelectedId("");
              setSelectedName("");
              setShowPicker(true);
              cargarVehiculos();
            }}
          >
            <Ionicons name="car" size={20} color={Colors.primary} />
            <Text style={styles.vehiculoSelectedText}>{selectedName}</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.pickerContainer}>
            {loadingVehs ? (
              <ActivityIndicator color={Colors.primary} />
            ) : vehiculos.length === 0 ? (
              <Text style={styles.emptyText}>No hay vehículos reservados</Text>
            ) : (
              vehiculos.map((v) => (
                <TouchableOpacity
                  key={v.id_vehiculo}
                  style={styles.vehiculoItem}
                  onPress={() => {
                    setSelectedId(v.id_vehiculo);
                    setSelectedName(`${v.marca} ${v.modelo}`);
                    setShowPicker(false);
                  }}
                >
                  <Ionicons
                    name="car-outline"
                    size={18}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.vehiculoItemText}>
                    {v.marca} {v.modelo}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Tipo cita */}
        <Text style={styles.label}>Tipo de cita *</Text>
        <View style={styles.tipoRow}>
          <TouchableOpacity
            style={[
              styles.tipoBtn,
              tipoCita === "visita" && styles.tipoBtnActive,
            ]}
            onPress={() => setTipoCita("visita")}
          >
            <Ionicons
              name="calendar"
              size={20}
              color={tipoCita === "visita" ? "#fff" : Colors.textSecondary}
            />
            <Text
              style={[
                styles.tipoBtnText,
                tipoCita === "visita" && styles.tipoBtnTextActive,
              ]}
            >
              Visita al{"\n"}concesionario
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tipoBtn,
              tipoCita === "pago" && styles.tipoBtnActive,
            ]}
            onPress={() => setTipoCita("pago")}
          >
            <Ionicons
              name="card"
              size={20}
              color={tipoCita === "pago" ? "#fff" : Colors.textSecondary}
            />
            <Text
              style={[
                styles.tipoBtnText,
                tipoCita === "pago" && styles.tipoBtnTextActive,
              ]}
            >
              Dia para{"\n"}el pago
            </Text>
          </TouchableOpacity>
        </View>

        {/* Datos */}
        <Text style={styles.label}>Nombre del asistente *</Text>
        <Input
          placeholder="Nombre completo"
          value={nombre}
          onChangeText={setNombre}
          icon="person-outline"
        />

        <Text style={styles.label}>Telefono de contacto *</Text>
        <Input
          placeholder="+34 600 000 000"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          icon="call-outline"
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Fecha * (DD/MM/AAAA)</Text>
            <Input
              placeholder="15/06/2025"
              value={fecha}
              onChangeText={setFecha}
              keyboardType="numeric"
              icon="calendar-outline"
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Hora * (HH:MM)</Text>
            <Input
              placeholder="10:00"
              value={hora}
              onChangeText={setHora}
              keyboardType="numeric"
              icon="time-outline"
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={Colors.primary}
          />
          <Text style={styles.infoBoxText}>
            Nos pondremos en contacto con el cliente para confirmar la
            disponibilidad.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btnConfirmar, loading && { opacity: 0.6 }]}
          onPress={handleConfirmar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.btnConfirmarText}>Confirmar cita</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  } as ViewStyle,
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  } as ViewStyle,
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  } as TextStyle,
  vehiculoSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  } as ViewStyle,
  vehiculoSelectedText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  } as TextStyle,
  pickerContainer: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  } as ViewStyle,
  vehiculoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  } as ViewStyle,
  vehiculoItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  } as TextStyle,
  emptyText: {
    padding: spacing.lg,
    color: Colors.textSecondary,
    textAlign: "center",
  } as TextStyle,
  tipoRow: { flexDirection: "row", gap: spacing.md } as ViewStyle,
  tipoBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.secondaryBackground,
  } as ViewStyle,
  tipoBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  } as ViewStyle,
  tipoBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  } as TextStyle,
  tipoBtnTextActive: { color: "#fff" } as TextStyle,
  row: { flexDirection: "row", gap: spacing.md } as ViewStyle,
  rowItem: { flex: 1 } as ViewStyle,
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: Colors.tertiaryBackground,
    borderRadius: 10,
    padding: spacing.md,
    marginTop: spacing.lg,
  } as ViewStyle,
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    lineHeight: 18,
  } as TextStyle,
  btnConfirmar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
  } as ViewStyle,
  btnConfirmarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  } as TextStyle,
});

export default CitaReservaScreen;
