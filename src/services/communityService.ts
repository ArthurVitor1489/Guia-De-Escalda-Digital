// Serviço de Autenticação, Perfis de Usuário e Comunidade Colaborativa
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, CommunityPhoto, CommunityBeta } from '../types/climbing';

const STORAGE_KEYS = {
  CURRENT_USER: '@guia_escalada:current_user',
  REGISTERED_USERS: '@guia_escalada:registered_users',
  IS_LOGGED_OUT: '@guia_escalada:is_logged_out',
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

// Perfis Iniciais de Escaladores Cadastrados
export const INITIAL_REGISTERED_USERS: UserProfile[] = [
  DEFAULT_USER,
  {
    id: 'user-caui',
    name: 'Cauí Vieira',
    username: 'caui_eene',
    email: 'caui@escaladapb.org',
    city: 'João Pessoa',
    state: 'PB',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Conquistador de vias no EENe Algodão de Jandaíra e Brejo Paraibano. Apaixonado por móvel e bigwall.',
    hardestGrade: '8c',
    memberSince: '2013',
    totalAscentsCount: 42,
    totalPhotosCount: 15,
  },
  {
    id: 'user-wolgrand',
    name: 'Wolgrand Falcão',
    username: 'wolgrand_granito',
    email: 'wolgrand@campina.climb',
    city: 'Campina Grande',
    state: 'PB',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Desbravador das falésias de Campina Grande: Pedra Escola, A Rampa, Morcego e Pedra do Marinho.',
    hardestGrade: '8a',
    memberSince: '2015',
    totalAscentsCount: 56,
    totalPhotosCount: 22,
  },
  {
    id: 'user-maria-climb',
    name: 'Maria Clara Rocha',
    username: 'mclara_climb',
    email: 'mclara@nordesteclimb.com',
    city: 'Natal',
    state: 'RN',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    bio: 'Escaladora em Serra Caiada e Algodão de Jandaíra. Incentivadora da escalada feminina nordestina.',
    hardestGrade: '7a',
    memberSince: '2024',
    totalAscentsCount: 19,
    totalPhotosCount: 11,
  },
];

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
  // Retorna usuário atualmente autenticado (ou null se deslogado)
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const isLoggedOut = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_OUT);
      if (isLoggedOut === 'true') {
        return null;
      }

      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);

      // Na primeira execução, inicia logado com o perfil padrão
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  // Retorna todos os usuários cadastrados
  async getRegisteredUsers(): Promise<UserProfile[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    } catch {
      return INITIAL_REGISTERED_USERS;
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
      city: 'Campina Grande',
      state: 'PB',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      bio: 'Escalador cadastrado na comunidade CRUX.',
      hardestGrade: '6º',
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

    // Atualiza contagem do usuário se estiver logado
    const user = await this.getCurrentUser();
    if (user) {
      user.totalPhotosCount = (user.totalPhotosCount || 0) + 1;
      await this.updateProfile(user);
    }

    return newPhoto;
  },
};
