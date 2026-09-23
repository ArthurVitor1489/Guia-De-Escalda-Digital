// Gerenciamento de Armazenamento Local e Offline
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AscentLog, Sector, ClimbingDestination } from '../types/climbing';
import { INITIAL_LOGBOOK_ENTRIES, MOCK_SECTORS } from './mockData';

const STORAGE_KEYS = {
  LOGBOOK: '@guia_escalada:logbook',
  FAVORITES: '@guia_escalada:favorites',
  OFFLINE_SECTORS: '@guia_escalada:offline_sectors',
  CUSTOM_DESTINATIONS: '@guia_escalada:custom_destinations',
  USER_PREFERENCES: '@guia_escalada:preferences',
};

export interface UserPreferences {
  gradeSystem: 'brazilian' | 'french' | 'yds';
  autoRotate3D: boolean;
  showSunSimulation: boolean;
  hapticFeedback: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  gradeSystem: 'brazilian',
  autoRotate3D: false,
  showSunSimulation: true,
  hapticFeedback: true,
};

export const StorageService = {
  async getPreferences(): Promise<UserPreferences> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  async savePreferences(prefs: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Erro ao salvar preferências:', e);
    }
  },

  async getLogbook(): Promise<AscentLog[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LOGBOOK);
      if (data) {
        return JSON.parse(data);
      }
      // Inicializa com dados de exemplo
      await AsyncStorage.setItem(STORAGE_KEYS.LOGBOOK, JSON.stringify(INITIAL_LOGBOOK_ENTRIES));
      return INITIAL_LOGBOOK_ENTRIES;
    } catch {
      return INITIAL_LOGBOOK_ENTRIES;
    }
  },

  async addAscent(log: Omit<AscentLog, 'id'>): Promise<AscentLog> {
    const logs = await this.getLogbook();
    const newLog: AscentLog = {
      ...log,
      id: `log-${Date.now()}`,
    };
    const updated = [newLog, ...logs];
    await AsyncStorage.setItem(STORAGE_KEYS.LOGBOOK, JSON.stringify(updated));
    return newLog;
  },

  async getFavorites(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async toggleFavorite(routeId: string): Promise<boolean> {
    const favs = await this.getFavorites();
    const index = favs.indexOf(routeId);
    let updated: string[];
    let isFavorited = false;
    if (index > -1) {
      updated = favs.filter(id => id !== routeId);
    } else {
      updated = [...favs, routeId];
      isFavorited = true;
    }
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return isFavorited;
  },

  async getAllSectors(): Promise<Sector[]> {
    // No futuro, integra com Supabase/API remota e faz sincronização
    return MOCK_SECTORS;
  },

  async getCustomDestinations(): Promise<ClimbingDestination[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_DESTINATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveCustomDestination(newDest: ClimbingDestination): Promise<ClimbingDestination[]> {
    try {
      const current = await this.getCustomDestinations();
      const updated = [newDest, ...current.filter(d => d.id !== newDest.id)];
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_DESTINATIONS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Erro ao salvar novo destino:', e);
      return [];
    }
  },

  async updateDestination(updatedDest: ClimbingDestination): Promise<void> {
    try {
      const current = await this.getCustomDestinations();
      const index = current.findIndex(d => d.id === updatedDest.id);
      let updated: ClimbingDestination[];
      if (index >= 0) {
        updated = current.map(d => (d.id === updatedDest.id ? updatedDest : d));
      } else {
        updated = [updatedDest, ...current];
      }
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_DESTINATIONS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao atualizar destino:', e);
    }
  },

  async addSectorToDestination(destId: string, newSector: Sector, baseDestination?: ClimbingDestination): Promise<ClimbingDestination | null> {
    try {
      const current = await this.getCustomDestinations();
      let targetDest = current.find(d => d.id === destId);
      
      if (!targetDest && baseDestination) {
        targetDest = JSON.parse(JSON.stringify(baseDestination));
      }

      if (!targetDest) return null;

      const sectors = targetDest.sectors || [];
      const updatedSectors = [...sectors, newSector];
      const updatedDest: ClimbingDestination = {
        ...targetDest,
        sectors: updatedSectors,
        totalSectors: updatedSectors.length,
        totalRoutes: updatedSectors.reduce((acc, s) => acc + (s.walls?.reduce((wAcc, w) => wAcc + (w.routes?.length || 0), 0) || 0), 0),
        highlights: targetDest.highlights?.includes(newSector.name) 
          ? targetDest.highlights 
          : [...(targetDest.highlights || []), newSector.name],
      };

      await this.saveCustomDestination(updatedDest);
      return updatedDest;
    } catch (e) {
      console.warn('Erro ao adicionar setor ao destino:', e);
      return null;
    }
  },

  async addRouteToSector(
    destId: string, 
    sectorId: string, 
    wallId: string, 
    newRoute: Route,
    baseDestination?: ClimbingDestination
  ): Promise<ClimbingDestination | null> {
    try {
      const current = await this.getCustomDestinations();
      let targetDest = current.find(d => d.id === destId);

      if (!targetDest && baseDestination) {
        targetDest = JSON.parse(JSON.stringify(baseDestination));
      }

      if (!targetDest) return null;

      const updatedSectors = (targetDest.sectors || []).map(sec => {
        if (sec.id !== sectorId) return sec;
        const updatedWalls = (sec.walls || []).map(w => {
          if (w.id !== wallId) return w;
          const currentRoutes = w.routes || [];
          return {
            ...w,
            routes: [...currentRoutes, newRoute],
          };
        });
        return {
          ...sec,
          walls: updatedWalls,
        };
      });

      const updatedDest: ClimbingDestination = {
        ...targetDest,
        sectors: updatedSectors,
        hasBoulder: targetDest.hasBoulder || newRoute.style === 'boulder',
        hasSport: targetDest.hasSport || newRoute.style === 'esportiva',
        hasTrad: targetDest.hasTrad || newRoute.style === 'tradicional',
        totalRoutes: updatedSectors.reduce((acc, s) => acc + (s.walls?.reduce((wAcc, w) => wAcc + (w.routes?.length || 0), 0) || 0), 0),
      };

      await this.saveCustomDestination(updatedDest);
      return updatedDest;
    } catch (e) {
      console.warn('Erro ao adicionar via ao setor:', e);
      return null;
    }
  }
};

