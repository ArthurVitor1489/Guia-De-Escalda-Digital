// Modal de Cadastro de Via ou Boulder dentro da Pedra (Nível 3 da Hierarquia)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import {
  Route,
  RouteStyle,
  DangerRating,
  AnchorType,
  ProtectionCategory,
} from '../../types/climbing';
import {
  BOULDER_GRADE_TABLE,
  GRADE_TABLE,
  getGradeBadgeColor,
} from '../../services/gradeConverter';
import {
  X,
  Mountain,
  Shield,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  Box,
  Sparkles,
  Layers,
  HelpCircle,
  Award,
} from 'lucide-react-native';

interface CreateRouteModalProps {
  visible: boolean;
  onClose: () => void;
  destinationName: string;
  sectorName: string;
  wallName?: string;
  onSaveRoute: (newRoute: Route) => void;
  existingRoutesCount: number;
}

const BOULDER_START_TYPES = [
  'Saída Sentada (Sit Start)',
  'Saída em Pé (Stand Start)',
  'Travessia Lateral',
  'Highball (Bloco Alto)',
];

const ANCHOR_OPTIONS: { label: string; value: AnchorType }[] = [
  { label: 'Dupla com Anel', value: 'dupla_com_anel' },
  { label: 'Corrente', value: 'corrente' },
  { label: 'Mosquetão de Aço', value: 'mosquetao_aco' },
  { label: 'Parada Natural', value: 'parada_natural' },
  { label: 'Chapeleta Simples', value: 'chapeleta_simples' },
];

