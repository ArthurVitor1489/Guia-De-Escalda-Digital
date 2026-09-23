// Aplicativo Mobile Principal — CRUX: Guia Digital Interativo de Escalada
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Sector, Wall, Route, AscentLog } from './src/types/climbing';
import { MOCK_SECTORS } from './src/services/mockData';
import { StorageService } from './src/services/storageService';
import { WallVisualContainer } from './src/components/wall/WallVisualContainer';
import { RouteDetailModal } from './src/components/routes/RouteDetailModal';
import { LogAscentModal } from './src/components/logbook/LogAscentModal';
import { SectorApproachModal } from './src/components/common/SectorApproachModal';
import { LogbookScreen } from './src/components/logbook/LogbookScreen';
import {
  Mountain,
  Compass,
  Award,
  Search,
  MapPin,
  WifiOff,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Box,
  Camera,
} from 'lucide-react-native';

export default function App() {
  const [sectors, setSectors] = useState<Sector[]>(MOCK_SECTORS);
  const [activeSectorIndex, setActiveSectorIndex] = useState(0);
  const [activeWallIndex, setActiveWallIndex] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [logbookRoute, setLogbookRoute] = useState<Route | null>(null);
  const [showApproachModal, setShowApproachModal] = useState(false);
  const [currentTab, setCurrentTab] = useState<'guide' | 'logbook'>('guide');
  const [gradeSystem, setGradeSystem] = useState<'brazilian' | 'french' | 'yds'>('brazilian');
  const [logs, setLogs] = useState<AscentLog[]>([]);

  const currentSector = sectors[activeSectorIndex] || sectors[0];
  const currentWall = currentSector.walls[activeWallIndex] || currentSector.walls[0];

  // Carrega preferências e diário de escalada ao iniciar
  useEffect(() => {
    async function loadInitialData() {
      const savedLogs = await StorageService.getLogbook();
      setLogs(savedLogs);
      const prefs = await StorageService.getPreferences();
      setGradeSystem(prefs.gradeSystem);
    }
    loadInitialData();
  }, []);

  // Alterna o sistema de graduação preferido
  const cycleGradeSystem = async () => {
    const nextSystem =
      gradeSystem === 'brazilian' ? 'french' : gradeSystem === 'french' ? 'yds' : 'brazilian';
    setGradeSystem(nextSystem);
    await StorageService.savePreferences({
      gradeSystem: nextSystem,
      autoRotate3D: false,
      showSunSimulation: true,
      hapticFeedback: true,
    });
  };

  // Salva uma nova ascensão no diário
  const handleSaveAscent = async (ascentData: any) => {
    const newLog = await StorageService.addAscent(ascentData);
    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Barra de Navegação Superior */}
      <View style={styles.topNavbar}>
        <View style={styles.brandRow}>
          <Mountain size={22} color="#10B981" />
          <Text style={styles.brandTitle}>CRUX</Text>
          <View style={styles.offlinePill}>
            <WifiOff size={10} color="#10B981" />
            <Text style={styles.offlineText}>OFFLINE</Text>
          </View>
        </View>

        <View style={styles.topActions}>
          {/* Seletor de Graduação */}
          <TouchableOpacity
            style={styles.gradeToggleBtn}
            onPress={cycleGradeSystem}
            activeOpacity={0.7}
          >
            <Text style={styles.gradeToggleLabel}>GRAU:</Text>
            <Text style={styles.gradeToggleActive}>
              {gradeSystem === 'brazilian' ? 'BR' : gradeSystem === 'french' ? 'FR' : 'YDS'}
            </Text>
          </TouchableOpacity>

          {/* Botão de Diário de Cadenas com Badge */}
          <TouchableOpacity
            style={[styles.navIconBtn, currentTab === 'logbook' && styles.navIconBtnActive]}
            onPress={() => setCurrentTab(currentTab === 'guide' ? 'logbook' : 'guide')}
          >
            <Award size={18} color={currentTab === 'logbook' ? '#10B981' : '#E2E8F0'} />
            {logs.length > 0 && (
              <View style={styles.logCountBadge}>
                <Text style={styles.logCountText}>{logs.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo Principal: Guia ou Logbook */}
      {currentTab === 'logbook' ? (
        <LogbookScreen logs={logs} onClose={() => setCurrentTab('guide')} />
      ) : (
        <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* Seletor de Setores e Falésias */}
          <View style={styles.sectorBar}>
            <View style={styles.sectorInfo}>
              <View style={styles.sectorBreadcrumb}>
                <MapPin size={13} color="#38BDF8" />
                <Text style={styles.sectorLocation}>
                  {currentSector.cragName} • {currentSector.city}/{currentSector.state}
                </Text>
              </View>
              <Text style={styles.sectorNameText}>{currentSector.name}</Text>
            </View>

            <TouchableOpacity
              style={styles.approachBtn}
              onPress={() => setShowApproachModal(true)}
            >
              <Compass size={14} color="#38BDF8" />
              <Text style={styles.approachBtnText}>Trilha & GPS</Text>
            </TouchableOpacity>
          </View>

          {/* Carrossel de Alternância de Setores e Paredes Demonstrativas */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectorTabsScroll}
          >
            {sectors.map((sec, sIdx) => {
              const isSecSelected = sIdx === activeSectorIndex;
              const has3D = sec.walls.some(w => !!w.model3D);
              const has2D = sec.walls.some(w => !!w.activeTopo2D);

              return (
                <TouchableOpacity
                  key={sec.id}
                  style={[styles.sectorTabItem, isSecSelected && styles.sectorTabItemSelected]}
                  onPress={() => {
                    setActiveSectorIndex(sIdx);
                    setActiveWallIndex(0);
                    setSelectedRoute(null);
                  }}
                >
                  <View style={styles.tierIndicatorRow}>
                    {has3D ? (
                      <View style={[styles.tierIndicator, { backgroundColor: '#10B981' }]}>
                        <Text style={styles.tierIndicatorText}>3D</Text>
                      </View>
                    ) : has2D ? (
                      <View style={[styles.tierIndicator, { backgroundColor: '#38BDF8' }]}>
                        <Text style={styles.tierIndicatorText}>2D</Text>
                      </View>
                    ) : (
                      <View style={[styles.tierIndicator, { backgroundColor: '#64748B' }]}>
                        <Text style={styles.tierIndicatorText}>Foto</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.sectorTabTitle,
                      isSecSelected && styles.sectorTabTitleSelected,
                    ]}
                  >
                    {sec.name}
                  </Text>
                  <Text style={styles.sectorTabSub}>{sec.walls[0]?.routes.length || 0} vias</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Componente Central da Parede (Orquestrador com Fallback 3D -> 2D -> Foto) */}
          <WallVisualContainer
            wall={currentWall}
            selectedRouteId={selectedRoute?.id || null}
            onSelectRoute={(route) => setSelectedRoute(route)}
            preferredGradeSystem={gradeSystem}
          />
        </ScrollView>
      )}

      {/* Modal de Detalhes da Via */}
      <RouteDetailModal
        route={selectedRoute}
        onClose={() => setSelectedRoute(null)}
        onOpenLogbook={(route) => setLogbookRoute(route)}
        preferredGradeSystem={gradeSystem}
      />

      {/* Modal de Registro de Cadena */}
      <LogAscentModal
        route={logbookRoute}
        wall={currentWall}
        sector={currentSector}
        visible={!!logbookRoute}
        onClose={() => setLogbookRoute(null)}
        onSaveAscent={handleSaveAscent}
      />

      {/* Modal de Trilha, Acesso e Coordenadas GPS */}
      <SectorApproachModal
        sector={currentSector}
        visible={showApproachModal}
        onClose={() => setShowApproachModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  topNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offlineText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gradeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gradeToggleLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  gradeToggleActive: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  navIconBtn: {
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
  },
  navIconBtnActive: {
    backgroundColor: '#10B98122',
    borderColor: '#10B981',
  },
  logCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10B981',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logCountText: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '900',
  },
  scrollBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectorInfo: {
    flex: 1,
  },
  sectorBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  sectorLocation: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  sectorNameText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  approachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  approachBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  sectorTabsScroll: {
    gap: 10,
    marginBottom: 16,
  },
  sectorTabItem: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    minWidth: 130,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectorTabItemSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#38BDF8',
  },
  tierIndicatorRow: {
    marginBottom: 6,
  },
  tierIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierIndicatorText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  sectorTabTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  sectorTabTitleSelected: {
    color: '#FFFFFF',
  },
  sectorTabSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
});
