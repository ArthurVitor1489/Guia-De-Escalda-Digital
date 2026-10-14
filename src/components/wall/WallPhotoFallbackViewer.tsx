// Visualizador de Fallback Nível 3: Foto Simples da Parede com Vias Ordenadas
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Route, Wall } from '../../types/climbing';
import { Camera, ChevronRight } from 'lucide-react-native';
import { getGradeBadgeColor } from '../../services/gradeConverter';

interface WallPhotoFallbackViewerProps {
  wall: Wall;
  selectedRouteId: string | null;
  onSelectRoute: (route: Route) => void;
  preferredGradeSystem: 'brazilian' | 'french' | 'yds';
}

export const WallPhotoFallbackViewer: React.FC<WallPhotoFallbackViewerProps> = ({
  wall,
  selectedRouteId,
  onSelectRoute,
  preferredGradeSystem,
}) => {
  const imageUrl = wall.fallbackPhotoUrl;

  return (
    <View style={styles.container}>
      {/* Imagem da Parede com Badge Fallback */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.badgeFallback}>
          <Camera size={12} color="#FFFFFF" />
          <Text style={styles.badgeFallbackText}>FOTO DA PAREDE (FALLBACK)</Text>
        </View>

        <View style={styles.photoCountBadge}>
          <Text style={styles.photoCountText}>{wall.routes.length} vias nesta face</Text>
        </View>
      </View>

      {/* Lista Sequencial de Vias (Esquerda para Direita) */}
      <View style={styles.routesListWrapper}>
        <Text style={styles.listHeaderTitle}>
          Vias ordenadas da esquerda para a direita:
        </Text>

        <ScrollView
          style={styles.routesScroll}
          contentContainerStyle={{ gap: 8 }}
          nestedScrollEnabled
        >
          {wall.routes.map(r => {
            const isSelected = r.id === selectedRouteId;
            return (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.routeListItem,
                  isSelected && styles.routeListItemSelected,
                ]}
                onPress={() => onSelectRoute(r)}
                activeOpacity={0.7}
              >
                <View style={styles.routeItemLeft}>
                  <View style={[styles.orderCircle, isSelected && styles.orderCircleSelected]}>
                    <Text style={[styles.orderNumber, isSelected && styles.orderNumberSelected]}>
                      {r.orderIndex}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.routeName, isSelected && styles.routeNameSelected]}>
                      {r.name}
                    </Text>
                    <Text style={styles.routeMeta}>
                      {r.heightMeters}m • {r.style === 'boulder' ? 'crash pad' : `${r.boltsCount} proteções`} • {r.style}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeItemRight}>
                  <Text style={[styles.gradeBadge, { backgroundColor: getGradeBadgeColor(r.grade.brazilian) }]}>
                    {r.style === 'boulder'
                      ? r.grade.brazilian
                      : (preferredGradeSystem === 'brazilian' ? r.grade.brazilian : r.grade.french)}
                    {r.grade.danger ? ` ${r.grade.danger}` : ''}
                  </Text>
                  <ChevronRight size={16} color="#94A3B8" />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 320,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeFallback: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  badgeFallbackText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  routesListWrapper: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  listHeaderTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routesScroll: {
    maxHeight: 220,
  },
  routeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  routeListItemSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#059669',
  },
  routeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCircleSelected: {
    backgroundColor: '#059669',
  },
  orderNumber: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
  },
  orderNumberSelected: {
    color: '#FFFFFF',
  },
  routeName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  routeNameSelected: {
    color: '#059669',
  },
  routeMeta: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  routeItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gradeBadge: {
    color: '#FFFFFF',
    backgroundColor: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
