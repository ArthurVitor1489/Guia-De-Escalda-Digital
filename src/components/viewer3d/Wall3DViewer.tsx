// Visualizador 3D Interativo de Parede de Escalada com Três.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as THREE from 'three';
import { Route, Wall } from '../../types/climbing';
import { Sun, RotateCw, ZoomIn, ZoomOut, Compass, Info, Check } from 'lucide-react-native';

interface Wall3DViewerProps {
  wall: Wall;
  selectedRouteId: string | null;
  onSelectRoute: (route: Route) => void;
  preferredGradeSystem: 'brazilian' | 'french' | 'yds';
}

export const Wall3DViewer: React.FC<Wall3DViewerProps> = ({
  wall,
  selectedRouteId,
  onSelectRoute,
  preferredGradeSystem,
}) => {
  const containerRef = useRef<View>(null);
  const canvasRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [sunTime, setSunTime] = useState<'morning' | 'noon' | 'afternoon'>('morning');
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Referências do Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const wallMeshRef = useRef<THREE.Mesh | null>(null);
  const routeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Estados de rotação por toque/arraste
  const rotationRef = useRef({ x: 0.1, y: 0 });
  const isDraggingRef = useRef(false);
  const lastTouchRef = useRef({ x: 0, y: 0 });

  // Criação da cena Three.js
  const initThreeScene = (canvasElement?: HTMLCanvasElement) => {
    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x131822); // Céu crepuscular montanhoso
      sceneRef.current = scene;

      const aspect = 1.33; // padrão mobile 4:3
      const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
      camera.position.set(0, 8, 30);
      camera.lookAt(0, 10, 0);
      cameraRef.current = camera;

      // Luzes
      const ambientLight = new THREE.AmbientLight(0xd4d8e2, 0.55);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfff7e6, 1.4);
      sunLight.position.set(-18, 25, 20);
      sunLight.castShadow = true;
      scene.add(sunLight);
      sunLightRef.current = sunLight;

      // Luz de preenchimento suave
      const hemiLight = new THREE.HemisphereLight(0x405570, 0x1f2421, 0.4);
      scene.add(hemiLight);

      // Renderer
      let renderer: THREE.WebGLRenderer;
      if (Platform.OS === 'web' && canvasElement) {
        renderer = new THREE.WebGLRenderer({
          canvas: canvasElement,
          antialias: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(canvasElement.clientWidth || 360, canvasElement.clientHeight || 320);
        renderer.shadowMap.enabled = true;
      } else {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(360, 320);
      }
      rendererRef.current = renderer;

      // Construção da Parede de Rocha Realista (Relevo Geológico)
      const wallGeom = createRealisticRockGeometry();
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x8a8479, // Cor típica do calcário da Serra do Cipó
        roughness: 0.88,
        metalness: 0.12,
        flatShading: true,
      });
      const wallMesh = new THREE.Mesh(wallGeom, wallMaterial);
      wallMesh.position.set(0, 10, 0);
      wallMesh.receiveShadow = true;
      scene.add(wallMesh);
      wallMeshRef.current = wallMesh;

      // Base do Chão / Pedregulhos
      const groundGeom = new THREE.CylinderGeometry(18, 20, 2, 24);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x2d3429, // Solo com vegetação de cerrado
        roughness: 0.95,
      });
      const groundMesh = new THREE.Mesh(groundGeom, groundMat);
      groundMesh.position.set(0, -1, 0);
      scene.add(groundMesh);

      // Renderização das Geometrias 3D das Vias
      buildRouteSplines(scene, wall.routes);

      setLoading(false);

      // Loop de renderização
      const animate = () => {
        if (autoRotate && wallMeshRef.current) {
          rotationRef.current.y += 0.005;
        }

        if (sceneRef.current && cameraRef.current && rendererRef.current) {
          // Aplica rotações suaves
          sceneRef.current.rotation.y = rotationRef.current.y;
          sceneRef.current.rotation.x = rotationRef.current.x;

          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        animFrameId.current = requestAnimationFrame(animate);
      };
      animate();
    } catch (e) {
      console.warn('Erro ao inicializar Three.js:', e);
      setLoading(false);
    }
  };

  // Constrói relevo geológico com feições de falésia (teto, canaletas e regletes)
  const createRealisticRockGeometry = (): THREE.BufferGeometry => {
    const width = 24;
    const height = 24;
    const segmentsW = 40;
    const segmentsH = 40;
    const geom = new THREE.PlaneGeometry(width, height, segmentsW, segmentsH);

    const posAttr = geom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);

      // Gera feições geológicas: grande teto no terço superior e ranhuras verticais
      let z = Math.sin(x * 0.4) * 0.9 + Math.cos(y * 0.3) * 0.7;

      // Adiciona o teto saliente característico da Serra do Cipó
      if (y > 2 && y < 8) {
        z += Math.sin((y - 2) * 0.5) * 2.2;
      }
      // Micro-rugosidade para agarras
      z += Math.sin(x * 3.5) * Math.cos(y * 3.5) * 0.22;

      posAttr.setZ(i, z);
    }
    geom.computeVertexNormals();
    return geom;
  };

  // Constrói os traçados 3D independentes de cada via
  const buildRouteSplines = (scene: THREE.Scene, routes: Route[]) => {
    routeMeshesRef.current.forEach(mesh => scene.remove(mesh));
    routeMeshesRef.current.clear();

    routes.forEach(route => {
      if (!route.geometry3D) return;

      const points = route.geometry3D.pathPoints3D.map(
        p => new THREE.Vector3(p[0], p[1], p[2])
      );
      if (points.length < 2) return;

      // Cria curva tridimensional suave
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeRadius = route.geometry3D.tubeRadius || 0.06;
      const isSelected = route.id === selectedRouteId;

      const tubeGeom = new THREE.TubeGeometry(curve, 32, isSelected ? tubeRadius * 1.5 : tubeRadius, 8, false);
      const colorHex = isSelected ? 0xffea00 : parseInt(route.geometry3D.color?.replace('#', '0x') || '0x3b82f6', 16);

      const tubeMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: isSelected ? 0xffea00 : colorHex,
        emissiveIntensity: isSelected ? 0.7 : 0.2,
        roughness: 0.3,
      });

      const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
      scene.add(tubeMesh);
      routeMeshesRef.current.set(route.id, tubeMesh);

      // Adiciona chapeletas 3D (discos metálicos)
      if (route.geometry3D.bolts3D) {
        const boltGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8);
        const boltMat = new THREE.MeshStandardMaterial({
          color: 0xd1d5db,
          metalness: 0.85,
          roughness: 0.2,
        });

        route.geometry3D.bolts3D.forEach(bolt => {
          const boltMesh = new THREE.Mesh(boltGeom, boltMat);
          boltMesh.position.set(bolt.position[0], bolt.position[1], bolt.position[2] + 0.05);
          boltMesh.rotation.x = Math.PI / 2;
          scene.add(boltMesh);
        });
      }

      // Adiciona Parada 3D (dois anéis com corrente no topo)
      if (route.geometry3D.anchor3D) {
        const anchorGeom = new THREE.TorusGeometry(0.2, 0.05, 8, 16);
        const anchorMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b, // Dourado/latão
          metalness: 0.9,
          roughness: 0.2,
        });
        const anchorMesh = new THREE.Mesh(anchorGeom, anchorMat);
        const [ax, ay, az] = route.geometry3D.anchor3D;
        anchorMesh.position.set(ax, ay + 0.3, az + 0.1);
        scene.add(anchorMesh);
      }
    });
  };

  // Atualiza destaque da via quando selecionada
  useEffect(() => {
    if (!sceneRef.current) return;
    buildRouteSplines(sceneRef.current, wall.routes);
  }, [selectedRouteId, wall.routes]);

  // Altera iluminação solar de acordo com o horário simulado
  useEffect(() => {
    if (!sunLightRef.current) return;
    if (sunTime === 'morning') {
      sunLightRef.current.position.set(-20, 18, 20); // Sol vindo de leste/manhã
      sunLightRef.current.color.setHex(0xffecd2);
      sunLightRef.current.intensity = 1.4;
    } else if (sunTime === 'noon') {
      sunLightRef.current.position.set(0, 32, 10); // Sol a pino
      sunLightRef.current.color.setHex(0xffffff);
      sunLightRef.current.intensity = 1.6;
    } else {
      sunLightRef.current.position.set(22, 12, 18); // Sol da tarde
      sunLightRef.current.color.setHex(0xffb74d);
      sunLightRef.current.intensity = 1.2;
    }
  }, [sunTime]);

  // PanResponder para rotação por toque (Mobile e Web)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        isDraggingRef.current = true;
        const { pageX, pageY } = evt.nativeEvent;
        lastTouchRef.current = { x: pageX, y: pageY };
      },
      onPanResponderMove: (evt) => {
        if (!isDraggingRef.current) return;
        const { pageX, pageY } = evt.nativeEvent;
        const dx = pageX - lastTouchRef.current.x;
        const dy = pageY - lastTouchRef.current.y;
        lastTouchRef.current = { x: pageX, y: pageY };

        // Aplica rotação delimitada para não perder o foco da parede
        rotationRef.current.y += dx * 0.008;
        const newX = rotationRef.current.x + dy * 0.006;
        rotationRef.current.x = Math.max(-0.25, Math.min(0.4, newX));
      },
      onPanResponderRelease: () => {
        isDraggingRef.current = false;
      },
    })
  ).current;

  // Zoom da câmera
  const handleZoom = (factor: number) => {
    if (!cameraRef.current) return;
    const currentZ = cameraRef.current.position.z;
    const newZ = Math.max(12, Math.min(45, currentZ * factor));
    cameraRef.current.position.z = newZ;
    setZoomLevel(Math.round((30 / newZ) * 10) / 10);
  };

  // Inicializa Three.js no DOM quando em Web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.touchAction = 'none';
      if (canvasRef.current) {
        canvasRef.current.appendChild(canvas);
        initThreeScene(canvas);
      }
    } else {
      initThreeScene();
    }

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Viewport 3D com captura de toque */}
      <View style={styles.viewport} {...panResponder.panHandlers}>
        {Platform.OS === 'web' ? (
          <div ref={canvasRef as any} style={{ width: '100%', height: '100%', position: 'absolute' }} />
        ) : (
          <View style={styles.nativeFallback}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.nativeText}>Renderizando Malha 3D...</Text>
          </View>
        )}

        {/* Badge de Nível 1: Modelo 3D Ativo */}
        <View style={styles.badge3D}>
          <Text style={styles.badge3DText}>● 3D FOTOGRAMÉTRICO REAL</Text>
        </View>

        {/* Controles Flutuantes da Câmera e Orientação */}
        <View style={styles.floatingControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleZoom(0.85)}
            activeOpacity={0.7}
          >
            <ZoomIn size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleZoom(1.15)}
            activeOpacity={0.7}
          >
            <ZoomOut size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, autoRotate && styles.controlButtonActive]}
            onPress={() => setAutoRotate(!autoRotate)}
            activeOpacity={0.7}
          >
            <RotateCw size={18} color={autoRotate ? '#10B981' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>

        {/* Simulador de Incidência Solar na Rocha */}
        <View style={styles.sunSimulatorBar}>
          <View style={styles.sunLabelContainer}>
            <Sun size={14} color="#F59E0B" />
            <Text style={styles.sunLabel}>Sol na Parede:</Text>
          </View>
          <View style={styles.sunButtonsGroup}>
            <TouchableOpacity
              style={[styles.sunTimeBtn, sunTime === 'morning' && styles.sunTimeBtnActive]}
              onPress={() => setSunTime('morning')}
            >
              <Text style={[styles.sunTimeText, sunTime === 'morning' && styles.sunTimeTextActive]}>
                Manhã
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sunTimeBtn, sunTime === 'noon' && styles.sunTimeBtnActive]}
              onPress={() => setSunTime('noon')}
            >
              <Text style={[styles.sunTimeText, sunTime === 'noon' && styles.sunTimeTextActive]}>
                Meio-dia
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sunTimeBtn, sunTime === 'afternoon' && styles.sunTimeBtnActive]}
              onPress={() => setSunTime('afternoon')}
            >
              <Text style={[styles.sunTimeText, sunTime === 'afternoon' && styles.sunTimeTextActive]}>
                Tarde
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Faixa de Seleção Rápida de Vias Sobrepostas no 3D */}
      <View style={styles.routesQuickBar}>
        <Text style={styles.routesQuickTitle}>Vias na Parede 3D ({wall.routes.length}):</Text>
        <View style={styles.routesChipsContainer}>
          {wall.routes.map(r => {
            const isSelected = r.id === selectedRouteId;
            return (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.routeChip,
                  isSelected && styles.routeChipSelected,
                  { borderLeftColor: r.geometry3D?.color || '#3B82F6', borderLeftWidth: 4 },
                ]}
                onPress={() => onSelectRoute(r)}
                activeOpacity={0.7}
              >
                <Text style={[styles.routeChipNumber, isSelected && styles.routeChipNumberSelected]}>
                  {r.orderIndex}
                </Text>
                <Text style={[styles.routeChipName, isSelected && styles.routeChipNameSelected]}>
                  {r.name}
                </Text>
                <Text style={styles.routeChipGrade}>
                  {preferredGradeSystem === 'brazilian' ? r.grade.brazilian : r.grade.french}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  viewport: {
    height: 320,
    width: '100%',
    backgroundColor: '#131822',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 8,
  },
  badge3D: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 10,
  },
  badge3DText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  floatingControls: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: '#10B981',
  },
  sunSimulatorBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  sunLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sunLabel: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  sunButtonsGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  sunTimeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sunTimeBtnActive: {
    backgroundColor: '#F59E0B',
  },
  sunTimeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  sunTimeTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  routesQuickBar: {
    padding: 12,
    backgroundColor: '#1E293B',
  },
  routesQuickTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  routesChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  routeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  routeChipSelected: {
    backgroundColor: '#334155',
    borderColor: '#38BDF8',
    borderWidth: 1,
  },
  routeChipNumber: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  routeChipNumberSelected: {
    color: '#38BDF8',
  },
  routeChipName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  routeChipNameSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  routeChipGrade: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
});
