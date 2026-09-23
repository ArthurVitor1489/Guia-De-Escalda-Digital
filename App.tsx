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
  Image,
  Modal,
} from 'react-native';
import {
  Sector,
  Wall,
  Route,
  AscentLog,
  ClimbingDestination,
  UserProfile,
  CommunityPhoto,
} from './src/types/climbing';
import { MOCK_SECTORS, CLIMBING_DESTINATIONS } from './src/services/mockData';
import { StorageService } from './src/services/storageService';
import { CommunityService, DEFAULT_USER } from './src/services/communityService';
import { HomeScreen } from './src/components/home/HomeScreen';
import { CreateCityModal } from './src/components/home/CreateCityModal';
import { CreateCragModal } from './src/components/home/CreateCragModal';
import { CreateRouteModal } from './src/components/routes/CreateRouteModal';
import { WallVisualContainer } from './src/components/wall/WallVisualContainer';
import { RouteDetailModal } from './src/components/routes/RouteDetailModal';
import { LogAscentModal } from './src/components/logbook/LogAscentModal';
import { SectorApproachModal } from './src/components/common/SectorApproachModal';
import { LogbookScreen } from './src/components/logbook/LogbookScreen';
import { UserProfileScreen } from './src/components/profile/UserProfileScreen';
import { AuthScreen } from './src/components/auth/AuthScreen';
import { PostPhotoModal } from './src/components/community/PostPhotoModal';
import {
  Mountain,
  Compass,
  Award,
  MapPin,
  WifiOff,
  ArrowLeft,
  Map,
  Plus,
  User,
  Users,
  Camera,
  LogIn,
} from 'lucide-react-native';

