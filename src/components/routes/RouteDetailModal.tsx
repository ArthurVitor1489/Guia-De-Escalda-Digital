// Modal de Detalhes da Via de Escalada com Histórico, Proteções e Logbook
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Route } from '../../types/climbing';
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
} from 'lucide-react-native';
import { formatRouteGrade, getGradeBadgeColor, DANGER_EXPLANATIONS } from '../../services/gradeConverter';

interface RouteDetailModalProps {
  route: Route | null;
  onClose: () => void;
  onOpenLogbook: (route: Route) => void;
  preferredGradeSystem: 'brazilian' | 'french' | 'yds';
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({
  route,
  onClose,
  onOpenLogbook,
  preferredGradeSystem,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);

  if (!route) return null;

  const gradeDisplay = formatRouteGrade(route, preferredGradeSystem);
  const badgeColor = getGradeBadgeColor(route.grade.brazilian);
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
              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeText}>Via #{route.orderIndex}</Text>
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
  orderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
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
});
