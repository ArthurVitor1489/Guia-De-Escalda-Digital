// Tela de Perfil e Diário de Cadenas do Escalador (Logbook)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AscentLog, AscentStyle } from '../../types/climbing';
import { Award, Star, Calendar, User, Mountain, Filter } from 'lucide-react-native';
import { getGradeBadgeColor } from '../../services/gradeConverter';

interface LogbookScreenProps {
  logs: AscentLog[];
  onClose: () => void;
}

export const LogbookScreen: React.FC<LogbookScreenProps> = ({ logs, onClose }) => {
  const [filterStyle, setFilterStyle] = useState<string>('all');

  const filteredLogs = filterStyle === 'all'
    ? logs
    : logs.filter(l => l.style === filterStyle);

  const totalAscents = logs.length;
  const redpointsCount = logs.filter(l => l.style === 'redpoint').length;
  const onsightsCount = logs.filter(l => l.style === 'onsight').length;
  const flashesCount = logs.filter(l => l.style === 'flash').length;

  const styleLabels: Record<AscentStyle, { label: string; color: string }> = {
    onsight: { label: 'À Vista', color: '#10B981' },
    flash: { label: 'Flash', color: '#3B82F6' },
    redpoint: { label: 'Trabalhada', color: '#8B5CF6' },
    repeat: { label: 'Repetição', color: '#64748B' },
    project: { label: 'Projeto', color: '#F59E0B' },
    top_rope: { label: 'Top Rope', color: '#06B6D4' },
  };

  return (
    <View style={styles.container}>
      {/* Resumo Estatístico */}
      <View style={styles.statsCard}>
        <View style={styles.mainStat}>
          <Text style={styles.mainStatNumber}>{totalAscents}</Text>
          <Text style={styles.mainStatLabel}>Cadenas Registradas</Text>
        </View>

        <View style={styles.subStatsRow}>
          <View style={styles.subStatItem}>
            <Text style={[styles.subStatValue, { color: '#10B981' }]}>{onsightsCount}</Text>
            <Text style={styles.subStatLabel}>À Vista</Text>
          </View>
          <View style={styles.subStatItem}>
            <Text style={[styles.subStatValue, { color: '#3B82F6' }]}>{flashesCount}</Text>
            <Text style={styles.subStatLabel}>Flash</Text>
          </View>
          <View style={styles.subStatItem}>
            <Text style={[styles.subStatValue, { color: '#8B5CF6' }]}>{redpointsCount}</Text>
            <Text style={styles.subStatLabel}>Redpoint</Text>
          </View>
        </View>
      </View>

      {/* Filtros por Estilo */}
      <View style={styles.filtersBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          <TouchableOpacity
            style={[styles.filterChip, filterStyle === 'all' && styles.filterChipActive]}
            onPress={() => setFilterStyle('all')}
          >
            <Text style={[styles.filterChipText, filterStyle === 'all' && styles.filterChipTextActive]}>
              Todas ({logs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStyle === 'onsight' && styles.filterChipActive]}
            onPress={() => setFilterStyle('onsight')}
          >
            <Text style={[styles.filterChipText, filterStyle === 'onsight' && styles.filterChipTextActive]}>
              À Vista ({onsightsCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStyle === 'redpoint' && styles.filterChipActive]}
            onPress={() => setFilterStyle('redpoint')}
          >
            <Text style={[styles.filterChipText, filterStyle === 'redpoint' && styles.filterChipTextActive]}>
              Redpoint ({redpointsCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Lista de Registros */}
      <ScrollView style={styles.logsScroll} contentContainerStyle={{ gap: 10 }}>
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Mountain size={36} color="#475569" />
            <Text style={styles.emptyText}>Nenhuma cadena registrada nesta categoria.</Text>
          </View>
        ) : (
          filteredLogs.map(log => {
            const styleBadge = styleLabels[log.style] || { label: log.style, color: '#64748B' };
            const gradeColor = getGradeBadgeColor(log.gradeStr);

            return (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logCardHeader}>
                  <View style={styles.logRouteInfo}>
                    <Text style={styles.logRouteName}>{log.routeName}</Text>
                    <Text style={styles.logSectorText}>
                      {log.wallName} • {log.sectorName}
                    </Text>
                  </View>

                  <View style={[styles.logGradeBadge, { backgroundColor: gradeColor }]}>
                    <Text style={styles.logGradeText}>{log.gradeStr}</Text>
                  </View>
                </View>

                <View style={styles.logMetaRow}>
                  <View style={[styles.styleTag, { backgroundColor: styleBadge.color + '22' }]}>
                    <Text style={[styles.styleTagText, { color: styleBadge.color }]}>
                      {styleBadge.label}
                    </Text>
                  </View>

                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={12}
                        color={s <= log.ratingStars ? '#F59E0B' : '#334155'}
                        fill={s <= log.ratingStars ? '#F59E0B' : 'transparent'}
                      />
                    ))}
                  </View>

                  <View style={styles.dateTag}>
                    <Calendar size={12} color="#64748B" />
                    <Text style={styles.dateText}>{log.date}</Text>
                  </View>
                </View>

                {log.personalNotes ? (
                  <Text style={styles.notesText}>"{log.personalNotes}"</Text>
                ) : null}

                {log.partner ? (
                  <View style={styles.partnerRow}>
                    <User size={12} color="#94A3B8" />
                    <Text style={styles.partnerText}>Segurador: {log.partner}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  statsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 12,
  },
  mainStatNumber: {
    color: '#F8FAFC',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  mainStatLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  subStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  subStatItem: {
    alignItems: 'center',
  },
  subStatValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  subStatLabel: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  filtersBar: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  filterChipActive: {
    backgroundColor: '#38BDF8',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  logsScroll: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
  },
  logCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logRouteInfo: {
    flex: 1,
  },
  logRouteName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  logSectorText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  logGradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  logGradeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  logMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  styleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  styleTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  dateText: {
    color: '#64748B',
    fontSize: 11,
  },
  notesText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  partnerText: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