export default function App() {
  const [destinations, setDestinations] = useState<ClimbingDestination[]>(CLIMBING_DESTINATIONS);
  const [selectedDestination, setSelectedDestination] = useState<ClimbingDestination>(CLIMBING_DESTINATIONS[0]);
  const [activeSectorIndex, setActiveSectorIndex] = useState(0);
  const [activeWallIndex, setActiveWallIndex] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [logbookRoute, setLogbookRoute] = useState<Route | null>(null);
  const [photoTargetRoute, setPhotoTargetRoute] = useState<Route | null>(null);
  const [showApproachModal, setShowApproachModal] = useState(false);
  const [showCreateCityModal, setShowCreateCityModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateRouteModal, setShowCreateRouteModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPostPhotoModal, setShowPostPhotoModal] = useState(false);
  const [currentTab, setCurrentTab] = useState<'home' | 'guide' | 'logbook' | 'profile'>('home');
  const [gradeSystem, setGradeSystem] = useState<'brazilian' | 'french' | 'yds'>('brazilian');
  const [logs, setLogs] = useState<AscentLog[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [communityPhotos, setCommunityPhotos] = useState<CommunityPhoto[]>([]);

  // Setores do destino atualmente selecionado
  const currentSectors = selectedDestination.sectors || MOCK_SECTORS;
  const currentSector = currentSectors[activeSectorIndex] || currentSectors[0];
  const currentWall = currentSector.walls[activeWallIndex] || currentSector.walls[0];

  // Carrega preferências, usuário, fotos da comunidade e dados ao iniciar
  useEffect(() => {
    async function loadInitialData() {
      const savedLogs = await StorageService.getLogbook();
      setLogs(savedLogs);
      const prefs = await StorageService.getPreferences();
      setGradeSystem(prefs.gradeSystem);
      const customDests = await StorageService.getCustomDestinations();
      if (customDests && customDests.length > 0) {
        setDestinations([...customDests, ...CLIMBING_DESTINATIONS]);
      }
      const user = await CommunityService.getCurrentUser();
      setCurrentUser(user);
      const photos = await CommunityService.getCommunityPhotos();
      setCommunityPhotos(photos);
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

    // Atualiza contagem no perfil do usuário
    if (currentUser) {
      const updated = {
        ...currentUser,
        totalAscentsCount: (currentUser.totalAscentsCount || 0) + 1,
      };
      await CommunityService.updateProfile(updated);
      setCurrentUser(updated);
    }
  };

  // NÍVEL 1: Salva uma nova cidade / polo cadastrado
  const handleSaveCity = async (newCity: ClimbingDestination) => {
    await StorageService.saveCustomDestination(newCity);
    setDestinations(prev => [newCity, ...prev.filter(d => d.id !== newCity.id)]);
    setSelectedDestination(newCity);
    setActiveSectorIndex(0);
    setActiveWallIndex(0);
    setSelectedRoute(null);
    setCurrentTab('guide');
  };

  // NÍVEL 2: Salva uma nova pedra / falésia dentro de uma cidade
  const handleSaveSector = async (
    destId: string,
    newSector: Sector,
    baseDestination?: ClimbingDestination
  ) => {
    const targetDest = baseDestination || destinations.find(d => d.id === destId) || selectedDestination;
    const updatedDest = await StorageService.addSectorToDestination(destId, newSector, targetDest);

    if (updatedDest) {
      setDestinations(prev => {
        const exists = prev.some(d => d.id === updatedDest.id);
        if (exists) {
          return prev.map(d => (d.id === updatedDest.id ? updatedDest : d));
        }
        return [updatedDest, ...prev];
      });
      setSelectedDestination(updatedDest);
      setActiveSectorIndex(updatedDest.sectors.length - 1);
      setActiveWallIndex(0);
      setSelectedRoute(null);
    }
    setCurrentTab('guide');
  };

  // NÍVEL 3: Salva uma nova via ou boulder dentro da pedra ativa
  const handleSaveRoute = async (newRoute: Route) => {
    const updatedDest = await StorageService.addRouteToSector(
      selectedDestination.id,
      currentSector.id,
      currentWall.id,
      newRoute,
      selectedDestination
    );

    if (updatedDest) {
      setDestinations(prev => prev.map(d => (d.id === updatedDest.id ? updatedDest : d)));
      setSelectedDestination(updatedDest);
    } else {
      // Atualização imediata local em memória
      const updatedSectors = currentSectors.map((sec, sIdx) => {
        if (sIdx !== activeSectorIndex) return sec;
        const updatedWalls = sec.walls.map((wall, wIdx) => {
          if (wIdx !== activeWallIndex) return wall;
          return {
            ...wall,
            routes: [...wall.routes, newRoute],
          };
        });
        return { ...sec, walls: updatedWalls };
      });
      const updatedDestLocal = {
        ...selectedDestination,
        sectors: updatedSectors,
        totalRoutes: (selectedDestination.totalRoutes || 0) + 1,
        hasBoulder: selectedDestination.hasBoulder || newRoute.style === 'boulder',
        hasSport: selectedDestination.hasSport || newRoute.style === 'esportiva',
        hasTrad: selectedDestination.hasTrad || newRoute.style === 'tradicional',
      };
      setDestinations(prev => prev.map(d => (d.id === updatedDestLocal.id ? updatedDestLocal : d)));
      setSelectedDestination(updatedDestLocal);
    }

    setSelectedRoute(newRoute);
  };

  // Seleciona um destino a partir da Tela Inicial
  const handleSelectDestination = (dest: ClimbingDestination) => {
    setSelectedDestination(dest);
    setActiveSectorIndex(0);
    setActiveWallIndex(0);
    setSelectedRoute(null);
    setCurrentTab('guide');
  };

  // Salva uma nova foto postada na comunidade
  const handleSavePhoto = async (photoData: any) => {
    const newPhoto = await CommunityService.addCommunityPhoto(photoData);
    setCommunityPhotos(prev => [newPhoto, ...prev]);
    const updatedUser = await CommunityService.getCurrentUser();
    setCurrentUser(updatedUser);
  };

  // Sair da Conta (Logout)
  const handleLogout = async () => {
    await CommunityService.logout();
    setCurrentUser(null);
    setShowAuthModal(true);
  };

  // Abre modal de postagem de foto (exige login)
  const handleOpenPostPhoto = (route?: Route) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setPhotoTargetRoute(route || null);
    setShowPostPhotoModal(true);
  };

  // Abre cadastro de cidade (Nível 1)
  const handleOpenCreateCity = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setShowCreateCityModal(true);
  };

  // Abre cadastro de pedra em campo (Nível 2)
  const handleOpenCreateCrag = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  // Abre cadastro de via ou boulder (Nível 3)
  const handleOpenCreateRoute = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setShowCreateRouteModal(true);
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

          {/* Mini Perfil do Usuário ou Botão Entrar */}
          {currentUser ? (
            <TouchableOpacity
              style={[styles.userNavbarBtn, currentTab === 'profile' && styles.userNavbarBtnActive]}
              onPress={() => setCurrentTab('profile')}
              activeOpacity={0.8}
            >
              <Image source={{ uri: currentUser.avatarUrl }} style={styles.userNavbarAvatar} />
              <Text style={styles.userNavbarName} numberOfLines={1}>
                {currentUser.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginNavbarBtn}
              onPress={() => setShowAuthModal(true)}
              activeOpacity={0.8}
            >
              <LogIn size={14} color="#0F172A" />
              <Text style={styles.loginNavbarBtnText}>Entrar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conteúdo Principal: Home, Guia da Falésia, Logbook ou Perfil */}
      {currentTab === 'home' ? (
        <HomeScreen
          destinations={destinations}
          onSelectDestination={handleSelectDestination}
          onOpenCreateCity={handleOpenCreateCity}
        />
      ) : currentTab === 'logbook' ? (
        <LogbookScreen logs={logs} onClose={() => setCurrentTab('home')} />
      ) : currentTab === 'profile' ? (
        <UserProfileScreen
          user={currentUser}
          logs={logs}
          communityPhotos={communityPhotos}
          customDestinations={destinations.filter(d => !CLIMBING_DESTINATIONS.some(c => c.id === d.id))}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onOpenPostPhoto={() => handleOpenPostPhoto()}
          onOpenCreateCrag={handleOpenCreateCrag}
          onLogout={handleLogout}
          onUpdateUser={(updated) => setCurrentUser(updated)}
        />
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
                    {sec.walls[0]?.routes?.length || 0} vias cadastradas
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Botão Adicionar Nova Pedra nesta Cidade */}
            <TouchableOpacity
              style={styles.addSectorTabBtn}
              onPress={handleOpenCreateCrag}
              activeOpacity={0.8}
            >
              <Plus size={14} color="#10B981" />
              <Text style={styles.addSectorTabBtnText}>Nova Pedra</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Barra de Ação da Parede / Setor: Cadastrar Via ou Boulder */}
          <View style={styles.routeActionBar}>
            <View style={styles.routeActionInfo}>
              <Text style={styles.routeActionTitle}>Vias & Boulders da {currentSector.name}</Text>
              <Text style={styles.routeActionSub}>
                {currentWall?.routes?.length || 0} vias e blocos cadastrados nesta face
              </Text>
            </View>

            <TouchableOpacity
              style={styles.createRouteBtn}
              onPress={handleOpenCreateRoute}
              activeOpacity={0.8}
            >
              <Plus size={14} color="#0F172A" />
              <Text style={styles.createRouteBtnText}>VIA / BOULDER</Text>
            </TouchableOpacity>
          </View>

          {/* Componente Central da Parede (Orquestrador 3D -> 2D -> Foto) */}
          <WallVisualContainer
            wall={currentWall}
            selectedRouteId={selectedRoute?.id || null}
            onSelectRoute={(route) => setSelectedRoute(route)}
            preferredGradeSystem={gradeSystem}
          />
        </ScrollView>
      )}

      {/* Barra de Navegação Inferior Fixa (4 Abas) */}
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
            Guia Parede
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

        <TouchableOpacity
          style={[styles.bottomBarItem, currentTab === 'profile' && styles.bottomBarItemActive]}
          onPress={() => setCurrentTab('profile')}
        >
          <User size={20} color={currentTab === 'profile' ? '#A855F7' : '#64748B'} />
          <Text style={[styles.bottomBarText, currentTab === 'profile' && styles.bottomBarTextActive]}>
            Meu Perfil
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modais de Interação */}
      <RouteDetailModal
        route={selectedRoute}
        onClose={() => setSelectedRoute(null)}
        onOpenLogbook={(route) => setLogbookRoute(route)}
        preferredGradeSystem={gradeSystem}
        communityPhotos={communityPhotos}
        onOpenPostPhoto={(route) => handleOpenPostPhoto(route)}
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

      {/* NÍVEL 1: Modal de Cadastro de Nova Cidade / Polo */}
      <CreateCityModal
        visible={showCreateCityModal}
        onClose={() => setShowCreateCityModal(false)}
        onSave={handleSaveCity}
      />

      {/* NÍVEL 2: Modal de Cadastro de Nova Pedra / Falésia */}
      <CreateCragModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        destinations={destinations}
        defaultDestinationId={selectedDestination?.id}
        onSaveCrag={handleSaveSector}
        onOpenCreateCity={handleOpenCreateCity}
      />

      {/* NÍVEL 3: Modal de Cadastro de Nova Via ou Boulder */}
      <CreateRouteModal
        visible={showCreateRouteModal}
        onClose={() => setShowCreateRouteModal(false)}
        destinationName={selectedDestination.name}
        sectorName={currentSector.name}
        wallName={currentWall?.name}
        existingRoutesCount={currentWall?.routes?.length || 0}
        onSaveRoute={handleSaveRoute}
      />

      {/* Modal de Publicação de Foto na Comunidade */}
      <PostPhotoModal
        visible={showPostPhotoModal}
        onClose={() => setShowPostPhotoModal(false)}
        currentUser={currentUser || DEFAULT_USER}
        activeRoute={photoTargetRoute || selectedRoute}
        activeWall={currentWall}
        onSavePhoto={handleSavePhoto}
      />

      {/* Modal / Tela de Autenticação, Login e Cadastro */}
      <Modal
        visible={showAuthModal}
        animationType="slide"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <AuthScreen
          onSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
          }}
          onContinueAsGuest={() => setShowAuthModal(false)}
          onClose={() => setShowAuthModal(false)}
        />
      </Modal>
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
  userNavbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userNavbarBtnActive: {
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  userNavbarAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  userNavbarName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 70,
  },
  loginNavbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  loginNavbarBtnText: {
    color: '#0F172A',
    fontSize: 12,
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
  addSectorTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignSelf: 'center',
    minHeight: 65,
  },
  addSectorTabBtnText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  routeActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  routeActionInfo: {
    flex: 1,
  },
  routeActionTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  routeActionSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  createRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createRouteBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
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
    paddingHorizontal: 14,
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
