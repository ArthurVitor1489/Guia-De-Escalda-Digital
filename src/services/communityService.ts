// Serviço de Autenticação, Perfis de Usuário e Comunidade Colaborativa (Base Limpa)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, CommunityPhoto } from '../types/climbing';

const STORAGE_KEYS = {
  CURRENT_USER: '@guia_escalada_v2:current_user',
  REGISTERED_USERS: '@guia_escalada_v2:registered_users',
  IS_LOGGED_OUT: '@guia_escalada_v2:is_logged_out',
  COMMUNITY_PHOTOS: '@guia_escalada_v2:community_photos',
  COMMUNITY_BETAS: '@guia_escalada_v2:community_betas',
};

// Perfil Padrão Vazio (usado apenas como referência caso necessário)
export const DEFAULT_USER: UserProfile = {
  id: 'user-default',
  name: 'Escalador',
  username: 'escalador',
  email: '',
  city: '',
  state: 'PB',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: '',
  hardestGrade: '5º',
  memberSince: new Date().getFullYear().toString(),
  totalAscentsCount: 0,
  totalPhotosCount: 0,
};

export const INITIAL_REGISTERED_USERS: UserProfile[] = [];

export const INITIAL_COMMUNITY_PHOTOS: CommunityPhoto[] = [];

export const CommunityService = {
  // Retorna usuário atualmente autenticado (ou null se ainda não cadastrou/logou)
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const isLoggedOut = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_OUT);
      if (isLoggedOut === 'true') {
        return null;
      }

      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);

      return null;
    } catch {
      return null;
    }
  },

  // Retorna todos os usuários cadastrados
  async getRegisteredUsers(): Promise<UserProfile[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (data) return JSON.parse(data);
      return [];
    } catch {
      return [];
    }
  },

  // Login de usuário por e-mail ou @username
  async login(identifier: string): Promise<UserProfile> {
    const cleanId = identifier.trim().toLowerCase().replace(/^@/, '');
    const users = await this.getRegisteredUsers();

    const existing = users.find(
      u => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );

    const userToLogin = existing || {
      id: `user-${Date.now()}`,
      name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
      username: cleanId.replace(/[^a-z0-9_]/g, ''),
      email: identifier.includes('@') ? identifier : `${cleanId}@crux.app`,
      city: '',
      state: 'PB',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: 'Escalador cadastrado na comunidade.',
      hardestGrade: '5º',
      memberSince: new Date().getFullYear().toString(),
      totalAscentsCount: 0,
      totalPhotosCount: 0,
    };

    if (!existing) {
      const updatedUsers = [userToLogin, ...users];
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updatedUsers));
    }

    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userToLogin));
    await AsyncStorage.removeItem(STORAGE_KEYS.IS_LOGGED_OUT);
    return userToLogin;
  },

  // Logout / Sair da Conta
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_OUT, 'true');
    } catch (e) {
      console.warn('Erro ao fazer logout:', e);
    }
  },

  // Salva alterações no perfil
  async updateProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
      const users = await this.getRegisteredUsers();
      const updated = users.map(u => (u.id === profile.id ? profile : u));
      if (!updated.some(u => u.id === profile.id)) {
        updated.unshift(profile);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao atualizar perfil:', e);
    }
  },

  // Cadastro de novo escalador
  async registerUser(userData: {
    name: string;
    username: string;
    email: string;
    city: string;
    state: string;
    avatarUrl?: string;
    bio?: string;
  }): Promise<UserProfile> {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: userData.name,
      username: userData.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email: userData.email,
      city: userData.city,
      state: userData.state.toUpperCase(),
      avatarUrl:
        userData.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: userData.bio || `Escalador(a) de ${userData.city} - ${userData.state.toUpperCase()}`,
      hardestGrade: '5º',
      memberSince: new Date().getFullYear().toString(),
      totalAscentsCount: 0,
      totalPhotosCount: 0,
    };

    const users = await this.getRegisteredUsers();
    const updatedUsers = [newUser, ...users.filter(u => u.id !== newUser.id)];
    await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updatedUsers));
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    await AsyncStorage.removeItem(STORAGE_KEYS.IS_LOGGED_OUT);
    return newUser;
  },

  // Retorna fotos postadas pela comunidade
  async getCommunityPhotos(routeId?: string, wallId?: string): Promise<CommunityPhoto[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COMMUNITY_PHOTOS);
      const allPhotos: CommunityPhoto[] = data ? JSON.parse(data) : [];

      if (routeId) {
        return allPhotos.filter(p => p.routeId === routeId);
      }
      if (wallId) {
        return allPhotos.filter(p => p.wallId === wallId);
      }
      return allPhotos;
    } catch {
      return [];
    }
  },

  // Publicar nova foto da via / pedra
  async addCommunityPhoto(photo: Omit<CommunityPhoto, 'id' | 'date' | 'likesCount'>): Promise<CommunityPhoto> {
    const current = await this.getCommunityPhotos();
    const newPhoto: CommunityPhoto = {
      ...photo,
      id: `photo-comm-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      likesCount: 1,
    };
    const updated = [newPhoto, ...current];
    await AsyncStorage.setItem(STORAGE_KEYS.COMMUNITY_PHOTOS, JSON.stringify(updated));

    // Atualiza contagem do usuário se estiver logado
    const user = await this.getCurrentUser();
    if (user) {
      user.totalPhotosCount = (user.totalPhotosCount || 0) + 1;
      await this.updateProfile(user);
    }

    return newPhoto;
  },
};
