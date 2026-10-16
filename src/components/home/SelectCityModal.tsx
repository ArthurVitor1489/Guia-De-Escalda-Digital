// Modal de Seleção Rápida de Cidade / Polo — CRUX
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { ClimbingDestination } from '../../types/climbing';
import {
  MapPin,
  Search,
  X,
  Check,
  ChevronRight,
  Plus,
  Compass,
  CheckCircle2,
} from 'lucide-react-native';

interface SelectCityModalProps {
  visible: boolean;
  onClose: () => void;
  destinations: ClimbingDestination[];
  selectedDestination: ClimbingDestination | null;
  onSelectDestination: (dest: ClimbingDestination) => void;
  onOpenCreateCity: () => void;
  isLightTheme?: boolean;
}

export const SelectCityModal: React.FC<SelectCityModalProps> = ({
  visible,
  onClose,
  destinations,
  selectedDestination,
  onSelectDestination,
  onOpenCreateCity,
  isLightTheme = true,
}) => {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState<string>('TODOS');

  const states = ['TODOS', 'PB', 'RN', 'MG'];

  const filtered = destinations.filter(d => {
    const matchesState = selectedState === 'TODOS' || d.state === selectedState;
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      d.name.toLowerCase().includes(query) ||
      d.regionName.toLowerCase().includes(query) ||
      d.state.toLowerCase().includes(query) ||
      d.rockType.toLowerCase().includes(query);
    return matchesState && matchesSearch;
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconCircle}>
                <MapPin size={20} color="#059669" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Trocar de Cidade / Polo</Text>
                <Text style={styles.headerSubtitle}>
                  Selecione o polo para abrir pedras e croquis
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Campo de Busca Rápida */}
          <View style={styles.searchBox}>
            <Search size={18} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar cidade, polo ou tipo de rocha..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>

          {/* Chips de Estados */}
          <View style={styles.statesRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statesContent}>
              {states.map(st => {
                const isActive = selectedState === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[styles.stateChip, isActive && styles.stateChipActive]}
                    onPress={() => setSelectedState(st)}
                  >
                    <Text style={[styles.stateChipText, isActive && styles.stateChipTextActive]}>
                      {st === 'TODOS' ? 'Todos os Estados' : st}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Lista de Cidades / Polos */}
          <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
            {filtered.map(dest => {
              const isCurrent = dest.id === selectedDestination?.id;
              return (
                <TouchableOpacity
                  key={dest.id}
                  style={[styles.cityCard, isCurrent && styles.cityCardSelected]}
                  onPress={() => {
                    onSelectDestination(dest);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: dest.coverImage }}
                    style={styles.cityThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.cityCardInfo}>
                    <View style={styles.cityNameRow}>
                      <Text style={[styles.cityName, isCurrent && styles.cityNameSelected]}>
                        {dest.name}
                      </Text>
                      <View style={styles.stateBadge}>
                        <Text style={styles.stateBadgeText}>{dest.state}</Text>
                      </View>
                    </View>

                    <Text style={styles.cityRegion} numberOfLines={1}>
                      {dest.regionName} • {dest.rockType}
                    </Text>

                    <View style={styles.cityMetaRow}>
                      <Text style={styles.cityViasBadge}>
                        {dest.totalRoutes} vias
                      </Text>
                      <Text style={styles.citySectorsBadge}>
                        {dest.totalSectors} setores
                      </Text>
                      <View style={styles.offlineAvailableBadge}>
                        <CheckCircle2 size={11} color="#059669" />
                        <Text style={styles.offlineAvailableText}>OFFLINE</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cityActionCol}>
                    {isCurrent ? (
                      <View style={styles.checkActiveIcon}>
                        <Check size={18} color="#FFFFFF" />
                      </View>
                    ) : (
                      <ChevronRight size={18} color="#94A3B8" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {filtered.length === 0 && (
              <View style={styles.emptyState}>
                <Compass size={36} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Nenhuma cidade encontrada</Text>
                <Text style={styles.emptyDesc}>
                  Você pode cadastrar esse novo polo na base agora mesmo!
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Rodapé: Botão de Cadastrar Nova Cidade */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addCityBtn}
              onPress={() => {
                onClose();
                onOpenCreateCity();
              }}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addCityBtnText}>CADASTRAR NOVA CIDADE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '84%',
    display: 'flex',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  statesRow: {
    marginTop: 10,
    marginBottom: 8,
  },
  statesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  stateChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  stateChipActive: {
    backgroundColor: '#059669',
  },
  stateChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  stateChipTextActive: {
    color: '#FFFFFF',
  },
  listScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cityCardSelected: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  cityThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  cityCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cityName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cityNameSelected: {
    color: '#059669',
  },
  stateBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  stateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  cityRegion: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  cityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  cityViasBadge: {
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  citySectorsBadge: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  city3DBadge: {
    backgroundColor: '#FEF08A',
    color: '#854D0E',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  offlineAvailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  offlineAvailableText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: '800',
  },
  cityActionCol: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActiveIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 260,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  addCityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
  },
  addCityBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
