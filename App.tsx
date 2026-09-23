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
} from 'react-native';
import { Sector, Wall, Route, AscentLog, ClimbingDestination } from './src/types/climbing';
import { MOCK_SECTORS, CLIMBING_DESTINATIONS } from './src/services/mockData';
import { StorageService } from './src/services/storageService';
import { HomeScreen } from './src/components/home/HomeScreen';
import { WallVisualContainer } from './src/components/wall/WallVisualContainer';
import { RouteDetailModal } from './src/components/routes/RouteDetailModal';
import { LogAscentModal } from './src/components/logbook/LogAscentModal';
import { SectorApproachModal } from './src/components/common/SectorApproachModal';
import { LogbookScreen } from './src/components/logbook/LogbookScreen';
import {
  Mountain,
  Compass,
  Award,
  MapPin,
  WifiOff,
  ArrowLeft,
  Map,
} from 'lucide-react-native';

export default function App() {
  const [destinations] = useState<ClimbingDestination[]>(CLIMBING_DESTINATIONS);
  const [selectedDestination, setSelectedDestination] = useState<ClimbingDestination>(CLIMBING_DESTINATIONS[0]);
  const [activeSectorIndex, setActiveSectorIndex] = useState(0);
  const [activeWallIndex, setActiveWallIndex] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [logbookRoute, setLogbookRoute] = useState<Route | null>(null);
  const [showApproachModal, setShowApproachModal] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'guide' | 'logbook'>('home');
  const [gradeSystem, setGradeSystem] = useState<'brazilian' | 'french' | 'yds'>('brazilian');
  const [logs, setLogs] = useState<AscentLog[]>([]);

  // Setores do destino atualmente selecionado
  const currentSectors = selectedDestination.sectors || MOCK_SECTORS;
  const currentSector = currentSectors[activeSectorIndex] || currentSectors[0];
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

  // Seleciona um destino a partir da Tela Inicial
  const handleSelectDestination = (dest: ClimbingDestination) => {
    setSelectedDestination(dest);
    setActiveSectorIndex(0);
    setActiveWallIndex(0);
    setSelectedRoute(null);
    setCurrentTab('guide');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Barra de Navegação Superior */}
      <View style={styles.topNavbar}>
        <TouchableOpacity
          style={styles.brandRow}
          onPress={() => setCurrentTab('home')}
          activeOpacity={0.7}
        >
          <Mountain size={22} color="#10B981" />
          <Text style={styles.brandTitle}>CRUX</Text>
          <View style={styles.offlinePill}>
            <WifiOff size={10} color="#10B981" />
            <Text style={styles.offlineText}>OFFLINE</Text>
          </View>
        </TouchableOpacity>

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
            onPress={() => setCurrentTab(currentTab === 'logbook' ? 'home' : 'logbook')}
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

      {/* Conteúdo Principal: Home, Guia da Falésia ou Logbook */}
      {currentTab === 'home' ? (
        <HomeScreen
          destinations={destinations}
          onSelectDestination={handleSelectDestination}
        />
      ) : currentTab === 'logbook' ? (
        <LogbookScreen logs={logs} onClose={() => setCurrentTab('home')} />
      ) : (
        <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* Botão Voltar para Seleção de Cidades / Destinos */}
          <TouchableOpacity
            style={styles.backToHomeBtn}
            onPress={() => setCurrentTab('home')}
            activeOpacity={0.7}
          >
            <ArrowLeft size={16} color="#38BDF8" />
            <Text style={styles.backToHomeText}>
              Ver outras cidades / destinos ({selectedDestination.name}, {selectedDestination.state})
            </Text>
          </TouchableOpacity>

          {/* Seletor do Setor Atual */}
          <View style={styles.sectorBar}>
            <View style={styles.sectorInfo}>
              <View style={styles.sectorBreadcrumb}>
                <MapPin size={13} color="#38BDF8" />
                <Text style={styles.sectorLocation}>
                  {selectedDestination.name} ({selectedDestination.state}) • {currentSector.cragName}
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

          {/* Carrossel de Alternância de Setores do Polo */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectorTabsScroll}
          >
            {currentSectors.map((sec, sIdx) => {
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
                  <Text style={styles.sectorTabSub}>
                    {sec.walls[0]?.routes.length || 0} vias cadastradas
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Componente Central da Parede (Orquestrador 3D -> 2D -> Foto) */}
          <WallVisualContainer
            wall={currentWall}
            selectedRouteId={selectedRoute?.id || null}
            onSelectRoute={(route) => setSelectedRoute(route)}
            preferredGradeSystem={gradeSystem}
          />
        </ScrollView>
      )}

      {/* Barra de Navegação Inferior Fixa */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bottomBarItem, currentTab === 'home' && styles.bottomBarItemActive]}
          onPress={() => setCurrentTab('home')}
        >
          <Map size={20} color={currentTab === 'home' ? '#38BDF8' : '#64748B'} />
          <Text style={[styles.bottomBarText, currentTab === 'home' && styles.bottomBarTextActive]}>
            Destinos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBarItem, currentTab === 'guide' && styles.bottomBarItemActive]}
          onPress={() => setCurrentTab('guide')}
        >
          <Mountain size={20} color={currentTab === 'guide' ? '#10B981' : '#64748B'} />
          <Text style={[styles.bottomBarText, currentTab === 'guide' && styles.bottomBarTextActive]}>
            Guia da Parede
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomBarItem, currentTab === 'logbook' && styles.bottomBarItemActive]}
          onPress={() => setCurrentTab('logbook')}
        >
          <Award size={20} color={currentTab === 'logbook' ? '#F59E0B' : '#64748B'} />
          <Text style={[styles.bottomBarText, currentTab === 'logbook' && styles.bottomBarTextActive]}>
            Meu Diário
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modais de Interação */}
      <RouteDetailModal
        route={selectedRoute}
        onClose={() => setSelectedRoute(null)}
        onOpenLogbook={(route) => setLogbookRoute(route)}
        preferredGradeSystem={gradeSystem}
      />

      <LogAscentModal
        route={logbookRoute}
        wall={currentWall}
        sector={currentSector}
        visible={!!logbookRoute}
        onClose={() => setLogbookRoute(null)}
        onSaveAscent={handleSaveAscent}
      />

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
  backToHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  backToHomeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
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
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  bottomBarItem: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  bottomBarItemActive: {},
  bottomBarText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomBarTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
});
