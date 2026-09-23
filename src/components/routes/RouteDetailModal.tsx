// Modal de Detalhes da Via de Escalada com Histórico, Proteções, Fotos da Comunidade e Logbook
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Route, CommunityPhoto } from '../../types/climbing';
import {
  X,
  Shield,
  Ruler,
  Anchor,
  UserCheck,
  AlertTriangle,
  Award,
  Bookmark,
  Share2,
  Calendar,
  Camera,
  ImagePlus,
  Heart,
} from 'lucide-react-native';
import { formatRouteGrade, getGradeBadgeColor, DANGER_EXPLANATIONS } from '../../services/gradeConverter';
import { ProtectionBadge } from '../common/EENeBadge';

interface RouteDetailModalProps {
  route: Route | null;
  onClose: () => void;
  onOpenLogbook: (route: Route) => void;
  preferredGradeSystem: 'brazilian' | 'french' | 'yds';
  communityPhotos?: CommunityPhoto[];
  onOpenPostPhoto?: (route: Route) => void;
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({
  route,
  onClose,
  onOpenLogbook,
  preferredGradeSystem,
  communityPhotos = [],
  onOpenPostPhoto,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);

  if (!route) return null;

  const gradeDisplay = formatRouteGrade(route, preferredGradeSystem);
  const badgeColor = getGradeBadgeColor(route.grade.brazilian);
  const routePhotos = communityPhotos.filter(p => p.routeId === route.id);
  const dangerInfo = route.grade.danger ? DANGER_EXPLANATIONS[route.grade.danger] : null;

  return (
    <Modal
      visible={!!route}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Barra de Arraste Superior */}
          <View style={styles.dragHandle} />

          {/* Cabeçalho da Via */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.badgeRow}>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderBadgeText}>Via #{route.orderIndex}</Text>
                </View>
                <ProtectionBadge type={route.protectionType} isProject={route.isProject} />
              </View>
              <Text style={styles.routeName}>{route.name}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Graduação em Destaque e Sistemas Equivalentes */}
          <View style={styles.gradeSection}>
            <View style={[styles.mainGradeBadge, { backgroundColor: badgeColor }]}>
              <Text style={styles.mainGradeText}>{gradeDisplay}</Text>
            </View>

            <View style={styles.gradeConversions}>
              <Text style={styles.gradeEquivText}>
                BR: <Text style={styles.gradeHighlight}>{route.grade.brazilian}</Text>
              </Text>
              <Text style={styles.gradeDivider}>•</Text>
              <Text style={styles.gradeEquivText}>
                FR: <Text style={styles.gradeHighlight}>{route.grade.french}</Text>
              </Text>
              <Text style={styles.gradeDivider}>•</Text>
              <Text style={styles.gradeEquivText}>
                YDS: <Text style={styles.gradeHighlight}>{route.grade.yds}</Text>
              </Text>
            </View>
          </View>

          {/* Conteúdo com Scroll */}
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Informações Técnicas Rápidas em Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Ruler size={16} color="#38BDF8" />
                <Text style={styles.metricLabel}>Extensão</Text>
                <Text style={styles.metricValue}>{route.heightMeters} m</Text>
              </View>

              <View style={styles.metricItem}>
                <Shield size={16} color="#10B981" />
                <Text style={styles.metricLabel}>Proteções</Text>
                <Text style={styles.metricValue}>{route.boltsCount} chapeletas</Text>
              </View>

              <View style={styles.metricItem}>
                <Anchor size={16} color="#F59E0B" />
                <Text style={styles.metricLabel}>Parada</Text>
                <Text style={styles.metricValue}>
                  {route.anchorType.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>

            {/* Aviso de Exposição / Segurança */}
            {dangerInfo && (
              <View style={[styles.dangerCard, { borderLeftColor: dangerInfo.badgeColor }]}>
                <View style={styles.dangerHeader}>
                  <AlertTriangle size={16} color={dangerInfo.badgeColor} />
                  <Text style={[styles.dangerTitle, { color: dangerInfo.badgeColor }]}>
                    {dangerInfo.title}
                  </Text>
                </View>
                <Text style={styles.dangerDescription}>{dangerInfo.description}</Text>
              </View>
            )}

            {/* Equipamentos Móveis Sugeridos (Rack) */}
            {route.rackRequired && (
              <View style={styles.rackBox}>
                <View style={styles.rackHeader}>
                  <Shield size={14} color="#FFE600" />
                  <Text style={styles.rackTitle}>RACK / EQUIPAMENTO MÓVEL SUGERIDO</Text>
                </View>
                <Text style={styles.rackText}>{route.rackRequired}</Text>
              </View>
            )}

            {/* Descrição e Beta */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>BETA & CARACTERÍSTICAS</Text>
              <Text style={styles.descriptionText}>{route.description}</Text>
              {route.safetyWarnings && (
                <Text style={styles.warningNote}>⚠️ {route.safetyWarnings}</Text>
              )}
            </View>

            {/* História, Primeira Ascensão e Abridores */}
            {(route.firstAscent || route.bolters) && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>HISTÓRICO & ABRIS</Text>
                {route.bolters && (
                  <View style={styles.historyRow}>
                    <UserCheck size={14} color="#94A3B8" />
                    <Text style={styles.historyText}>
                      <Text style={styles.historyBold}>Conquistadores:</Text>{' '}
                      {route.bolters.names.join(', ')} ({route.bolters.year || 'N/A'})
                    </Text>
                  </View>
                )}
                {route.firstAscent && (
                  <View style={styles.historyRow}>
                    <Award size={14} color="#F59E0B" />
                    <Text style={styles.historyText}>
                      <Text style={styles.historyBold}>Primeira Ascensão (FA):</Text>{' '}
                      {route.firstAscent.climbers?.join(', ')} ({route.firstAscent.year || 'N/A'})
                    </Text>
                  </View>
                )}
                {route.curiosities && (
                  <Text style={styles.curiosityText}>💡 {route.curiosities}</Text>
                )}
              </View>
            )}

            {/* Seção Colaborativa: Fotos da Comunidade & Betas Visuais */}
            <View style={styles.sectionBlock}>
              <View style={styles.communityHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>FOTOS DA COMUNIDADE ({routePhotos.length})</Text>
                  <Text style={styles.communitySub}>Registros colaborativos de outros escaladores nesta via</Text>
                </View>
                {onOpenPostPhoto && (
                  <TouchableOpacity
                    style={styles.postPhotoMiniBtn}
                    onPress={() => onOpenPostPhoto(route)}
                    activeOpacity={0.8}
                  >
                    <Camera size={13} color="#10B981" />
                    <Text style={styles.postPhotoMiniText}>+ Postar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {routePhotos.length === 0 ? (
                <View style={styles.emptyPhotosBox}>
                  <Camera size={28} color="#475569" />
                  <Text style={styles.emptyPhotosTitle}>Nenhuma foto desta via ainda</Text>
                  <Text style={styles.emptyPhotosSub}>
                    Seja o primeiro escalador a postar uma foto ou beta visual nesta via!
                  </Text>
                  {onOpenPostPhoto && (
                    <TouchableOpacity
                      style={styles.firstPhotoBtn}
                      onPress={() => onOpenPostPhoto(route)}
                      activeOpacity={0.8}
                    >
                      <ImagePlus size={14} color="#0F172A" />
                      <Text style={styles.firstPhotoBtnText}>COMPARTILHAR PRIMEIRA FOTO</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.communityPhotosList}>
                  {routePhotos.map((photo) => (
                    <View key={photo.id} style={styles.communityPhotoItem}>
                      <Image source={{ uri: photo.photoUrl }} style={styles.communityPhotoImg} />
                      <View style={styles.communityPhotoOverlay}>
                        <View style={styles.photoUserRow}>
                          <Image source={{ uri: photo.userAvatar }} style={styles.photoUserAvatar} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.photoUserName}>{photo.userName}</Text>
                            <Text style={styles.photoUserLocation}>{photo.userCity} • {photo.date}</Text>
                          </View>
                          <View style={styles.photoLikeBadge}>
                            <Heart size={12} color="#EF4444" fill="#EF4444" />
                            <Text style={styles.photoLikeCount}>{photo.likesCount}</Text>
                          </View>
                        </View>
                        {photo.caption ? (
                          <Text style={styles.photoCaptionText}>"{photo.caption}"</Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Rodapé com Ações */}
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={[styles.favoriteBtn, isFavorited && styles.favoriteBtnActive]}
              onPress={() => setIsFavorited(!isFavorited)}
            >
              <Bookmark size={18} color={isFavorited ? '#F59E0B' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logAscentBtn}
              onPress={() => {
                onClose();
                onOpenLogbook(route);
              }}
            >
              <Award size={18} color="#0F172A" />
              <Text style={styles.logAscentText}>REGISTRAR CADENA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitleGroup: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  orderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  orderBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  routeName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  gradeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  mainGradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mainGradeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  gradeConversions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gradeEquivText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  gradeHighlight: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  gradeDivider: {
    color: '#475569',
  },
  bodyScroll: {
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  dangerCard: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  dangerDescription: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
  rackBox: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE600',
    marginBottom: 16,
  },
  rackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  rackTitle: {
    color: '#FFE600',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rackText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  descriptionText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 22,
  },
  warningNote: {
    color: '#F59E0B',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  historyText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  historyBold: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  curiosityText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 6,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  favoriteBtn: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  logAscentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  logAscentText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  communityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  communitySub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  postPhotoMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  postPhotoMiniText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyPhotosBox: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyPhotosTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: 8,
  },
  emptyPhotosSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  firstPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  firstPhotoBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  communityPhotosList: {
    gap: 12,
  },
  communityPhotoItem: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  communityPhotoImg: {
    width: '100%',
    height: 190,
  },
  communityPhotoOverlay: {
    padding: 12,
    backgroundColor: '#1E293B',
  },
  photoUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  photoUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  photoUserName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  photoUserLocation: {
    color: '#94A3B8',
    fontSize: 10,
  },
  photoLikeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  photoLikeCount: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  photoCaptionText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
