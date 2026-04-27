
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ScrollView, ActivityIndicator, ViewStyle, TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { spacing } from '../styles/global';
import Header from '../components/header';
import Input from '../components/input';
import { supabase } from '../config/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'CitaReserva'>;

type TipoCita = 'visita' | 'pago';

const CitaReservaScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { vehiculoId, vehiculoNombre } = route.params;

  const [tipoCita, setTipoCita] = useState<TipoCita>('visita');
  const [fecha,    setFecha]    = useState('');
  const [hora,     setHora]     = useState('');
  const [telefono, setTelefono] = useState('');
  const [nombre,   setNombre]   = useState('');
  const [loading,  setLoading]  = useState(false);

  const validarFecha = (f: string): boolean => {
    if (!f) return false;
    const [d, m, a] = f.split('/').map(Number);
    const fecha = new Date(a, m - 1, d);
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(0, 0, 0, 0);
    return fecha >= manana;
  };

  const validarHora = (h: string): boolean => /^([01]\d|2[0-3]):([0-5]\d)$/.test(h);

  const handleConfirmar = async () => {
    if (!nombre.trim())             { Alert.alert('Error', 'Introduce tu nombre'); return; }
    if (!telefono.trim() || !/^[0-9+\s]{9,15}$/.test(telefono))
                                    { Alert.alert('Error', 'Introduce un teléfono válido'); return; }
    if (!validarFecha(fecha))       { Alert.alert('Error', 'Introduce una fecha válida (a partir de mañana). Formato: DD/MM/AAAA'); return; }
    if (!validarHora(hora))         { Alert.alert('Error', 'Introduce una hora válida. Formato: HH:MM'); return; }

    // Convertir fecha de DD/MM/AAAA a AAAA-MM-DD
    const [d, m, a] = fecha.split('/');
    const fechaISO = `${a}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('solicitudes_revision')
        .insert([{
          id_vehiculo:      vehiculoId,
          marca_modelo:     vehiculoNombre,
          nombre_asistente: nombre,
          telefono,
          fecha_visita:     fechaISO,
          hora_visita:      hora,
        }]);
      if (error) throw error;

      Alert.alert(
        'Cita registrada',
        `Tu ${tipoCita === 'visita' ? 'visita' : 'cita de pago'} ha sido registrada. Nos pondremos en contacto contigo para confirmar.`,
        [{ text: 'Aceptar', onPress: () => navigation.navigate('ListVehiculos') }]
      );
    } catch(err: any) {
      Alert.alert('Error', err?.message || 'No se pudo registrar la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Header title="Reserva realizada" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Confirmación */}
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
          <Text style={styles.successTitle}>¡Reserva confirmada!</Text>
          <Text style={styles.successSub}>{vehiculoNombre}</Text>
        </View>

        <Text style={styles.infoText}>
          Para completar la compra, acuerda una visita al concesionario o un día para realizar el pago.
        </Text>

        {/* Selector tipo cita */}
        <Text style={styles.label}>Tipo de cita</Text>
        <View style={styles.tipoRow}>
          <TouchableOpacity
            style={[styles.tipoBtn, tipoCita === 'visita' && styles.tipoBtnActive]}
            onPress={() => setTipoCita('visita')}
          >
            <Ionicons name="calendar" size={20} color={tipoCita === 'visita' ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.tipoBtnText, tipoCita === 'visita' && styles.tipoBtnTextActive]}>
              Visita al{'\n'}concesionario
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tipoBtn, tipoCita === 'pago' && styles.tipoBtnActive]}
            onPress={() => setTipoCita('pago')}
          >
            <Ionicons name="card" size={20} color={tipoCita === 'pago' ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.tipoBtnText, tipoCita === 'pago' && styles.tipoBtnTextActive]}>
              Día para{'\n'}el pago
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        <Text style={styles.label}>Nombre del asistente *</Text>
        <Input
          placeholder="Tu nombre completo"
          value={nombre}
          onChangeText={setNombre}
          icon="person-outline"
        />

        <Text style={styles.label}>Teléfono de contacto *</Text>
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
          <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
          <Text style={styles.infoBoxText}>
            Nos pondremos en contacto contigo para confirmar la disponibilidad.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={() => navigation.navigate('ListVehiculos')}
            disabled={loading}
          >
            <Text style={styles.btnSecondaryText}>Decidir más tarde</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={handleConfirmar}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Ionicons name="checkmark" size={18} color="#fff" /><Text style={styles.btnPrimaryText}>Confirmar cita</Text></>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.primaryBackground } as ViewStyle,
  scroll:           { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg } as ViewStyle,
  successCard:      { alignItems: 'center', backgroundColor: Colors.secondaryBackground, borderRadius: 16, padding: spacing.xl, marginBottom: spacing.lg, gap: spacing.md } as ViewStyle,
  successTitle:     { fontSize: 20, fontWeight: '800', color: Colors.textPrimary } as TextStyle,
  successSub:       { fontSize: 14, color: Colors.textSecondary } as TextStyle,
  infoText:         { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, textAlign: 'center', marginBottom: spacing.xl } as TextStyle,
  label:            { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.lg } as TextStyle,
  tipoRow:          { flexDirection: 'row', gap: spacing.md } as ViewStyle,
  tipoBtn:          { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.secondaryBackground } as ViewStyle,
  tipoBtnActive:    { borderColor: Colors.primary, backgroundColor: Colors.primary } as ViewStyle,
  tipoBtnText:      { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 } as TextStyle,
  tipoBtnTextActive:{ color: '#fff' } as TextStyle,
  row:              { flexDirection: 'row', gap: spacing.md } as ViewStyle,
  rowItem:          { flex: 1 } as ViewStyle,
  infoBox:          { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: Colors.tertiaryBackground, borderRadius: 10, padding: spacing.md, marginTop: spacing.lg } as ViewStyle,
  infoBoxText:      { flex: 1, fontSize: 12, color: Colors.primary, lineHeight: 18 } as TextStyle,
  actions:          { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl } as ViewStyle,
  btn:              { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg, borderRadius: 14 } as ViewStyle,
  btnPrimary:       { backgroundColor: Colors.primary } as ViewStyle,
  btnPrimaryText:   { color: '#fff', fontWeight: '700', fontSize: 14 } as TextStyle,
  btnSecondary:     { backgroundColor: Colors.secondaryBackground, borderWidth: 1, borderColor: Colors.border } as ViewStyle,
  btnSecondaryText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 } as TextStyle,
});

export default CitaReservaScreen;