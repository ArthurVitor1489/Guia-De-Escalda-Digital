// Aplicativo Mobile Principal — CRUX: Guia Digital Interativo de Escalada
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { UserProfileScreen } from './src/components/profile/UserProfileScreen';
import { AuthScreen } from './src/components/auth/AuthScreen';
import { PostPhotoModal } from './src/components/community/PostPhotoModal';
import { SelectCityModal } from './src/components/home/SelectCityModal';
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
  ChevronDown,
} from 'lucide-react-native';

function MainApp() {
  const insets = useSafeAreaInsets();
  const [destinations, setDestinations] = useState<ClimbingDestination[]>(CLIMBING_DESTINATIONS);
  const [selectedDestination, setSelectedDestination] = useState<ClimbingDestination>(CLIMBING_DESTINATIONS[0]);
  const [activeSectorIndex, setActiveSectorIndex] = useState(0);
  const [activeWallIndex, setActiveWallIndex] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [logbookRoute, setLogbookRoute] = useState<Route | null>(null);
  const [photoTargetRoute, setPhotoTargetRoute] = useState<Route | null>(null);
  const [showApproachModal, setShowApproachModal] = useState(false);
  const [showSelectCityModal, setShowSelectCityModal] = useState(false);
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

  const topInset = Platform.select({
    android: Math.max(insets.top, StatusBar.currentHeight || 28) + 6,
    ios: Math.max(insets.top, 20) + 6,
    default: 12,
  });

  const bottomInset = Platform.select({
    android: Math.max(insets.bottom, 12) + 8,
    ios: Math.max(insets.bottom, 12) + 6,
    default: 14,
  });

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={Platform.OS === 'android'}
      />

      {/* Barra de Navegação Superior com Safe Area Inset no topo */}
      <View style={[styles.topNavbar, { paddingTop: topInset }]}>
        <View style={styles.topNavbarLeft}>
          <TouchableOpacity
            style={styles.brandRow}
            onPress={() => setCurrentTab('home')}
            activeOpacity={0.7}
          >
            <Mountain size={22} color="#059669" />
            <Text style={styles.brandTitle}>CRUX</Text>
          </TouchableOpacity>

          {/* Seletor Rápido de Cidade / Polo */}
          <TouchableOpacity
            style={styles.citySelectorBtn}
            onPress={() => setShowSelectCityModal(true)}
            activeOpacity={0.75}
          >
            <MapPin size={13} color="#059669" />
            <Text style={styles.citySelectorText} numberOfLines={1}>
              {selectedDestination.name} ({selectedDestination.state})
            </Text>
            <ChevronDown size={14} color="#059669" />
          </TouchableOpacity>
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

      {/* Conteúdo Principal: Home, Guia da Falésia ou Perfil (com Diário incluso) */}
      {currentTab === 'home' ? (
        <HomeScreen
          destinations={destinations}
          onSelectDestination={handleSelectDestination}
          onOpenCreateCity={handleOpenCreateCity}
        />
      ) : (currentTab === 'profile' || currentTab === 'logbook') ? (
        <UserProfileScreen
          user={currentUser}
          logs={logs}
          communityPhotos={communityPhotos}
          destinations={destinations}
          customDestinations={destinations.filter(d => !CLIMBING_DESTINATIONS.some(c => c.id === d.id))}
          initialTab={currentTab === 'logbook' ? 'ascents' : 'ascents'}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onOpenPostPhoto={() => handleOpenPostPhoto()}
          onOpenCreateCrag={handleOpenCreateCrag}
          onLogout={handleLogout}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          onSaveAscent={handleSaveAscent}
        />
      ) : (
        <ScrollView
          style={styles.scrollBody}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Botão para Trocar de Cidade / Polo */}
          <TouchableOpacity
            style={styles.backToHomeBtn}
            onPress={() => setShowSelectCityModal(true)}
            activeOpacity={0.7}
          >
            <MapPin size={15} color="#059669" />
            <Text style={styles.backToHomeText}>
              Polo: {selectedDestination.name} ({selectedDestination.state}) • Trocar cidade
            </Text>
            <ChevronDown size={14} color="#059669" />
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

      {/* Barra de Navegação Inferior Fixa (3 Abas Principais) com Safe Area Inset na base */}
      <View style={[styles.bottomBar, { paddingBottom: bottomInset }]}>
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
          style={[
            styles.bottomBarItem,
            (currentTab === 'profile' || currentTab === 'logbook') && styles.bottomBarItemActive,
          ]}
          onPress={() => setCurrentTab('profile')}
        >
          <User
            size={20}
            color={(currentTab === 'profile' || currentTab === 'logbook') ? '#10B981' : '#64748B'}
          />
          <Text
            style={[
              styles.bottomBarText,
              (currentTab === 'profile' || currentTab === 'logbook') && styles.bottomBarTextActive,
            ]}
          >
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

      {/* Modal de Seleção Rápida de Cidade / Polo */}
      <SelectCityModal
        visible={showSelectCityModal}
        onClose={() => setShowSelectCityModal(false)}
        destinations={destinations}
        selectedDestination={selectedDestination}
        onSelectDestination={handleSelectDestination}
        onOpenCreateCity={handleOpenCreateCity}
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
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topNavbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  citySelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    maxWidth: 160,
  },
  citySelectorText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '800',
    flexShrink: 1,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offlineText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: '800',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gradeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gradeToggleLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  gradeToggleActive: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '900',
  },
  userNavbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userNavbarBtnActive: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  userNavbarAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#059669',
  },
  userNavbarName: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
    maxWidth: 70,
  },
  loginNavbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  loginNavbarBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  scrollBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#F8FAFC',
  },
  backToHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'stretch',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  backToHomeText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  sectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
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
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  sectorNameText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  approachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  approachBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '800',
  },
  sectorTabsScroll: {
    gap: 10,
    marginBottom: 16,
  },
  sectorTabItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    minWidth: 130,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sectorTabItemSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
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
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  sectorTabTitleSelected: {
    color: '#059669',
    fontWeight: '900',
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
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#059669',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignSelf: 'center',
    minHeight: 65,
  },
  addSectorTabBtnText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800',
  },
  routeActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  routeActionInfo: {
    flex: 1,
  },
  routeActionTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
  routeActionSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  createRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createRouteBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
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
    color: '#059669',
    fontWeight: '900',
  },
});
