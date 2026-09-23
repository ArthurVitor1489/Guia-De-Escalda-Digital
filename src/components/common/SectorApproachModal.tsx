// Modal de Acesso, Trilha e Localização GPS do Setor de Escalada
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Sector } from '../../types/climbing';
import {
  X,
  MapPin,
  Clock,
  Compass,
  Mountain,
  AlertCircle,
  CheckCircle2,
  Navigation,
  ExternalLink,
} from 'lucide-react-native';

interface SectorApproachModalProps {
  sector: Sector | null;
  visible: boolean;
  onClose: () => void;
}

export const SectorApproachModal: React.FC<SectorApproachModalProps> = ({
  sector,
  visible,
  onClose,
}) => {
  if (!sector) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.sectorTitle}>{sector.name}</Text>
              <Text style={styles.sectorSub}>
                {sector.cragName} • {sector.city}/{sector.state}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Métricas do Acesso */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Clock size={16} color="#38BDF8" />
                <Text style={styles.statLabel}>Caminhada</Text>
                <Text style={styles.statValue}>{sector.approachTimeMinutes} min</Text>
              </View>

              <View style={styles.statBox}>
                <Mountain size={16} color="#10B981" />
                <Text style={styles.statLabel}>Altitude</Text>
                <Text style={styles.statValue}>{sector.elevationMeters} m</Text>
              </View>

              <View style={styles.statBox}>
                <CheckCircle2 size={16} color="#F59E0B" />
                <Text style={styles.statLabel}>Status</Text>
                <Text style={styles.statValue}>
                  {sector.accessStatus.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Coordenadas GPS */}
            <View style={styles.gpsCard}>
              <View style={styles.gpsHeader}>
                <Navigation size={16} color="#38BDF8" />
                <Text style={styles.gpsTitle}>Coordenadas GPS da Base</Text>
              </View>
              <Text style={styles.gpsCoords}>
                {sector.coordinates.latitude.toFixed(4)}°, {sector.coordinates.longitude.toFixed(4)}°
              </Text>
              <Text style={styles.gpsNote}>
                Disponível offline. Use com seu app de navegação GPS preferido.
              </Text>
            </View>

            {/* Como Chegar & Trilha */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>DESCRIÇÃO DA TRILHA DE ACESSO</Text>
              <Text style={styles.sectionText}>{sector.approachTrailDescription}</Text>
            </View>

            {/* Regras e Preservação */}
            {sector.rules && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>REGRAS & ÉTICA LOCAL</Text>
                {sector.rules.map((rule, idx) => (
                  <View key={idx} style={styles.ruleRow}>
                    <Text style={styles.ruleBullet}>•</Text>
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* História do Setor */}
            {sector.history && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>HISTÓRIA DO SETOR</Text>
                <Text style={styles.sectionText}>{sector.history}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectorSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  contentScroll: {
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  gpsCard: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  gpsTitle: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  gpsCoords: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  gpsNote: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 20,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  ruleBullet: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '700',
  },
  ruleText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
});
