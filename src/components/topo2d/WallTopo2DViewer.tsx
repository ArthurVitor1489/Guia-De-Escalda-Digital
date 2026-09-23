// Visualizador de Croqui 2D Interativo com Sobreposição Vetorial SVG
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { Route, Wall } from '../../types/climbing';
import { Layers, ZoomIn, ZoomOut, Eye, Check } from 'lucide-react-native';

interface WallTopo2DViewerProps {
  wall: Wall;
  selectedRouteId: string | null;
  onSelectRoute: (route: Route) => void;
  preferredGradeSystem: 'brazilian' | 'french' | 'yds';
}

export const WallTopo2DViewer: React.FC<WallTopo2DViewerProps> = ({
  wall,
  selectedRouteId,
  onSelectRoute,
  preferredGradeSystem,
}) => {
  const [scale, setScale] = useState(1);
  const [showBolts, setShowBolts] = useState(true);
  const [showBadges, setShowBadges] = useState(true);

  const topo = wall.activeTopo2D;
  const imageUrl = topo?.imageUrl || wall.fallbackPhotoUrl;

  // Dimensões base do SVG para normalização (1000 x 750)
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 750;

  // Converte pontos normalizados (0..1) em coordenadas SVG
  const generateSvgPath = (points: Array<{ x: number; y: number }>): string => {
    if (!points || points.length < 2) return '';
    const start = points[0];
    let d = `M ${start.x * SVG_WIDTH} ${start.y * SVG_HEIGHT}`;

    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      // Adiciona curva Bézier suave entre os pontos
      const prev = points[i - 1];
      const cx = ((prev.x + p.x) / 2) * SVG_WIDTH;
      const cy = ((prev.y + p.y) / 2) * SVG_HEIGHT;
      d += ` Q ${cx} ${cy}, ${p.x * SVG_WIDTH} ${p.y * SVG_HEIGHT}`;
    }
    return d;
  };

  return (
    <View style={styles.container}>
      {/* Barra Superior de Ferramentas do Croqui */}
      <View style={styles.headerBar}>
        <View style={styles.badge2D}>
          <Text style={styles.badge2DText}>● CROQUI 2D INTERATIVO</Text>
        </View>

        <View style={styles.toolsGroup}>
          <TouchableOpacity
            style={[styles.toolBtn, showBolts && styles.toolBtnActive]}
            onPress={() => setShowBolts(!showBolts)}
          >
            <Layers size={14} color={showBolts ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.toolBtnText, showBolts && styles.toolBtnTextActive]}>Grampos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolBtn, showBadges && styles.toolBtnActive]}
            onPress={() => setShowBadges(!showBadges)}
          >
            <Eye size={14} color={showBadges ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.toolBtnText, showBadges && styles.toolBtnTextActive]}>Nomes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => setScale(Math.min(2, scale + 0.25))}
          >
            <ZoomIn size={14} color="#E2E8F0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => setScale(Math.max(1, scale - 0.25))}
          >
            <ZoomOut size={14} color="#E2E8F0" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Área da Imagem com Sobreposição SVG */}
      <ScrollView
        horizontal
        bounces={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={[styles.canvasWrapper, { transform: [{ scale }] }]}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />

          {/* Camada SVG Vetorial Interativa */}
          <Svg
            style={StyleSheet.absoluteFill}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          >
            {wall.routes.map(route => {
              if (!route.geometry2D) return null;
              const isSelected = route.id === selectedRouteId;
              const pathD = generateSvgPath(route.geometry2D.pathPoints);
              const routeColor = isSelected ? '#FFE600' : (route.geometry2D.color || '#38BDF8');
              const opacity = selectedRouteId && !isSelected ? 0.35 : 1;

              return (
                <G key={route.id} opacity={opacity}>
                  {/* Linha externa para contraste / sombra */}
                  <Path
                    d={pathD}
                    stroke="#000000"
                    strokeWidth={isSelected ? 10 : 7}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Linha principal da via com clique */}
                  <Path
                    d={pathD}
                    stroke={routeColor}
                    strokeWidth={isSelected ? 6 : 4}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    onPress={() => onSelectRoute(route)}
                  />

                  {/* Chapeletas / Proteções */}
                  {showBolts &&
                    route.geometry2D.bolts.map(bolt => (
                      <G key={`bolt-${bolt.index}`}>
                        <Circle
                          cx={bolt.x * SVG_WIDTH}
                          cy={bolt.y * SVG_HEIGHT}
                          r={isSelected ? 7 : 5}
                          fill="#FFFFFF"
                          stroke="#0F172A"
                          strokeWidth={2}
                        />
                        <Circle
                          cx={bolt.x * SVG_WIDTH}
                          cy={bolt.y * SVG_HEIGHT}
                          r={2}
                          fill="#0F172A"
                        />
                      </G>
                    ))}

                  {/* Parada Dupla no Topo */}
                  {route.geometry2D.anchor && (
                    <G>
                      <Circle
                        cx={route.geometry2D.anchor.x * SVG_WIDTH - 6}
                        cy={route.geometry2D.anchor.y * SVG_HEIGHT}
                        r={6}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth={3}
                      />
                      <Circle
                        cx={route.geometry2D.anchor.x * SVG_WIDTH + 6}
                        cy={route.geometry2D.anchor.y * SVG_HEIGHT}
                        r={6}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth={3}
                      />
                    </G>
                  )}

                  {/* Badge da Base da Via */}
                  {showBadges && route.geometry2D.startPoint && (
                    <G onPress={() => onSelectRoute(route)}>
                      <Rect
                        x={route.geometry2D.startPoint.x * SVG_WIDTH - 16}
                        y={route.geometry2D.startPoint.y * SVG_HEIGHT - 16}
                        width={32}
                        height={32}
                        rx={16}
                        fill={isSelected ? '#FFE600' : '#0F172A'}
                        stroke={routeColor}
                        strokeWidth={3}
                      />
                      <SvgText
                        x={route.geometry2D.startPoint.x * SVG_WIDTH}
                        y={route.geometry2D.startPoint.y * SVG_HEIGHT + 5}
                        fill={isSelected ? '#0F172A' : '#FFFFFF'}
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {route.orderIndex}
                      </SvgText>
                    </G>
                  )}
                </G>
              );
            })}
          </Svg>
        </View>
      </ScrollView>

      {/* Lista Inferior de Vias */}
      <View style={styles.routesBottomList}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {wall.routes.map(r => {
            const isSelected = r.id === selectedRouteId;
            return (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.routeCardItem,
                  isSelected && styles.routeCardItemSelected,
                  { borderTopColor: r.geometry2D?.color || '#38BDF8', borderTopWidth: 3 },
                ]}
                onPress={() => onSelectRoute(r)}
              >
                <View style={styles.routeCardTop}>
                  <Text style={styles.routeIndexBadge}>{r.orderIndex}</Text>
                  <Text style={styles.routeCardName}>{r.name}</Text>
                </View>
                <Text style={styles.routeCardGrade}>
                  {preferredGradeSystem === 'brazilian' ? r.grade.brazilian : r.grade.french}
                  {r.grade.danger ? ` ${r.grade.danger}` : ''} • {r.heightMeters}m
                </Text>
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
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#1E293B',
  },
  badge2D: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  badge2DText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  toolsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toolBtnActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  toolBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  toolBtnTextActive: {
    color: '#38BDF8',
  },
  zoomBtn: {
    backgroundColor: '#0F172A',
    padding: 6,
    borderRadius: 6,
  },
  canvasWrapper: {
    width: '100%',
    height: 320,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  routesBottomList: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  chipsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  routeCardItem: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 8,
    minWidth: 140,
  },
  routeCardItemSelected: {
    backgroundColor: '#334155',
    borderColor: '#FFE600',
    borderWidth: 1,
  },
  routeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  routeIndexBadge: {
    backgroundColor: '#0F172A',
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 11,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  routeCardName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  routeCardGrade: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
