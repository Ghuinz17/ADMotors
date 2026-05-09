# 📱 AD Motor's — App de Administración

**Aplicación móvil Android para gestionar el catálogo de vehículos y las solicitudes de clientes, desarrollada con React Native y Expo.**

[![Node.js](https://img.shields.io/badge/Node.js-v24.13.1-green)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.74.5-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0.39-black)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.45.1-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 Descripción

**AD Motor's App** es la herramienta de administración del concesionario. Permite al personal gestionar el catálogo de vehículos completo, revisar y gestionar las solicitudes de visita de los clientes, y controlar el estado de las reservas, todo desde el móvil.

---

## ✅ Características principales

- 🚗 Gestión completa de vehículos — crear, editar, ver y eliminar
- 📸 Carga de múltiples imágenes por vehículo (galería y cámara)
- 📅 Gestión de solicitudes de visita — aceptar, rechazar o contactar al cliente
- 📞 Contacto directo con el cliente por llamada o WhatsApp
- 🔒 Control de reservas — republicar vehículos cuando una reserva no se completa
- 🏷️ Visualización del estado de cada vehículo (disponible / reservado)
- 🔄 Actualización en tiempo real mediante pull-to-refresh

---

## 🛠️ Tecnologías utilizadas

### Framework y plataforma
- React Native 0.74.5
- Expo 51.0.39
- TypeScript 5.3.3

### Navegación
- @react-navigation/native
- @react-navigation/native-stack

### Backend y base de datos
- Supabase 2.45.1
- PostgreSQL (a través de Supabase)

### Imágenes y multimedia
- expo-image-picker 15.1.0
- base64-arraybuffer 1.0.2

### Utilidades
- @expo/vector-icons 14.0.3 (Ionicons)
- react-native-safe-area-context 4.10.5
- react-native-screens 3.31.1
- expo-status-bar 1.12.1

---

## 📋 Requisitos previos

Antes de instalar, asegúrate de tener:

- **Node.js** versión 24.13.1 o superior
- **npm** o **yarn**
- **Expo CLI** instalado globalmente
- **Cuenta de Supabase** gratuita en [supabase.com](https://supabase.com)
- **Git** para clonar el repositorio

---

## 🚀 Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/Ghuinz17/ad-motors-app.git
cd ad-motors-app

# 2. Instala las dependencias
npm install --legacy-peer-deps

# 3. Configura las credenciales de Supabase
# Edita src/config/supabase.ts con tu URL y clave anónima

# 4. Inicia la app en modo desarrollo
npx expo start
```

---

## 📦 Build para Android

```bash
# Genera un APK de prueba
eas build --platform android --profile preview

# Genera un AAB para publicar en Play Store
eas build --platform android --profile production
```

---

## 💻 Uso

### Pantalla principal
Acceso directo a las tres secciones principales: lista de vehículos, añadir vehículo y solicitudes de visita.

### Gestión de vehículos
1. Accede a **Lista de vehículos** para ver todos los registros
2. Pulsa sobre un vehículo para ver sus detalles
3. Usa los botones **Editar** o **Eliminar** según necesites
4. Si el vehículo está reservado, aparece el botón **Republicar** para volver a hacerlo visible

### Añadir o editar vehículo
1. Rellena los datos del vehículo (marca, modelo, precio, año, combustible, kilometraje, color)
2. Selecciona imágenes desde la galería o toma fotos con la cámara
3. Pulsa **Guardar**

### Gestión de solicitudes de visita
1. Accede a **Solicitudes de visita** desde el menú principal
2. Filtra por estado: Todos, Pendientes, Confirmadas o Canceladas
3. Pulsa **Aceptar** o **Rechazar** para cambiar el estado
4. Pulsa **Contactar** para llamar al cliente o enviarle un mensaje de WhatsApp con los datos de la visita

---

## 📚 Documentación

- 📋 [Documentación técnica](docs/documentacion-tecnica.md)
- 👤 [Manual de usuario](docs/manual-usuario.md)
- ⚙️ [Manual de instalación](docs/manual-instalacion.md)

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Antonio José Molero Pérez**

- GitHub: [@Ghuinz17](https://github.com/Ghuinz17)
- Email: ajmolero797@gmail.com

---

## 🤝 Desarrollado para AD Motor's

Este proyecto ha sido desarrollado en colaboración con **AD Motor's**.

📸 **Instagram** — [vehiculosadmotors](https://www.instagram.com/vehiculosadmotors)  
👥 **Facebook** — [AD Motors](https://www.facebook.com/people/AD-Motors/61584583105868/)  
🎵 **TikTok** — Próximamente