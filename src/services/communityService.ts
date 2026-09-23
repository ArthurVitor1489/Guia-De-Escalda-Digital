// Serviço de Autenticação, Perfis de Usuário e Comunidade Colaborativa
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, CommunityPhoto, CommunityBeta } from '../types/climbing';

const STORAGE_KEYS = {
  CURRENT_USER: '@guia_escalada:current_user',
  COMMUNITY_PHOTOS: '@guia_escalada:community_photos',
  COMMUNITY_BETAS: '@guia_escalada:community_betas',
};

// Perfil Padrão Inicial
export const DEFAULT_USER: UserProfile = {
  id: 'user-arthur-vitor',
  name: 'Arthur Vitor',
  username: 'arthur_climb',
  email: 'arthur@exemplo.com',
  city: 'Campina Grande',
  state: 'PB',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Escalador do Agreste e Sertão da Paraíba. Focado em vias esportivas na Pedra Furada e treinos na Pedra Escola e Rampa.',
  hardestGrade: '7c',
  memberSince: '2023',
  totalAscentsCount: 24,
  totalPhotosCount: 8,
};

// Fotos Iniciais da Comunidade (Algodão de Jandaíra e Campina Grande)
export const INITIAL_COMMUNITY_PHOTOS: CommunityPhoto[] = [
  {
    id: 'photo-comm-1',
    userId: 'user-arthur-vitor',
    userName: 'Arthur Vitor',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    userCity: 'Campina Grande - PB',
    routeId: 'route-pf-10',
    routeName: 'Turtle Roof (IXa)',
    wallName: 'Pedra Furada (Face Leste)',
    photoUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80',
    caption: 'Lances insanos no teto da Pedra Furada! A rocha aqui em Algodão é uma das mais estéticas do Brasil.',
    date: '15/09/2026',
    likesCount: 38,
  },
  {
    id: 'photo-comm-2',
    userId: 'user-caui',
    userName: 'Cauí Vieira',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    userCity: 'João Pessoa - PB',
    routeId: 'route-pf-14',
    routeName: 'Fogo na Babilônia (VIIIb)',
    wallName: 'Pedra Furada (Face Leste)',
    photoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    caption: 'Foto clássica da conquista da via no EENe. O granito claro com agarras de reglete puro.',
    date: '02/08/2024',
    likesCount: 52,
  },
  {
    id: 'photo-comm-3',
    userId: 'user-wolgrand',
    userName: 'Wolgrand Falcão',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    userCity: 'Campina Grande - PB',
    routeId: 'route-cg-1',
    routeName: 'Vento Nordestino (6º)',
    wallName: 'Pedra do Marinho',
    photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    caption: 'Fim de tarde na Pedra do Marinho em Campina Grande. Aderência máxima quando o sol baixa!',
    date: '10/08/2026',
    likesCount: 29,
  },
];

export const CommunityService = {
  // Retorna usuário atual
  async getCurrentUser(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  // Salva alterações no perfil
  async updateProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
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
    bio?: string;
  }): Promise<UserProfile> {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: userData.name,
      username: userData.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email: userData.email,
      city: userData.city,
      state: userData.state.toUpperCase(),
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: userData.bio || `Escalador(a) de ${userData.city} - ${userData.state.toUpperCase()}`,
      hardestGrade: '5º',
      memberSince: new Date().getFullYear().toString(),
      totalAscentsCount: 0,
      totalPhotosCount: 0,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  },

  // Retorna fotos postadas pela comunidade
  async getCommunityPhotos(routeId?: string, wallId?: string): Promise<CommunityPhoto[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COMMUNITY_PHOTOS);
      const allPhotos: CommunityPhoto[] = data ? JSON.parse(data) : INITIAL_COMMUNITY_PHOTOS;

      if (routeId) {
        return allPhotos.filter(p => p.routeId === routeId);
      }
      if (wallId) {
        return allPhotos.filter(p => p.wallId === wallId);
      }
      return allPhotos;
    } catch {
      return INITIAL_COMMUNITY_PHOTOS;
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

    // Atualiza contagem do usuário
    const user = await this.getCurrentUser();
    user.totalPhotosCount = (user.totalPhotosCount || 0) + 1;
    await this.updateProfile(user);

    return newPhoto;
  }
};
