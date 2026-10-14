// Visualizador Central da Parede e Vias
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Route, Wall } from '../../types/climbing';
import { WallPhotoFallbackViewer } from './WallPhotoFallbackViewer';
import { SunShadeCard } from '../common/EENeBadge';
import { Compass, Mountain } from 'lucide-react-native';

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
      </View>

      {/* Foto Imersiva da Parede com Lista de Vias */}
      <View style={styles.viewerWrapper}>
        <WallPhotoFallbackViewer
          wall={wall}
          selectedRouteId={selectedRouteId}
          onSelectRoute={onSelectRoute}
          preferredGradeSystem={preferredGradeSystem}
        />
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
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  wallStats: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  tierSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    gap: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tierBtnText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  tierBtnTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  viewerWrapper: {
    marginBottom: 14,
  },
  technicalCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  techCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  techCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  techCardTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  techCardValue: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  techCardSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
});
