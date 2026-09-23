// Integração com Supabase para Sincronização em Nuvem (PostgreSQL + Auth + Storage)
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClimbingDestination, CommunityPhoto, UserProfile, Route } from '../types/climbing';

// NOTA: Para conectar sua nuvem própria, crie um projeto gratuito em https://supabase.com
// e insira suas credenciais abaixo (ou via variáveis de ambiente .env):
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sua-chave-anon-publica';

// Inicializa o cliente Supabase com persistência offline via AsyncStorage
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const CloudSyncService = {
  // Verifica se as credenciais do Supabase foram configuradas
  isConfigured(): boolean {
    return (
      !SUPABASE_URL.includes('seu-projeto') &&
      !SUPABASE_ANON_KEY.includes('sua-chave')
    );
  },

  // Sincroniza uma nova falésia cadastrada em campo com a nuvem
  async syncDestinationToCloud(dest: ClimbingDestination): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('Modo Offline: Nuvem Supabase ainda não configurada, salvo localmente no dispositivo.');
      return false;
    }

    try {
      const { error: destError } = await supabase.from('destinations').upsert({
        id: dest.id,
        name: dest.name,
        state: dest.state,
        city: dest.sectors?.[0]?.city || '',
        description: dest.description,
        cover_image: dest.coverImage,
        rock_type: dest.rockType,
        total_routes: dest.totalRoutes,
        has_3d: dest.has3D,
      });

      if (destError) {
        console.warn('Erro ao sincronizar destino:', destError);
        return false;
      }

      // Sincroniza setores e paredes
      if (dest.sectors && dest.sectors.length > 0) {
        for (const sec of dest.sectors) {
          await supabase.from('sectors').upsert({
            id: sec.id,
            destination_id: dest.id,
            name: sec.name,
            crag_name: sec.cragName,
            latitude: sec.coordinates.latitude,
            longitude: sec.coordinates.longitude,
            elevation_meters: sec.elevationMeters,
            approach_time_minutes: sec.approachTimeMinutes,
            approach_trail_description: sec.approachTrailDescription,
          });

          for (const wall of sec.walls) {
            await supabase.from('walls').upsert({
              id: wall.id,
              sector_id: sec.id,
              name: wall.name,
              orientation: wall.orientation,
              height_meters: wall.heightMeters,
              rock_type: wall.rockType,
              fallback_photo_url: wall.fallbackPhotoUrl,
            });

            for (const route of wall.routes) {
              await supabase.from('routes').upsert({
                id: route.id,
                wall_id: wall.id,
                order_index: route.orderIndex,
                name: route.name,
                grade_br: route.grade.brazilian,
                grade_fr: route.grade.french,
                grade_yds: route.grade.yds,
                danger_rating: route.grade.danger,
                height_meters: route.heightMeters,
                bolts_count: route.boltsCount,
                protection_type: route.protectionType,
                style: route.style,
                description: route.description,
              });
            }
          }
        }
      }

      return true;
    } catch (e) {
      console.warn('Exceção ao sincronizar com nuvem:', e);
      return false;
    }
  },

  // Sincroniza foto da comunidade com a nuvem
  async syncCommunityPhotoToCloud(photo: CommunityPhoto): Promise<boolean> {
    if (!this.isConfigured()) return false;

    try {
      const { error } = await supabase.from('community_photos').insert({
        id: photo.id,
        user_id: photo.userId,
        user_name: photo.userName,
        user_avatar: photo.userAvatar,
        user_city: photo.userCity,
        route_id: photo.routeId || null,
        route_name: photo.routeName || null,
        wall_id: photo.wallId || null,
        wall_name: photo.wallName || null,
        photo_url: photo.photoUrl,
        caption: photo.caption,
        likes_count: photo.likesCount,
      });

      return !error;
    } catch {
      return false;
    }
  },

  // Busca fotos da comunidade da nuvem
  async fetchCloudPhotos(routeId?: string): Promise<CommunityPhoto[]> {
    if (!this.isConfigured()) return [];

    try {
      let query = supabase.from('community_photos').select('*').order('created_at', { ascending: false });
      if (routeId) {
        query = query.eq('route_id', routeId);
      }
      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((d: any) => ({
        id: d.id,
        userId: d.user_id,
        userName: d.user_name,
        userAvatar: d.user_avatar,
        userCity: d.user_city,
        routeId: d.route_id,
        routeName: d.route_name,
        wallId: d.wall_id,
        wallName: d.wall_name,
        photoUrl: d.photo_url,
        caption: d.caption,
        date: new Date(d.created_at).toLocaleDateString('pt-BR'),
        likesCount: d.likes_count,
      }));
    } catch {
      return [];
    }
  },
};
