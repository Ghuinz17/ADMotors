# 🏎️ AD Motor´s App

**Aplicación móvil para gestionar vehículos con imágenes, desarrollada con React Native y Supabase.**

[![Node.js](https://img.shields.io/badge/Node.js-v24.13.1-green)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.74.5-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0.39-black)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.45.1-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📱 Descripción

**AD Motors** es una aplicación móvil completa para **crear, editar, visualizar y eliminar vehículos** con sus correspondientes imágenes. La aplicación está optimizada para **iOS y Android** y utiliza **Supabase** como backend para almacenar datos e imágenes.

**Características principales:**
- ✅ Gestión CRUD completa de vehículos
- ✅ Carga de múltiples imágenes por vehículo
- ✅ Almacenamiento en la nube (Supabase Storage)
- ✅ Sincronización en tiempo real
- ✅ Autenticación anónima
- ✅ Interfaz intuitiva y responsive
- ✅ Compatible con iOS y Android

---

## 🎯 Características

### **Funcionalidades Principales**

| Función | Descripción |
|---------|------------|
| **Agregar Vehículo** | Crear nuevo vehículo con datos y múltiples imágenes |
| **Listar Vehículos** | Ver todos los vehículos registrados en el dispositivo |
| **Ver Detalles** | Visualizar información completa y galería de imágenes |
| **Editar Vehículo** | Modificar datos y agregar nuevas imágenes |
| **Eliminar Vehículo** | Remover vehículo e imágenes asociadas |

### **Campos de Vehículo**

- 📝 Marca y modelo
- 💰 Precio
- 📅 Año de fabricación
- ⛽ Tipo de combustible
- 🛣️ Kilometraje
- 🎨 Color
- 📸 Múltiples imágenes
- 📄 Descripción

---

## 🛠️ Tecnologías Utilizadas

### **Framework y Plataforma**
- React Native 0.74.5
- Expo 51.0.39
- TypeScript 5.3.3

### **Navegación**
- @react-navigation/native
- @react-navigation/native-stack
- @react-navigation/stack

### **Backend y Base de Datos**
- Supabase 2.45.1
- PostgreSQL (a través de Supabase)

### **Almacenamiento**
- Supabase Storage (imágenes en la nube)
- @react-native-async-storage/async-storage (almacenamiento local)

### **Procesamiento de Imágenes**
- expo-image-picker 15.1.0
- expo-image-manipulator 12.0.5

### **Utilidades**
- @expo/vector-icons 14.0.3 (Ionicons)
- react-native-safe-area-context 4.10.5
- react-native-screens 3.31.1
- react-native-gesture-handler 2.16.1
- expo-status-bar 1.12.1
- expo-font 12.0.10
- expo-system-ui 3.0.7
- base64-arraybuffer 1.0.2
- uuid (para generar IDs únicos)

---

## 📋 Requisitos Previos

Antes de instalar, asegúrate de tener:

- **Node.js** versión 24.13.1 o superior
- **npm** o **yarn**
- **Expo CLI** instalado globalmente
- **Cuenta de Supabase** (gratuita en [supabase.com](https://supabase.com))
- **Git** para clonar el repositorio

---


## 💻 Uso

### **Pantalla Principal (Home)**
- Acceso a opciones: Ver vehículos, Agregar vehículo

### **Listar Vehículos**
- Muestra todos los vehículos del dispositivo
- Toca un vehículo para ver detalles
- Desliza para eliminar (swipe)

### **Agregar/Editar Vehículo**
1. Ingresa los datos del vehículo
2. Selecciona imágenes de la galería o cámara
3. Presiona "Guardar"

### **Ver Detalles**
- Visualiza información del vehículo
- Galería de imágenes
- Opciones para editar o eliminar

---

## 🔐 Autenticación

La aplicación utiliza **autenticación anónima de Supabase**, lo que significa:

- ✅ No requiere login
- ✅ Cada dispositivo tiene un Device ID único
- ✅ Los datos se sincronizan automáticamente

---

## 📁 Estructura del Proyecto

El proyecto está organizado en la siguiente estructura:

- **src/** - Código fuente de la aplicación
  - **config/** - Configuración de servicios externos
  - **types/** - Definiciones de tipos TypeScript
  - **services/** - Servicios de negocio y comunicación con Supabase
  - **screens/** - Pantallas de la aplicación
  - **utils/** - Funciones utilitarias

- **assets/** - Recursos (imágenes, íconos, splash screen)
- **App.tsx** - Punto de entrada de la aplicación
- **app.json** - Configuración de Expo

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Antonio José Molero Pérez**

- GitHub: [@Ghuinz17](https://github.com/Ghuinz17)
- Email: ajmolero797@gmail.com

---

## 🙏 Colaboración con AD Motor´s

- AD Motor´s - (https://www.instagram.com/vehiculosadmotors)
