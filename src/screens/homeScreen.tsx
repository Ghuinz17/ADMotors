import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { Colors } from "../constants/colors";
import { spacing } from "../styles/global";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      label: "Lista de vehículos",
      icon: "list",
      color: Colors.primary,
      onPress: () => navigation.navigate("ListVehiculos"),
    },
    {
      label: "Añadir vehículo",
      icon: "add-circle",
      color: "#16a34a",
      onPress: () => navigation.navigate("AnadirVehiculo"),
    },
    {
      label: "Solicitudes de visita",
      icon: "calendar",
      color: "#f59e0b",
      onPress: () => navigation.navigate("Solicitudes"),
    },
  ];

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
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>AD Motors</Text>
        <View style={styles.underline} />
        <Text style={styles.subtitle}>PANEL DE ADMINISTRACIÓN</Text>
      </View>

      {/* Menú */}
      <View style={styles.buttonsContainer}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.button}
            onPress={item.onPress}
            activeOpacity={0.8}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: item.color }]}
            >
              <Ionicons name={item.icon as any} size={22} color="#fff" />
            </View>
            <Text style={styles.buttonText}>{item.label}</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  } as ViewStyle,
  headerContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  } as ViewStyle,
  title: {
    fontSize: 36,
    fontWeight: "300",
    color: Colors.textPrimary,
    letterSpacing: 2,
  } as TextStyle,
  underline: {
    width: 200,
    height: 2,
    backgroundColor: Colors.primary,
    marginVertical: spacing.lg,
  } as ViewStyle,
  subtitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 3,
  } as TextStyle,
  buttonsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    marginBottom: spacing.xl,
  } as ViewStyle,
  button: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  } as ViewStyle,
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  buttonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  } as TextStyle,
});

export default HomeScreen;
