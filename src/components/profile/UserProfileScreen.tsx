// Tela de Perfil do Escalador — CRUX Plataforma Colaborativa
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { UserProfile, AscentLog, CommunityPhoto, ClimbingDestination } from '../../types/climbing';
import {
  Award,
  Camera,
  MapPin,
  Calendar,
  Share2,
  Users,
  ImagePlus,
  Plus,
  Compass,
  Star,
  Flame,
  CheckCircle2,
  Sparkles,
  Mountain,
} from 'lucide-react-native';
import { getGradeBadgeColor } from '../../services/gradeConverter';
import { DEFAULT_USER } from '../../services/communityService';

interface UserProfileScreenProps {
  user: UserProfile;
  logs: AscentLog[];
  communityPhotos: CommunityPhoto[];
  customDestinations: ClimbingDestination[];
  onOpenAuthModal: () => void;
  onOpenPostPhoto: () => void;
  onOpenCreateCrag: () => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  user,
  logs,
  communityPhotos,
  customDestinations,
  onOpenAuthModal,
  onOpenPostPhoto,
  onOpenCreateCrag,
}) => {
  const [activeTab, setActiveTab] = useState<'ascents' | 'photos' | 'crags'>('ascents');

  const safeUser = user || DEFAULT_USER;
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safePhotos = Array.isArray(communityPhotos) ? communityPhotos : [];
  const safeDestinations = Array.isArray(customDestinations) ? customDestinations : [];

  // Filtra fotos postadas pelo usuário atual
  const userPhotos = safePhotos.filter(p => p && p.userId === safeUser.id);

  // Calcula estatísticas
  const onsightCount = safeLogs.filter(l => l && l.style === 'onsight').length;
  const flashCount = safeLogs.filter(l => l && l.style === 'flash').length;
  const redpointCount = safeLogs.filter(l => l && l.style === 'redpoint').length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner Superior & Header do Perfil */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  safeUser.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
              }}
              style={styles.avatarImg}
            />
            <View style={styles.verifiedBadge}>
              <CheckCircle2 size={14} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.switchUserBtn}
              onPress={onOpenAuthModal}
              activeOpacity={0.8}
            >
              <Users size={14} color="#38BDF8" />
              <Text style={styles.switchUserText}>Trocar / Criar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.userName}>{safeUser.name || 'Escalador'}</Text>
        <Text style={styles.userHandle}>@{safeUser.username || 'escalador'}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MapPin size={13} color="#38BDF8" />
            <Text style={styles.metaText}>
              {safeUser.city || 'Campina Grande'}, {safeUser.state || 'PB'}
            </Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <View style={styles.metaItem}>
            <Calendar size={13} color="#94A3B8" />
            <Text style={styles.metaText}>No CRUX desde {safeUser.memberSince || '2023'}</Text>
          </View>
        </View>

        {safeUser.bio ? (
          <Text style={styles.bioText}>{safeUser.bio}</Text>
        ) : null}

        {/* Destaque de Maior Grau */}
        <View style={styles.hardestGradeCard}>
          <Flame size={18} color="#F59E0B" />
          <View style={styles.hardestGradeInfo}>
            <Text style={styles.hardestGradeLabel}>CADENA MAIS DURA</Text>
            <Text style={styles.hardestGradeValue}>{safeUser.hardestGrade || '7a'}</Text>
          </View>
          <View style={styles.hardestGradeTag}>
            <Text style={styles.hardestGradeTagText}>ESPORTIVA</Text>
          </View>
        </View>

        {/* Grid de Estatísticas Gerais */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{safeLogs.length}</Text>
            <Text style={styles.statLabel}>Cadenas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userPhotos.length}</Text>
            <Text style={styles.statLabel}>Fotos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{safeDestinations.length}</Text>
            <Text style={styles.statLabel}>Pedras</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{onsightCount}</Text>
            <Text style={styles.statLabel}>A Vista</Text>
          </View>
        </View>
      </View>

      {/* Abas de Navegação Interna */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'ascents' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ascents')}
        >
          <Award size={16} color={activeTab === 'ascents' ? '#10B981' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'ascents' && styles.tabButtonTextActive]}>
            Cadenas ({safeLogs.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'photos' && styles.tabButtonActive]}
          onPress={() => setActiveTab('photos')}
        >
          <Camera size={16} color={activeTab === 'photos' ? '#38BDF8' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'photos' && styles.tabButtonTextActive]}>
            Fotos & Betas ({userPhotos.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'crags' && styles.tabButtonActive]}
          onPress={() => setActiveTab('crags')}
        >
          <Mountain size={16} color={activeTab === 'crags' ? '#F59E0B' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'crags' && styles.tabButtonTextActive]}>
            Pedras ({safeDestinations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo da Aba 1: Cadenas & Diário */}
      {activeTab === 'ascents' && (
        <View style={styles.sectionContainer}>
          {safeLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <Award size={40} color="#334155" />
              <Text style={styles.emptyStateTitle}>Nenhuma cadena registrada</Text>
              <Text style={styles.emptyStateSub}>
                Abra uma via no Guia da Parede e clique em "Registrar Cadena" para alimentar seu logbook!
              </Text>
            </View>
          ) : (
            <View style={styles.ascentsList}>
              {safeLogs.map((log) => {
                const gradeStr = log.gradeStr || (log as any).routeGrade || '5º';
                const gradeColor = getGradeBadgeColor(gradeStr);
                const ratingStars = log.ratingStars || (log as any).rating || 5;
                const notes = log.personalNotes || (log as any).notes || '';
                const styleKey = log.style || 'redpoint';

                return (
                  <View key={log.id} style={styles.ascentCard}>
                    <View style={styles.ascentHeader}>
                      <View style={styles.ascentTitleGroup}>
                        <Text style={styles.ascentRouteName}>{log.routeName}</Text>
                        <Text style={styles.ascentLocation}>
                          {log.wallName} • {log.sectorName}
                        </Text>
                      </View>
                      <View style={[styles.ascentGradeBadge, { backgroundColor: gradeColor }]}>
                        <Text style={styles.ascentGradeText}>{gradeStr}</Text>
                      </View>
                    </View>

                    <View style={styles.ascentMetaRow}>
                      <View
                        style={[
                          styles.stylePill,
                          styleKey === 'onsight'
                            ? styles.styleOnsight
                            : styleKey === 'flash'
                            ? styles.styleFlash
                            : styles.styleRedpoint,
                        ]}
                      >
                        <Text style={styles.stylePillText}>{styleKey.toUpperCase()}</Text>
                      </View>

                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            color={s <= ratingStars ? '#F59E0B' : '#334155'}
                            fill={s <= ratingStars ? '#F59E0B' : 'transparent'}
                          />
                        ))}
                      </View>

                      <Text style={styles.ascentDate}>{log.date}</Text>
                    </View>

                    {notes ? (
                      <Text style={styles.ascentNotes}>"{notes}"</Text>
                    ) : null}

                    {log.partner ? (
                      <Text style={styles.ascentPartner}>🧗 Parceria: {log.partner}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Conteúdo da Aba 2: Fotos & Betas da Comunidade */}
      {activeTab === 'photos' && (
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.addPhotoBannerBtn}
            onPress={onOpenPostPhoto}
            activeOpacity={0.8}
          >
            <ImagePlus size={18} color="#0F172A" />
            <Text style={styles.addPhotoBannerText}>+ POSTAR NOVA FOTO / BETA</Text>
          </TouchableOpacity>

          {userPhotos.length === 0 ? (
            <View style={styles.emptyState}>
              <Camera size={40} color="#334155" />
              <Text style={styles.emptyStateTitle}>Nenhuma foto compartilhada ainda</Text>
              <Text style={styles.emptyStateSub}>
                Compartilhe fotos dos lances, agarras e paisagens das falésias para ajudar outros escaladores!
              </Text>
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {userPhotos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image source={{ uri: photo.photoUrl }} style={styles.photoCardImg} resizeMode="cover" />
                  <View style={styles.photoCardOverlay}>
                    {photo.routeName && (
                      <View style={styles.photoRouteTag}>
                        <Text style={styles.photoRouteTagText}>{photo.routeName}</Text>
                      </View>
                    )}
                    <Text style={styles.photoCaption} numberOfLines={2}>
                      {photo.caption || 'Foto da via'}
                    </Text>
                    <View style={styles.photoCardBottom}>
                      <Text style={styles.photoDate}>{photo.date}</Text>
                      <Text style={styles.photoLikes}>❤️ {photo.likesCount || 0}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Conteúdo da Aba 3: Pedras Cadastradas pelo Usuário */}
      {activeTab === 'crags' && (
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.addPhotoBannerBtn, { backgroundColor: '#F59E0B' }]}
            onPress={onOpenCreateCrag}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#0F172A" />
            <Text style={styles.addPhotoBannerText}>+ REGISTRAR NOVA PEDRA EM CAMPO</Text>
          </TouchableOpacity>

          {safeDestinations.length === 0 ? (
            <View style={styles.emptyState}>
              <Compass size={40} color="#334155" />
              <Text style={styles.emptyStateTitle}>Nenhuma pedra cadastrada por você</Text>
              <Text style={styles.emptyStateSub}>
                Descobriu uma rocha nova? Capture as coordenadas de GPS, tipo de rocha e fotos da falésia.
              </Text>
            </View>
          ) : (
            <View style={styles.cragsList}>
              {safeDestinations.map((dest) => {
                const cityName = dest.sectors?.[0]?.city || (dest as any).city || 'Paraíba';
                const routesCount = dest.totalRoutes || (dest as any).totalRoutesCount || 0;

                return (
                  <View key={dest.id} style={styles.customCragCard}>
                    <View style={styles.customCragHeader}>
                      <View>
                        <Text style={styles.customCragName}>{dest.name}</Text>
                        <Text style={styles.customCragLocation}>
                          {cityName}, {dest.state} • {routesCount} vias
                        </Text>
                      </View>
                      <View style={styles.customCragBadge}>
                        <Text style={styles.customCragBadgeText}>NOVO</Text>
                      </View>
                    </View>
                    <Text style={styles.customCragDesc} numberOfLines={2}>
                      {dest.description}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  headerCard: {
    backgroundColor: '#0F172A',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  switchUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  switchUserText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 13,
    color: '#38BDF8',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  metaDot: {
    color: '#475569',
  },
  bioText: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 14,
  },
  hardestGradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    gap: 12,
  },
  hardestGradeInfo: {
    flex: 1,
  },
  hardestGradeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hardestGradeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F59E0B',
  },
  hardestGradeTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hardestGradeTagText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#10B981',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  sectionContainer: {
    padding: 16,
  },
  addPhotoBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 10,
    marginBottom: 16,
  },
  addPhotoBannerText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  ascentsList: {
    gap: 10,
  },
  ascentCard: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ascentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ascentTitleGroup: {
    flex: 1,
  },
  ascentRouteName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ascentLocation: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  ascentGradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ascentGradeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  ascentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stylePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  styleOnsight: {
    backgroundColor: '#10B981',
  },
  styleFlash: {
    backgroundColor: '#38BDF8',
  },
  styleRedpoint: {
    backgroundColor: '#F59E0B',
  },
  stylePillText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ascentDate: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 'auto',
  },
  ascentNotes: {
    fontSize: 12,
    color: '#CBD5E1',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  ascentPartner: {
    fontSize: 11,
    color: '#94A3B8',
  },
  photosGrid: {
    gap: 12,
  },
  photoCard: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  photoCardImg: {
    width: '100%',
    height: '100%',
  },
  photoCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 10,
  },
  photoRouteTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  photoRouteTagText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '900',
  },
  photoCaption: {
    color: '#F8FAFC',
    fontSize: 12,
    marginBottom: 4,
  },
  photoCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoDate: {
    color: '#94A3B8',
    fontSize: 10,
  },
  photoLikes: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  cragsList: {
    gap: 10,
  },
  customCragCard: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  customCragHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  customCragName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  customCragLocation: {
    fontSize: 11,
    color: '#38BDF8',
    marginTop: 2,
  },
  customCragBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  customCragBadgeText: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '900',
  },
  customCragDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
});
