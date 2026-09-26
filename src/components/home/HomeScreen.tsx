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

      {/* Destaque Principal: Algodão de Jandaíra (PB) */}
      {selectedState === 'TODOS' || selectedState === 'PB' ? (
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <Star size={14} color="#FFE600" fill="#FFE600" />
            <Text style={styles.featuredTag}>POLO EM DESTAQUE NA PARAÍBA</Text>
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
                <View style={styles.badge3D}>
                  <Box size={11} color="#000000" />
                  <Text style={styles.badge3DText}>3D ATIVO</Text>
                </View>
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
          POLOS & CIDADES DISPONÍVEIS ({filteredDestinations.length})
        </Text>

        <View style={styles.destinationsGrid}>
          {filteredDestinations.map(dest => (
            <TouchableOpacity
              key={dest.id}
              style={styles.destCard}
              onPress={() => onSelectDestination(dest)}
              activeOpacity={0.8}
            >
              <View style={styles.destImageWrapper}>
                <Image
                  source={{ uri: dest.coverImage }}
                  style={styles.destImage}
                  resizeMode="cover"
                />
                <View style={styles.destStateBadge}>
                  <Text style={styles.destStateBadgeText}>{dest.state}</Text>
                </View>
                {dest.has3D && (
                  <View style={styles.dest3DBadge}>
                    <Text style={styles.dest3DBadgeText}>3D</Text>
                  </View>
                )}
              </View>

              <View style={styles.destInfo}>
                <View style={styles.destTopRow}>
                  <Text style={styles.destName}>{dest.name}</Text>
                </View>
                <Text style={styles.destRegion}>{dest.regionName}</Text>

                <View style={styles.destPillsRow}>
                  <Text style={styles.destRoutesPill}>
                    {dest.totalRoutes} vias
                  </Text>
                  <Text style={styles.destRockPill}>
                    {dest.rockType}
                  </Text>
                </View>

                {dest.distanceFromCapital ? (
                  <Text style={styles.destDistance} numberOfLines={1}>
                    📍 {dest.distanceFromCapital}
                  </Text>
                ) : null}

                <View style={styles.destFooter}>
                  <Text style={styles.destHighlightText} numberOfLines={1}>
                    ⭐ {dest.highlights[0]}
                  </Text>
                  <ChevronRight size={16} color="#38BDF8" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  createCityHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#38BDF8',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 14,
  },
  createCityHeroBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  statesFilterSection: {
    marginBottom: 16,
  },
  statesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  stateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stateChipActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  stateChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  stateChipTextActive: {
    color: '#0F172A',
  },
  stateCountBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  stateCountBadgeActive: {
    backgroundColor: '#0284C7',
  },
  stateCountText: {
    color: '#94A3B8',
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
    color: '#FFE600',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    height: 220,
    borderWidth: 1,
    borderColor: '#334155',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 8,
  },
  featuredMetaText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  featuredActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  featuredActionText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  destinationsListSection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  listSectionTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  destinationsGrid: {
    gap: 12,
  },
  destCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 115,
  },
  destImageWrapper: {
    width: 110,
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  destImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  destStateBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  destStateBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  dest3DBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dest3DBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  destInfo: {
    flex: 1,
    padding: 12,
  },
  destTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  destName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  destRegion: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 6,
  },
  destPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  destRoutesPill: {
    color: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  destRockPill: {
    color: '#CBD5E1',
    backgroundColor: '#0F172A',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  destDistance: {
    color: '#64748B',
    fontSize: 10,
    marginBottom: 8,
  },
  destFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 6,
  },
  destHighlightText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '500',
  },
});
