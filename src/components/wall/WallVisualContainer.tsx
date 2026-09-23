// Orquestrador de Representação Visual da Parede (Fallback Automático em 3 Níveis)
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Route, Wall, VisualRepresentationTier } from '../../types/climbing';
import { Wall3DViewer } from '../viewer3d/Wall3DViewer';
import { WallTopo2DViewer } from '../topo2d/WallTopo2DViewer';
import { WallPhotoFallbackViewer } from './WallPhotoFallbackViewer';
import { SunShadeCard } from '../common/EENeBadge';
import { Compass, Sun, Mountain, Layers, Box, Camera } from 'lucide-react-native';

interface WallVisualContainerProps {
  wall: Wall;
  selectedRouteId: string | null;
  onSelectRoute: (route: Route) => void;
  preferredGradeSystem: 'brazilian' | 'french' | 'yds';
}

export const WallVisualContainer: React.FC<WallVisualContainerProps> = ({
  wall,
  selectedRouteId,
  onSelectRoute,
  preferredGradeSystem,
}) => {
  // Lógica Automática de Fallback (Conforme Seção 2 da Especificação)
  const getNaturalTier = (w: Wall): VisualRepresentationTier => {
    if (w.model3D) return '3d';
    if (w.activeTopo2D) return 'interactive_2d';
    return 'photo';
  };

  const naturalTier = getNaturalTier(wall);

  // Permite forçar um modo para demonstração / testes
  const [activeTier, setActiveTier] = useState<VisualRepresentationTier>(naturalTier);

  // Calcula amplitude de graus da parede
  const minGrade = wall.routes[0]?.grade.brazilian || '4º';
  const maxGrade = wall.routes[wall.routes.length - 1]?.grade.brazilian || '8b';

  return (
    <View style={styles.container}>
      {/* Cabeçalho da Parede */}
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.wallName}>{wall.name}</Text>
          <Text style={styles.wallStats}>
            {wall.routes.length} vias • {minGrade} a {maxGrade} • {wall.heightMeters}m de altura
          </Text>
        </View>

        {/* Seletor Manual de Modo (Para Testar o Fallback) */}
        <View style={styles.tierSelector}>
          {wall.model3D && (
            <TouchableOpacity
              style={[styles.tierBtn, activeTier === '3d' && styles.tierBtnActive]}
              onPress={() => setActiveTier('3d')}
            >
              <Box size={13} color={activeTier === '3d' ? '#10B981' : '#94A3B8'} />
              <Text style={[styles.tierBtnText, activeTier === '3d' && styles.tierBtnTextActive]}>
                3D
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.tierBtn, activeTier === 'interactive_2d' && styles.tierBtnActive]}
            onPress={() => setActiveTier('interactive_2d')}
          >
            <Layers size={13} color={activeTier === 'interactive_2d' ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.tierBtnText, activeTier === 'interactive_2d' && styles.tierBtnTextActive]}>
              2D
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tierBtn, activeTier === 'photo' && styles.tierBtnActive]}
            onPress={() => setActiveTier('photo')}
          >
            <Camera size={13} color={activeTier === 'photo' ? '#E2E8F0' : '#94A3B8'} />
            <Text style={[styles.tierBtnText, activeTier === 'photo' && styles.tierBtnTextActive]}>
              Foto
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Renderização do Componente de Acordo com a Prioridade */}
      <View style={styles.viewerWrapper}>
        {activeTier === '3d' && wall.model3D ? (
          <Wall3DViewer
            wall={wall}
            selectedRouteId={selectedRouteId}
            onSelectRoute={onSelectRoute}
            preferredGradeSystem={preferredGradeSystem}
          />
        ) : activeTier === 'interactive_2d' ? (
          <WallTopo2DViewer
            wall={wall}
            selectedRouteId={selectedRouteId}
            onSelectRoute={onSelectRoute}
            preferredGradeSystem={preferredGradeSystem}
          />
        ) : (
          <WallPhotoFallbackViewer
            wall={wall}
            selectedRouteId={selectedRouteId}
            onSelectRoute={onSelectRoute}
            preferredGradeSystem={preferredGradeSystem}
          />
        )}
      </View>

      {/* Ficha Técnica de Campo da Parede */}
      <View style={styles.technicalCardsRow}>
        <View style={styles.techCard}>
          <View style={styles.techCardHeader}>
            <Compass size={14} color="#38BDF8" />
            <Text style={styles.techCardTitle}>Orientação</Text>
          </View>
          <Text style={styles.techCardValue}>{wall.orientation}</Text>
          {wall.sunExposure && (
            <View style={{ marginTop: 6 }}>
              <SunShadeCard sunExposure={wall.sunExposure} />
            </View>
          )}
          <Text style={styles.techCardSub}>{wall.sunShadeNotes}</Text>
        </View>

        <View style={styles.techCard}>
          <View style={styles.techCardHeader}>
            <Mountain size={14} color="#10B981" />
            <Text style={styles.techCardTitle}>Rocha</Text>
          </View>
          <Text style={styles.techCardValue}>
            {wall.rockType.charAt(0).toUpperCase() + wall.rockType.slice(1)}
          </Text>
          <Text style={styles.techCardSub}>Granito claro com agarras fartas e fendas</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitles: {
    flex: 1,
  },
  wallName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  wallStats: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  tierSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  tierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tierBtnActive: {
    backgroundColor: '#0F172A',
  },
  tierBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  tierBtnTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  viewerWrapper: {
    marginBottom: 12,
  },
  technicalCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  techCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  techCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  techCardTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  techCardValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  techCardSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
});
