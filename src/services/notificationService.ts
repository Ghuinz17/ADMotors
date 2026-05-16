import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

// Solicitar permisos y obtener token
export async function registerForPushNotifications(): Promise<void> {
  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Permisos de notificación denegados');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('admotors', {
      name:        'AD Motors',
      importance:  Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:  '#2563EB',
      sound:       'default',
    });
  }

  console.log('Notificaciones configuradas correctamente');
}

// Enviar notificación local
export async function sendLocalNotification(title: string, body: string, data?: Record<string, unknown>): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data:  data || {} as Record<string, unknown>,
      sound: 'default',
    },
    trigger: null,
  });
}

// Escuchar cambios en solicitudes_revision y notificar
let subscriptionRevisiones: any = null;
let subscriptionCompras: any    = null;

export function startListeningNotifications(): void {
  // Nuevas solicitudes de visita
  subscriptionRevisiones = supabase
    .channel('solicitudes-nuevas')
    .on('postgres_changes', {
      event:  'INSERT',
      schema: 'public',
      table:  'solicitudes_revision',
    }, (payload) => {
      const s    = payload.new as any;
      const tipo = s.tipo === 'pago' ? 'cita de pago' : 'visita';
      const veh  = s.marca_modelo || 'Vehículo';
      sendLocalNotification(
        `Nueva solicitud de ${tipo}`,
        `${s.nombre_asistente} quiere ver ${veh} el ${formatFechaNotif(s.fecha_visita)} a las ${s.hora_visita?.slice(0,5) || '—'}`
      );
    })
    .subscribe();

  // Nuevas reservas (compras)
  subscriptionCompras = supabase
    .channel('compras-nuevas')
    .on('postgres_changes', {
      event:  'INSERT',
      schema: 'public',
      table:  'compra',
    }, (payload) => {
      const c = payload.new as any;
      sendLocalNotification(
        'Nueva reserva recibida',
        `Se ha realizado una nueva reserva. Pedido: ${c.id_compra?.slice(0,8).toUpperCase() || '—'}`
      );
    })
    .subscribe();
}

export function stopListeningNotifications(): void {
  subscriptionRevisiones?.unsubscribe();
  subscriptionCompras?.unsubscribe();
}

function formatFechaNotif(fecha: string): string {
  if (!fecha) return '—';
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}