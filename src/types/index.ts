// Tipos de datos base de datos

export enum CombustibleType {
  GASOLINA  = 'GASOLINA',
  DIESEL    = 'DIESEL',
  ELECTRICO = 'ELECTRICO',
  HIBRIDO   = 'HIBRIDO',
}

export enum EstadoCompra {
  PENDIENTE   = 'PENDIENTE',
  PROCESANDO  = 'PROCESANDO',
  COMPLETADA  = 'COMPLETADA',
  CANCELADA   = 'CANCELADA',
}

export enum EstadoPago {
  PENDIENTE   = 'PENDIENTE',
  COMPLETADO  = 'COMPLETADO',
  FALLIDO     = 'FALLIDO',
  REEMBOLSADO = 'REEMBOLSADO',
}

export interface Vehiculo {
  id_vehiculo:       string;
  device_id?:        string;
  marca:             string;   
  modelo:            string;   
  descripcion?:      string;
  precio:            number;
  ano_fabricacion:   number;
  tipo_combustible:  CombustibleType;
  kilometraje:       number;
  color?:            string;
  reservado?:        boolean;
  fecha_reserva?:    string;
  fecha_creacion:    string;
  fecha_actualizacion?: string;
}

export interface VehiculoFormData {
  marca:             string;
  modelo:            string;
  descripcion:       string;
  precio:            string;
  ano_fabricacion:   string;
  tipo_combustible:  CombustibleType;
  kilometraje:       string;
  imagenes:          string[];
  color:             string;
}

export interface VehiculoImagen {
  id_imagen:   string;
  id_vehiculo: string;
  imagen:      string;
  created_at:  string;
}

export interface Usuario {
  id_usuario:    string;
  nombre:        string;
  email:         string;
  telefono?:     string;
  fecha_creacion: string;
}

export interface Compra {
  id_compra:    string;
  id_vehiculo:  string;
  id_usuario:   string;
  precio_final: number;
  estado:       EstadoCompra;
  fecha_compra: string;
  fecha_entrega?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?:   T;
  error?:  string;
  message?: string;
}

export type RootStackParamList = {
  Home:            undefined;
  ListVehiculos:   undefined;
  AnadirVehiculo:  undefined;
  EditarVehiculo:  { vehiculoId: string };
  DetalleVehiculo: { vehiculoId: string };
  Solicitudes:     undefined;
};