export const CreateRouteModal: React.FC<CreateRouteModalProps> = ({
  visible,
  onClose,
  destinationName,
  sectorName,
  wallName,
  onSaveRoute,
  existingRoutesCount,
}) => {
  // Modalidade da Via
  const [style, setStyle] = useState<RouteStyle>('esportiva');

  // Identificação
  const [name, setName] = useState('');
  const [climbers, setClimbers] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState('');
  const [safetyWarnings, setSafetyWarnings] = useState('');

  // Graduação se for Boulder
  const [selectedBoulderGrade, setSelectedBoulderGrade] = useState('V3');
  const [boulderStartType, setBoulderStartType] = useState(BOULDER_START_TYPES[0]);
  const [crashPadsRecommended, setCrashPadsRecommended] = useState('2 pads & spotter');

  // Graduação se for Via (Esportiva / Tradicional / Mista)
  const [selectedRouteGrade, setSelectedRouteGrade] = useState('6º');
  const [dangerRating, setDangerRating] = useState<DangerRating>('E1');
  const [boltsCount, setBoltsCount] = useState('6');
  const [anchorType, setAnchorType] = useState<AnchorType>('dupla_com_anel');
  const [rackRequired, setRackRequired] = useState('');

  // Altura
  const [heightMeters, setHeightMeters] = useState(style === 'boulder' ? '4' : '18');

  // Ao alternar estilo, ajusta altura padrão
  const handleSelectStyle = (newStyle: RouteStyle) => {
    setStyle(newStyle);
    if (newStyle === 'boulder' && (heightMeters === '18' || heightMeters === '25')) {
      setHeightMeters('4');
    } else if (newStyle !== 'boulder' && heightMeters === '4') {
      setHeightMeters('18');
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Por favor, informe o nome da via ou do boulder.');
      } else {
        Alert.alert('Campo Obrigatório', 'Informe o nome da linha de escalada.');
      }
      return;
    }

    const routeId = `route-custom-${Date.now()}`;
    const nextOrder = existingRoutesCount + 1;

    let gradeObj: any;
    let protectionType: ProtectionCategory = 'chapeleta';

    if (style === 'boulder') {
      const bMatch = BOULDER_GRADE_TABLE.find(b => b.vGrade === selectedBoulderGrade) || BOULDER_GRADE_TABLE[3];
      gradeObj = {
        brazilian: bMatch.vGrade,
        french: bMatch.font,
        yds: bMatch.vGrade,
      };
      protectionType = 'crashpad';
    } else {
      const rMatch = GRADE_TABLE.find(g => g.brazilian === selectedRouteGrade) || GRADE_TABLE[5];
      gradeObj = {
        brazilian: rMatch.brazilian,
        french: rMatch.french,
        yds: rMatch.yds,
        danger: dangerRating,
      };
      if (style === 'tradicional') {
        protectionType = 'movel';
      } else if (style === 'mista') {
        protectionType = 'mista';
      } else {
        protectionType = 'chapeleta';
      }
    }

    const newRoute: Route = {
      id: routeId,
      wallId: 'active-wall',
      orderIndex: nextOrder,
      name: name.trim(),
      grade: gradeObj,
      heightMeters: parseFloat(heightMeters) || (style === 'boulder' ? 4 : 15),
      pitchesCount: 1,
      boltsCount: style === 'boulder' ? 0 : parseInt(boltsCount) || 0,
      protectionType: protectionType,
      anchorType: style === 'boulder' ? 'parada_natural' : anchorType,
      style: style,
      rackRequired: style === 'boulder' 
        ? `${boulderStartType} • ${crashPadsRecommended}` 
        : (style === 'tradicional' ? rackRequired.trim() || 'Jogo de Camalots e nuts' : undefined),
      firstAscent: climbers.trim()
        ? {
            climbers: climbers.split(',').map(c => c.trim()),
            year: parseInt(year) || new Date().getFullYear(),
          }
        : undefined,
      description: description.trim() || (style === 'boulder' ? 'Bloco de boulder de boa aderência.' : 'Via de escalada esportiva bem protegida.'),
      safetyWarnings: safetyWarnings.trim() || undefined,
    };

    onSaveRoute(newRoute);
    onClose();
  };

  const currentGradeColor = style === 'boulder'
    ? getGradeBadgeColor(selectedBoulderGrade)
    : getGradeBadgeColor(selectedRouteGrade);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.levelBadge}>
                <Mountain size={12} color="#10B981" />
                <Text style={styles.levelBadgeText}>NÍVEL 3 • VIA / BOULDER</Text>
              </View>
              <Text style={styles.title}>
                {style === 'boulder' ? 'Cadastrar Novo Boulder' : 'Cadastrar Nova Via'}
              </Text>
              <Text style={styles.subtitle}>
                Na pedra: <Text style={styles.highlightText}>{sectorName}</Text> • {destinationName}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Seletor de Modalidade: Boulder vs Esportiva vs Tradicional vs Mista */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>MODALIDADE DA LINHA *</Text>
              <View style={styles.styleSelectorRow}>
                <TouchableOpacity
                  style={[styles.styleBtn, style === 'boulder' && styles.styleBtnActive]}
                  onPress={() => handleSelectStyle('boulder')}
                  activeOpacity={0.8}
                >
                  <Box size={16} color={style === 'boulder' ? '#10B981' : '#94A3B8'} />
                  <Text style={[styles.styleBtnText, style === 'boulder' && styles.styleBtnTextActive]}>
                    🪨 Boulder
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.styleBtn, style === 'esportiva' && styles.styleBtnActive]}
                  onPress={() => handleSelectStyle('esportiva')}
                  activeOpacity={0.8}
                >
                  <Sparkles size={16} color={style === 'esportiva' ? '#10B981' : '#94A3B8'} />
                  <Text style={[styles.styleBtnText, style === 'esportiva' && styles.styleBtnTextActive]}>
                    🧗 Esportiva
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.styleBtn, style === 'tradicional' && styles.styleBtnActive]}
                  onPress={() => handleSelectStyle('tradicional')}
                  activeOpacity={0.8}
                >
                  <Shield size={16} color={style === 'tradicional' ? '#10B981' : '#94A3B8'} />
                  <Text style={[styles.styleBtnText, style === 'tradicional' && styles.styleBtnTextActive]}>
                    🛡️ Tradicional
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nome da Linha */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {style === 'boulder' ? 'NOME DO BOULDER / PROBLEMA *' : 'NOME DA VIA *'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={style === 'boulder' ? 'Ex: Dinamite, Mandacaru, O Pulo do Gato...' : 'Ex: Primeira Passada, Fissura do Urubu...'}
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* SELEÇÃO DE GRAU ESPECÍFICO */}
            {style === 'boulder' ? (
              // SELETOR DE GRAU BOULDER (V-SCALE)
              <View style={styles.formGroup}>
                <View style={styles.labelWithPreview}>
                  <Text style={styles.label}>GRAU DO BOULDER (ESCALA V)</Text>
                  <View style={[styles.gradePreviewBadge, { backgroundColor: currentGradeColor }]}>
                    <Text style={styles.gradePreviewText}>{selectedBoulderGrade}</Text>
                    <Text style={styles.fontEquivText}>
                      ({BOULDER_GRADE_TABLE.find(b => b.vGrade === selectedBoulderGrade)?.font})
                    </Text>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gradePillsScroll}>
                  {BOULDER_GRADE_TABLE.map(b => {
                    const isSelected = selectedBoulderGrade === b.vGrade;
                    return (
                      <TouchableOpacity
                        key={b.vGrade}
                        style={[
                          styles.gradePill,
                          isSelected && { backgroundColor: b.color, borderColor: b.color },
                        ]}
                        onPress={() => setSelectedBoulderGrade(b.vGrade)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.gradePillText, isSelected && styles.gradePillTextActive]}>
                          {b.vGrade}
                        </Text>
                        <Text style={[styles.fontSmallText, isSelected && { color: '#0F172A' }]}>
                          {b.font}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ) : (
              // SELETOR DE GRAU DE VIA DE CORDA (ESPORTIVA / TRAD)
              <View style={styles.formGroup}>
                <View style={styles.labelWithPreview}>
                  <Text style={styles.label}>GRAU DA VIA (ESCALA BRASILEIRA)</Text>
                  <View style={[styles.gradePreviewBadge, { backgroundColor: currentGradeColor }]}>
                    <Text style={styles.gradePreviewText}>{selectedRouteGrade}</Text>
                    {dangerRating && <Text style={styles.fontEquivText}>{dangerRating}</Text>}
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gradePillsScroll}>
                  {GRADE_TABLE.map(g => {
                    const isSelected = selectedRouteGrade === g.brazilian;
                    return (
                      <TouchableOpacity
                        key={g.brazilian}
                        style={[
                          styles.gradePill,
                          isSelected && { backgroundColor: g.color, borderColor: g.color },
                        ]}
                        onPress={() => setSelectedRouteGrade(g.brazilian)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.gradePillText, isSelected && styles.gradePillTextActive]}>
                          {g.brazilian}
                        </Text>
                        <Text style={[styles.fontSmallText, isSelected && { color: '#0F172A' }]}>
                          {g.french}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Exposição / Perigo (E1 a E5) */}
                <Text style={[styles.label, { marginTop: 12 }]}>EXPOSIÇÃO / DISTANCIAMENTO (E1 A E5)</Text>
                <View style={styles.dangerRow}>
                  {(['E1', 'E2', 'E3', 'E4', 'E5'] as DangerRating[]).map(d => {
                    const isSelected = dangerRating === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        style={[styles.dangerPill, isSelected && styles.dangerPillActive]}
                        onPress={() => setDangerRating(d)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.dangerPillText, isSelected && styles.dangerPillTextActive]}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* CAMPOS ESPECÍFICOS DE BOULDER */}
            {style === 'boulder' ? (
              <View style={styles.boulderSpecificBox}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>TIPO DE SAÍDA / ENTRADA NO BLOCO</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                    {BOULDER_START_TYPES.map(st => {
                      const isSelected = boulderStartType === st;
                      return (
                        <TouchableOpacity
                          key={st}
                          style={[styles.chip, isSelected && styles.chipActive]}
                          onPress={() => setBoulderStartType(st)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{st}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.row}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>ALTURA DO BLOCO (M)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={heightMeters}
                      onChangeText={setHeightMeters}
                      placeholder="Ex: 3.5"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1.5 }]}>
                    <Text style={styles.label}>CRASH PADS & SPOTTER</Text>
                    <TextInput
                      style={styles.input}
                      value={crashPadsRecommended}
                      onChangeText={setCrashPadsRecommended}
                      placeholder="Ex: 2 pads + 1 spotter"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                </View>
              </View>
            ) : (
              // CAMPOS ESPECÍFICOS DE VIA ESPORTIVA / TRAD
              <View style={styles.sportSpecificBox}>
                <View style={styles.row}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>ALTURA (METROS)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={heightMeters}
                      onChangeText={setHeightMeters}
                      placeholder="Ex: 18"
                      placeholderTextColor="#64748B"
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>COSTURAS / CHAPELETAS</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={boltsCount}
                      onChangeText={setBoltsCount}
                      placeholder="Ex: 6"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                </View>

                {/* Tipo de Parada */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>TIPO DE PARADA / ANCORAGEM</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                    {ANCHOR_OPTIONS.map(opt => {
                      const isSelected = anchorType === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.chip, isSelected && styles.chipActive]}
                          onPress={() => setAnchorType(opt.value)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {style === 'tradicional' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>RACK MÓVEL REQUERIDO</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 1 jogo de Camalots #.3 ao #3 e nuts pequenos"
                      placeholderTextColor="#64748B"
                      value={rackRequired}
                      onChangeText={setRackRequired}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Conquistadores e Ano */}
            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 2 }]}>
                <Text style={styles.label}>CONQUISTADOR(ES) / ABRIDORES</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Arthur Vitor, Wolgrand..."
                  placeholderTextColor="#64748B"
                  value={climbers}
                  onChangeText={setClimbers}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>ANO</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="2024"
                  placeholderTextColor="#64748B"
                  value={year}
                  onChangeText={setYear}
                />
              </View>
            </View>

            {/* Descrição & Crux */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>DESCRIÇÃO DA LINHA & BETA DO CRUX</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={
                  style === 'boulder'
                    ? 'Ex: Saída em regletes baixos, lance chave de compressão com calcanhar direito e saída dinâmica para o topo...'
                    : 'Ex: Entrada vertical técnica em furos, crux na 4ª costura em reglete invertido. Parada dupla com mosquetão.'
                }
                placeholderTextColor="#64748B"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Avisos de Segurança */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>AVISOS DE SEGURANÇA (OPCIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Terreno com pedras na aterrissagem / Cuidado com aterrissagem inclinada"
                placeholderTextColor="#64748B"
                value={safetyWarnings}
                onChangeText={setSafetyWarnings}
              />
            </View>

            {/* Botão de Salvar */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <CheckCircle2 size={18} color="#0F172A" />
              <Text style={styles.saveBtnText}>
                {style === 'boulder' ? 'SALVAR NOVO BOULDER' : 'SALVAR NOVA VIA'}
              </Text>
            </TouchableOpacity>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  levelBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  highlightText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  formScroll: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  labelWithPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gradePreviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradePreviewText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  fontEquivText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    fontSize: 11,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  styleSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  styleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
  },
  styleBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  styleBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  styleBtnTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  gradePillsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  gradePill: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  gradePillText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  gradePillTextActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  fontSmallText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  dangerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dangerPill: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerPillActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  dangerPillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  dangerPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  boulderSpecificBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  sportSpecificBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#10B981',
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  saveBtnText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
