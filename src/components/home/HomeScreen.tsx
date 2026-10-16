// Tela Inicial — Seleção de Destinos e Polos de Escalada (Paraíba, Nordeste e Brasil)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { ClimbingDestination } from '../../types/climbing';
import {
  Search,
  MapPin,
  Mountain,
  ChevronRight,
  Sparkles,
  Compass,
  Layers,
  Box,
  Shield,
  Star,
  Plus,
} from 'lucide-react-native';

interface HomeScreenProps {
  destinations: ClimbingDestination[];
  onSelectDestination: (dest: ClimbingDestination) => void;
  onOpenCreateCity: () => void;
  onOpenCreateCrag?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  destinations,
  onSelectDestination,
  onOpenCreateCity,
}) => {
  const [selectedState, setSelectedState] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Estados únicos presentes na base
  const availableStates = ['TODOS', 'PB', 'RN', 'MG'];

  // Filtro por Estado e Texto de Busca
  const filteredDestinations = destinations.filter(dest => {
    const matchesState = selectedState === 'TODOS' || dest.state === selectedState;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      dest.name.toLowerCase().includes(query) ||
      dest.regionName.toLowerCase().includes(query) ||
      dest.rockType.toLowerCase().includes(query) ||
      dest.highlights.some(h => h.toLowerCase().includes(query));
    return matchesState && matchesQuery;
  });

  const featuredDest = destinations.find(d => d.id === 'dest-algodao-jandaira') || destinations[0];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Hero Header */}
      <View style={styles.heroSection}>
        <View style={styles.heroBadge}>
          <Sparkles size={12} color="#10B981" />
          <Text style={styles.heroBadgeText}>GUIA DIGITAL DE ESCALADA</Text>
        </View>
        <Text style={styles.heroTitle}>Onde vamos escalar hoje?</Text>
        <Text style={styles.heroSubtitle}>
          Escolha uma cidade ou polo para explorar pedras, vias esportivas, boulders e paredes em 3D.
        </Text>

        {/* Botão de Cadastro: Cidade / Polo (Nível 1) */}
        <TouchableOpacity
          style={styles.createCityHeroBtn}
          onPress={onOpenCreateCity}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#0F172A" />
          <Text style={styles.createCityHeroBtnText}>CADASTRAR NOVA CIDADE / POLO</Text>
        </TouchableOpacity>

        {/* Barra de Pesquisa */}
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cidade, falésia ou rocha (ex: Sousa, Algodão, Granito)..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filtro por Estado */}
      <View style={styles.statesFilterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statesScroll}
        >
          {availableStates.map(st => {
            const isSelected = selectedState === st;
            const count =
              st === 'TODOS'
                ? destinations.length
                : destinations.filter(d => d.state === st).length;

            return (
              <TouchableOpacity
                key={st}
                style={[styles.stateChip, isSelected && styles.stateChipActive]}
                onPress={() => setSelectedState(st)}
                activeOpacity={0.7}
              >
                <Text style={[styles.stateChipText, isSelected && styles.stateChipTextActive]}>
                  {st === 'TODOS'
                    ? 'Todos os Estados'
                    : st === 'PB'
                    ? 'Paraíba (PB)'
                    : st === 'RN'
                    ? 'Rio Grande do Norte (RN)'
                    : 'Minas Gerais (MG)'}
                </Text>
                <View style={[styles.stateCountBadge, isSelected && styles.stateCountBadgeActive]}>
                  <Text style={[styles.stateCountText, isSelected && styles.stateCountTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Destaque Principal: Exibe apenas se houver ao menos 1 destino cadastrado */}
      {featuredDest && (selectedState === 'TODOS' || selectedState === featuredDest.state) ? (
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <Star size={14} color="#FFE600" fill="#FFE600" />
            <Text style={styles.featuredTag}>POLO EM DESTAQUE ({featuredDest.state})</Text>
          </View>

          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => onSelectDestination(featuredDest)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: featuredDest.coverImage }} style={styles.featuredImage} />
            <View style={styles.featuredOverlay} />

            <View style={styles.featuredContent}>
              <View style={styles.featuredBadgesRow}>
                <View style={styles.badgeState}>
                  <Text style={styles.badgeStateText}>{featuredDest.state}</Text>
                </View>
              </View>

              <Text style={styles.featuredTitle}>{featuredDest.name}</Text>
              <Text style={styles.featuredRegion}>{featuredDest.regionName}</Text>
              <Text style={styles.featuredDesc} numberOfLines={2}>
                {featuredDest.description}
              </Text>

              <View style={styles.featuredMetaRow}>
                <Text style={styles.featuredMetaText}>
                  🪨 {featuredDest.totalRoutes} vias • {featuredDest.totalSectors} setores • {featuredDest.rockType}
                </Text>
                <View style={styles.featuredActionBtn}>
                  <Text style={styles.featuredActionText}>EXPLORAR</Text>
                  <ChevronRight size={14} color="#0F172A" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Lista / Grid de Polos de Escalada */}
      <View style={styles.destinationsListSection}>
        <Text style={styles.listSectionTitle}>
          POLOS & CIDADES CADASTRADAS ({filteredDestinations.length})
        </Text>

        {filteredDestinations.length === 0 ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 28,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: '#E2E8F0',
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 6, textAlign: 'center' }}>
              Nenhuma cidade cadastrada ainda
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19, marginBottom: 18 }}>
              O seu guia está limpo e pronto para uso real! Comece cadastrando a sua primeira cidade ou polo de escalada.
            </Text>
            <TouchableOpacity
              style={[styles.createCityHeroBtn, { width: '100%', marginBottom: 0 }]}
              onPress={onOpenCreateCity}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#0F172A" />
              <Text style={styles.createCityHeroBtnText}>CADASTRAR PRIMEIRA CIDADE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.destinationsGrid}>
            {filteredDestinations.map(dest => (
              <TouchableOpacity
                key={dest.id}
                style={styles.destCard}
                onPress={() => onSelectDestination(dest)}
                activeOpacity={0.8}
              >
                <View style={styles.destBannerWrapper}>
                  <Image
                    source={{ uri: dest.coverImage }}
                    style={styles.destBannerImage}
                    resizeMode="cover"
                  />
                  <View style={styles.destBannerOverlay} />
                  
                  <View style={styles.destBannerBadges}>
                    <View style={styles.destStateBadge}>
                      <Text style={styles.destStateBadgeText}>{dest.state}</Text>
                    </View>
                    <View style={styles.offlineBadgeSmall}>
                      <Text style={styles.offlineBadgeSmallText}>OFFLINE</Text>
                    </View>
                  </View>

                  <View style={styles.destBannerBottom}>
                    <Text style={styles.destName}>{dest.name}</Text>
                    <Text style={styles.destRegion}>{dest.regionName}</Text>
                  </View>
                </View>

                <View style={styles.destInfo}>
                  <View style={styles.destPillsRow}>
                    <Text style={styles.destRoutesPill}>
                      🧗 {dest.totalRoutes} vias
                    </Text>
                    <Text style={styles.destRockPill}>
                      🪨 {dest.rockType}
                    </Text>
                    <Text style={styles.destSectorsPill}>
                      📍 {dest.totalSectors} setores
                    </Text>
                  </View>

                  {dest.distanceFromCapital ? (
                    <Text style={styles.destDistance} numberOfLines={1}>
                      🚗 {dest.distanceFromCapital}
                    </Text>
                  ) : null}

                  <View style={styles.destFooter}>
                    <Text style={styles.destHighlightText} numberOfLines={1}>
                      ⭐ {dest.highlights?.[0] || dest.name}
                    </Text>
                    <View style={styles.exploreBtnSmall}>
                      <Text style={styles.exploreBtnSmallText}>ABRIR GUIA</Text>
                      <ChevronRight size={14} color="#059669" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  heroBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  createCityHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  createCityHeroBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  statesFilterSection: {
    marginBottom: 14,
  },
  statesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  stateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  stateChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  stateChipText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  stateChipTextActive: {
    color: '#FFFFFF',
  },
  stateCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  stateCountBadgeActive: {
    backgroundColor: '#047857',
  },
  stateCountText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
  },
  stateCountTextActive: {
    color: '#FFFFFF',
  },
  featuredSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  featuredTag: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    height: 220,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#0F172A',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  badge3D: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badge3DText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  badgeState: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeStateText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  featuredRegion: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  featuredDesc: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 8,
  },
  featuredMetaText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  featuredActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  featuredActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  destinationsListSection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  listSectionTitle: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  destinationsGrid: {
    gap: 14,
  },
  destCard: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  destBannerWrapper: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  destBannerImage: {
    width: '100%',
    height: '100%',
  },
  destBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  destBannerBadges: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  destStateBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  destStateBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '900',
  },
  dest3DBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  dest3DBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  offlineBadgeSmall: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(5, 150, 105, 0.9)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  offlineBadgeSmallText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  destBannerBottom: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
  },
  destName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  destRegion: {
    color: '#BAE6FD',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  destInfo: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  destPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  destRoutesPill: {
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  destRockPill: {
    color: '#047857',
    backgroundColor: '#ECFDF5',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  destSectorsPill: {
    color: '#475569',
    backgroundColor: '#F1F5F9',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  destDistance: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 8,
  },
  destFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  destHighlightText: {
    flex: 1,
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  exploreBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  exploreBtnSmallText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '900',
  },
});
