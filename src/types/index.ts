// src/types/index.ts - Tipos actualizados

// Enums
export enum CombustibleType {
  GASOLINA = 'GASOLINA',
  DIESEL = 'DIESEL',
  ELECTRICO = 'ELECTRICO',
  HIBRIDO = 'HIBRIDO',
}

export enum EstadoCompra {
  PENDIENTE = 'PENDIENTE',
  PROCESANDO = 'PROCESANDO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  COMPLETADO = 'COMPLETADO',
  FALLIDO = 'FALLIDO',
  REEMBOLSADO = 'REEMBOLSADO',
}

// Interfaces principales
export interface Vehiculo {
  id_vehiculo: string;
  device_id: string;
  marca_modelo: string;
  descripcion?: string;
  precio: number;
  ano_fabricacion: number;
  tipo_combustible: CombustibleType;
  kilometraje: number;
  color?: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface VehiculoFormData {
  marca_modelo: string;
  descripcion: string;
  precio: string;
  ano_fabricacion: string;
  tipo_combustible: CombustibleType;
  kilometraje: string;
  imagenes: string[];
  color: string;
}

export interface VehiculoImagen {
  id_imagen: string;
  id_vehiculo: string;
  imagen: string;
  created_at: string;
}

export interface Usuario {
  id_usuario: string;
  nombre: string;
  email: string;
  telefono?: string;
  fecha_creacion: string;
}

export interface MetodoPago {
  id_metodo: string;
  nombre: string;
  tipo: string;
  activo: boolean;
}

export interface Compra {
  id_compra: string;
  id_vehiculo: string;
  id_usuario: string;
  precio_final: number;
  estado: EstadoCompra;
  fecha_compra: string;
  fecha_entrega?: string;
}

export interface DetalleCompra {
  id_detalle: string;
  id_compra: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Pago {
  id_pago: string;
  id_compra: string;
  id_metodo: string;
  monto: number;
  estado: EstadoPago;
  fecha_pago: string;
  referencia?: string;
}

export interface Administrador {
  id_admin: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface EstadisticasVehiculos {
  total: number;
  precioPromedio: number;
  precioMin: number;
  precioMax: number;
  porMarca: Record<string, number>;
}

// Tipos de utilidad
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// Tipos de navegación
export type RootStackParamList = {
  Home: undefined;
  ListVehiculos: undefined;
  AnadirVehiculo: undefined;
  EditarVehiculo: { vehiculoId: string };
  DetalleVehiculo: { vehiculoId: string };
};