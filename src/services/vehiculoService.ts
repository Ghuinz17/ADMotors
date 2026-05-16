import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { Vehiculo, VehiculoFormData } from "../types";
import { AppStorage } from "../utils/storage";

const VEHICULOS_KEY = "@AD_MOTORS_VEHICULOS";

export const VehiculoService = {
  /**
   * Obtener todos los vehículos del almacenamiento local
   */
  async getVehiculos(): Promise<Vehiculo[]> {
    try {
      const data = await AsyncStorage.getItem(VEHICULOS_KEY);

      if (!data) {
        console.log("No hay vehículos en caché local");
        return [];
      }

      const vehiculos = JSON.parse(data);
      console.log(`Vehículos obtenidos del caché: ${vehiculos.length}`);

      return vehiculos;
    } catch (error) {
      console.error("Error al obtener vehículos:", error);
      return [];
    }
  },

  /**
   * Obtener vehículo por ID del almacenamiento local
   */
  async getVehiculoById(id: string): Promise<Vehiculo | null> {
    try {
      const vehiculos = await this.getVehiculos();
      const vehiculo = vehiculos.find((v) => v.id_vehiculo === id);

      if (!vehiculo) {
        console.warn(`Vehículo ${id} no encontrado en caché`);
        return null;
      }

      return vehiculo;
    } catch (error) {
      console.error("Error al obtener vehículo:", error);
      return null;
    }
  },

  /**
   * Guardar vehículo en almacenamiento local
   */
  async saveVehiculo(vehiculo: Vehiculo): Promise<Vehiculo> {
    try {
      const vehiculos = await this.getVehiculos();

      // Si no tiene ID, generar uno
      if (!vehiculo.id_vehiculo) {
        vehiculo.id_vehiculo = uuidv4();
      }

      const index = vehiculos.findIndex(
        (v) => v.id_vehiculo === vehiculo.id_vehiculo,
      );

      if (index >= 0) {
        vehiculos[index] = vehiculo;
        console.log(`Vehículo actualizado en caché: ${vehiculo.id_vehiculo}`);
      } else {
        vehiculos.push(vehiculo);
        console.log(`Vehículo guardado en caché: ${vehiculo.id_vehiculo}`);
      }

      await AsyncStorage.setItem(VEHICULOS_KEY, JSON.stringify(vehiculos));
      await AppStorage.setVehiculosCache(vehiculos);

      return vehiculo;
    } catch (error) {
      console.error("Error al guardar vehículo:", error);
      throw error;
    }
  },

  /**
   * Crear nuevo vehículo
   */
  async createVehiculo(vehiculo: Vehiculo): Promise<Vehiculo> {
    return this.saveVehiculo(vehiculo);
  },

  /**
   * Actualizar vehículo
   */
  async updateVehiculo(
    id: string,
    vehiculo: Vehiculo,
  ): Promise<Vehiculo | null> {
    try {
      vehiculo.id_vehiculo = id;
      return await this.saveVehiculo(vehiculo);
    } catch (error) {
      console.error("Error al actualizar vehículo:", error);
      return null;
    }
  },

  /**
   * Eliminar vehículo
   */
  async deleteVehiculo(id: string): Promise<boolean> {
    try {
      const vehiculos = await this.getVehiculos();
      const filteredVehiculos = vehiculos.filter((v) => v.id_vehiculo !== id);

      await AsyncStorage.setItem(
        VEHICULOS_KEY,
        JSON.stringify(filteredVehiculos),
      );
      console.log(`Vehículo eliminado del caché: ${id}`);

      return true;
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      return false;
    }
  },

  /**
   * Filtrar vehículos por criterios
   */
  async filterVehiculos(criterios: {
    marca?: string;
    precioMin?: number;
    precioMax?: number;
    combustible?: string;
  }): Promise<Vehiculo[]> {
    try {
      let vehiculos = await this.getVehiculos();

      if (criterios.marca) {
        vehiculos = vehiculos.filter((v) =>
          `${v.marca} ${v.modelo}`
            .toLowerCase()
            .includes(criterios.marca!.toLowerCase()),
        );
      }

      if (criterios.precioMin !== undefined) {
        vehiculos = vehiculos.filter((v) => v.precio >= criterios.precioMin!);
      }

      if (criterios.precioMax !== undefined) {
        vehiculos = vehiculos.filter((v) => v.precio <= criterios.precioMax!);
      }

      if (criterios.combustible) {
        vehiculos = vehiculos.filter(
          (v) => v.tipo_combustible === criterios.combustible,
        );
      }

      console.log(`${vehiculos.length} vehículos encontrados`);
      return vehiculos;
    } catch (error) {
      console.error("Error al filtrar vehículos:", error);
      return [];
    }
  },

  /**
   * Ordenar vehículos
   */
  async sortVehiculos(
    sortBy: "precio" | "fecha" | "marca",
  ): Promise<Vehiculo[]> {
    try {
      const vehiculos = await this.getVehiculos();

      switch (sortBy) {
        case "precio":
          vehiculos.sort((a, b) => a.precio - b.precio);
          break;
        case "fecha":
          vehiculos.sort((a, b) => {
            const fechaA = new Date(a.fecha_creacion || "").getTime();
            const fechaB = new Date(b.fecha_creacion || "").getTime();
            return fechaB - fechaA;
          });
          break;
        case "marca":
          vehiculos.sort((a, b) =>
            `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`),
          );
          break;
      }

      return vehiculos;
    } catch (error) {
      console.error("Error al ordenar vehículos:", error);
      return [];
    }
  },

  /**
   * Obtener estadísticas de vehículos
   */
  async getEstadisticas(): Promise<{
    total: number;
    precioPromedio: number;
    precioMin: number;
    precioMax: number;
    porMarca: Record<string, number>;
  }> {
    try {
      const vehiculos = await this.getVehiculos();

      if (vehiculos.length === 0) {
        return {
          total: 0,
          precioPromedio: 0,
          precioMin: 0,
          precioMax: 0,
          porMarca: {},
        };
      }

      const precios = vehiculos.map((v) => v.precio);
      const precioPromedio =
        precios.reduce((a, b) => a + b, 0) / precios.length;
      const precioMin = Math.min(...precios);
      const precioMax = Math.max(...precios);

      const porMarca: Record<string, number> = {};
      vehiculos.forEach((v) => {
        const marca = `${v.marca} ${v.modelo}`.split(" ")[0];
        porMarca[marca] = (porMarca[marca] || 0) + 1;
      });

      return {
        total: vehiculos.length,
        precioPromedio,
        precioMin,
        precioMax,
        porMarca,
      };
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      return {
        total: 0,
        precioPromedio: 0,
        precioMin: 0,
        precioMax: 0,
        porMarca: {},
      };
    }
  },

  /**
   * Sincronizar con base de datos 
   */
  async syncWithServer(vehiculosRemote: Vehiculo[]): Promise<void> {
    try {
      const vehiculosLocal = await this.getVehiculos();

      // Combinar locales y remotos
      const combinados = [...vehiculosLocal];

      vehiculosRemote.forEach((remoto) => {
        const existe = combinados.findIndex(
          (v) => v.id_vehiculo === remoto.id_vehiculo,
        );

        if (existe >= 0) {
          combinados[existe] = remoto;
        } else {
          combinados.push(remoto);
        }
      });

      await AsyncStorage.setItem(VEHICULOS_KEY, JSON.stringify(combinados));
      await AppStorage.setLastSyncTime(new Date().toISOString());

      console.log(`Sincronización completada: ${combinados.length} vehículos`);
    } catch (error) {
      console.error("Error al sincronizar:", error);
    }
  },

  /**
   * Limpiar todos los vehículos del caché
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(VEHICULOS_KEY);
      console.log("Caché de vehículos limpiado");
    } catch (error) {
      console.error("Error al limpiar caché:", error);
    }
  },

  /**
   * Obtener Device ID
   */
  async getDeviceId(): Promise<string> {
    return AppStorage.getDeviceId();
  },
};
