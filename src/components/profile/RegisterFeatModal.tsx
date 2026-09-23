// Modal para o Escalador Registrar seus Feitos e Cadenas no Diário (Perfil)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  X,
  Award,
  Star,
  Check,
  Calendar,
  User,
  Mountain,
  MapPin,
  Flame,
  Sparkles,
  Shield,
  Compass,
} from 'lucide-react-native';
import { ClimbingDestination, AscentStyle } from '../../types/climbing';
import { GRADE_TABLE, BOULDER_GRADE_TABLE, getGradeBadgeColor } from '../../services/gradeConverter';

export interface NewFeatData {
  routeId: string;
  routeName: string;
  wallName: string;
  sectorName: string;
  gradeStr: string;
  date: string;
  style: AscentStyle;
  ratingStars: 1 | 2 | 3 | 4 | 5;
  userGradeOpinion?: string;
  personalNotes: string;
  partner?: string;
  discipline?: 'sport' | 'boulder' | 'trad';
}

interface RegisterFeatModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveFeat: (feat: NewFeatData) => void;
  destinations?: ClimbingDestination[];
}

// Estilos de cadena com cores e descrições claras para escaladores
const STYLE_OPTIONS: Array<{ id: AscentStyle; label: string; desc: string; color: string }> = [
  { id: 'onsight', label: 'À Vista (Onsight)', desc: '1ª tentativa sem beta ou informação prévia', color: '#10B981' },
  { id: 'flash', label: 'Flash', desc: '1ª tentativa com dicas ou visualização', color: '#38BDF8' },
  { id: 'redpoint', label: 'Trabalhada (Redpoint)', desc: 'Cadena após estudo e tentativas', color: '#A855F7' },
  { id: 'repeat', label: 'Repetição', desc: 'Via já encadenada anteriormente', color: '#64748B' },
  { id: 'project', label: 'Projeto / Tentativa', desc: 'Treino da via ainda não encadenada', color: '#F59E0B' },
  { id: 'top_rope', label: 'Top Rope', desc: 'Escalada com corda de cima', color: '#06B6D4' },
];

export const RegisterFeatModal: React.FC<RegisterFeatModalProps> = ({
  visible,
  onClose,
  onSaveFeat,
  destinations = [],
}) => {
  const [discipline, setDiscipline] = useState<'sport' | 'boulder' | 'trad'>('sport');
  const [routeName, setRouteName] = useState('');
  const [cragName, setCragName] = useState('');
  const [cityName, setCityName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('6º');
  const [customGrade, setCustomGrade] = useState('');
  const [style, setStyle] = useState<AscentStyle>('redpoint');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [date, setDate] = useState(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });
  const [partner, setPartner] = useState('');
  const [notes, setNotes] = useState('');

  // Sugestões rápidas de destinos / pedras cadastradas
  const cragSuggestions = destinations.flatMap(d =>
    d.sectors.map(s => ({
      cragName: s.cragName || s.name,
      cityName: `${d.name} - ${d.state}`,
    }))
  );

  // Lista de graus sugeridos para seleção rápida
  const sportGrades = ['4º', '5º', '6º', '6º sup', '7a', '7b', '7c', '8a', '8b', '8c', '9a', '9b', '10a'];
  const boulderGrades = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12'];
  const activeGradeList = discipline === 'boulder' ? boulderGrades : sportGrades;

  // Troca de modalidade ajusta o grau padrão
  const handleDisciplineChange = (type: 'sport' | 'boulder' | 'trad') => {
    setDiscipline(type);
    if (type === 'boulder') {
      setSelectedGrade('V4');
    } else {
      setSelectedGrade('6º');
    }
  };

  const handleSelectCragSuggestion = (crag: string, city: string) => {
    setCragName(crag);
    setCityName(city);
  };

  const handleSave = () => {
    if (!routeName.trim()) {
      const msg = 'Informe o nome da via ou boulder encadenado.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Campo Obrigatório', msg);
      return;
    }

    const finalGrade = (customGrade.trim() || selectedGrade).trim();
    const finalCrag = cragName.trim() || 'Falésia Local';
    const finalCity = cityName.trim() || 'Paraíba';

    const featData: NewFeatData = {
      routeId: `feat-${Date.now()}`,
      routeName: routeName.trim(),
      wallName: finalCrag,
      sectorName: finalCity,
      gradeStr: finalGrade,
      date: date.trim() || 'Hoje',
      style,
      ratingStars: rating,
      userGradeOpinion: finalGrade,
      personalNotes: notes.trim(),
      partner: partner.trim() || undefined,
      discipline,
    };

    onSaveFeat(featData);
    resetForm();
    onClose();

    const successMsg = `Feito registrado com sucesso! "${featData.routeName}" (${finalGrade}) foi adicionada ao seu diário.`;
    Platform.OS === 'web' ? window.alert(successMsg) : Alert.alert('Cadena Registrada!', successMsg);
  };

  const resetForm = () => {
    setRouteName('');
    setCragName('');
    setCityName('');
    setCustomGrade(discipline === 'boulder' ? 'V4' : '6º');
    setNotes('');
    setPartner('');
    setRating(5);
    setStyle('redpoint');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleGroup}>
              <Award size={20} color="#10B981" />
              <View>
                <Text style={styles.modalTitle}>Registrar Feito no Diário</Text>
                <Text style={styles.modalSubtitle}>Adicione uma cadena de via ou boulder ao seu perfil</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* 1. Modalidade / Tipo de Escalada */}
            <Text style={styles.sectionLabel}>TIPO DE ESCALADA</Text>
            <View style={styles.disciplineRow}>
              <TouchableOpacity
                style={[
                  styles.disciplineBtn,
                  discipline === 'sport' && styles.disciplineBtnActive,
                ]}
                onPress={() => handleDisciplineChange('sport')}
              >
                <Mountain size={15} color={discipline === 'sport' ? '#10B981' : '#94A3B8'} />
                <Text style={[styles.disciplineText, discipline === 'sport' && styles.disciplineTextActive]}>
                  Esportiva
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.disciplineBtn,
                  discipline === 'boulder' && styles.disciplineBtnActive,
                ]}
                onPress={() => handleDisciplineChange('boulder')}
              >
                <Sparkles size={15} color={discipline === 'boulder' ? '#F59E0B' : '#94A3B8'} />
                <Text style={[styles.disciplineText, discipline === 'boulder' && styles.disciplineTextActive]}>
                  Boulder
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.disciplineBtn,
                  discipline === 'trad' && styles.disciplineBtnActive,
                ]}
                onPress={() => handleDisciplineChange('trad')}
              >
                <Shield size={15} color={discipline === 'trad' ? '#38BDF8' : '#94A3B8'} />
                <Text style={[styles.disciplineText, discipline === 'trad' && styles.disciplineTextActive]}>
                  Trad / Móvel
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. Nome da Via / Linha */}
            <Text style={styles.sectionLabel}>NOME DA VIA OU BOULDER *</Text>
            <View style={styles.inputWrapper}>
              <Award size={16} color="#64748B" style={{ marginLeft: 12 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Fogo na Babilônia, Turtle Roof, Dente de Sabre"
                placeholderTextColor="#64748B"
                value={routeName}
                onChangeText={setRouteName}
              />
            </View>

            {/* 3. Falésia / Pedra e Cidade */}
            <View style={styles.twoCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>PEDRA / FALÉSIA</Text>
                <View style={styles.inputWrapper}>
                  <Mountain size={16} color="#64748B" style={{ marginLeft: 12 }} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: Pedra Furada"
                    placeholderTextColor="#64748B"
                    value={cragName}
                    onChangeText={setCragName}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>CIDADE / POLO</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={16} color="#64748B" style={{ marginLeft: 12 }} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: Campina Grande - PB"
                    placeholderTextColor="#64748B"
                    value={cityName}
                    onChangeText={setCityName}
                  />
                </View>
              </View>
            </View>

            {/* Sugestões Rápidas de Destinos */}
            {cragSuggestions.length > 0 && !cragName && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionTitle}>Sugestões rápidas:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {cragSuggestions.slice(0, 5).map((sug, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.suggestionChip}
                      onPress={() => handleSelectCragSuggestion(sug.cragName, sug.cityName)}
                    >
                      <Text style={styles.suggestionChipText}>{sug.cragName}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 4. Grau da Cadena */}
            <View style={styles.gradeHeaderRow}>
              <Text style={styles.sectionLabel}>
                {discipline === 'boulder' ? 'GRAU DO BOULDER (V-SCALE)' : 'GRAU DA VIA (SISTEMA BR)'}
              </Text>
              <View style={[styles.activeGradeTag, { backgroundColor: getGradeBadgeColor(customGrade || selectedGrade) }]}>
                <Text style={styles.activeGradeTagText}>{customGrade || selectedGrade}</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gradesList}>
              {activeGradeList.map((g) => {
                const isSelected = selectedGrade === g && !customGrade;
                const badgeColor = getGradeBadgeColor(g);
                return (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.gradeChip,
                      isSelected && { borderColor: badgeColor, backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                    ]}
                    onPress={() => {
                      setSelectedGrade(g);
                      setCustomGrade('');
                    }}
                  >
                    <Text style={[styles.gradeChipText, isSelected && { color: '#FFFFFF', fontWeight: '800' }]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Ou digite um grau personalizado */}
            <TextInput
              style={styles.customGradeInput}
              placeholder="Ou digite outro grau (ex: 8a Fr, V13, 7b+)"
              placeholderTextColor="#64748B"
              value={customGrade}
              onChangeText={setCustomGrade}
            />

            {/* 5. Estilo da Ascensão */}
            <Text style={styles.sectionLabel}>ESTILO DA CADENA</Text>
            <View style={styles.stylesGrid}>
              {STYLE_OPTIONS.map((opt) => {
                const isSelected = style === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.styleOptionCard,
                      isSelected && { borderColor: opt.color, backgroundColor: 'rgba(30, 41, 59, 0.95)' },
                    ]}
                    onPress={() => setStyle(opt.id)}
                  >
                    <View style={styles.styleOptionHeader}>
                      <View style={[styles.styleColorDot, { backgroundColor: opt.color }]} />
                      <Text style={[styles.styleOptionLabel, isSelected && { color: '#FFFFFF', fontWeight: '800' }]}>
                        {opt.label}
                      </Text>
                      {isSelected && <Check size={14} color={opt.color} style={{ marginLeft: 'auto' }} />}
                    </View>
                    <Text style={styles.styleOptionDesc}>{opt.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 6. Data & Parceiro de Corda */}
            <View style={styles.twoCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>DATA DA CADENA</Text>
                <View style={styles.inputWrapper}>
                  <Calendar size={16} color="#64748B" style={{ marginLeft: 12 }} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#64748B"
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>PARCEIRO / SPOTTER</Text>
                <View style={styles.inputWrapper}>
                  <User size={16} color="#64748B" style={{ marginLeft: 12 }} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: Cauí, Wolgrand..."
                    placeholderTextColor="#64748B"
                    value={partner}
                    onChangeText={setPartner}
                  />
                </View>
              </View>
            </View>

            {/* 7. Avaliação da Via (1 a 5 estrelas) */}
            <Text style={styles.sectionLabel}>AVALIAÇÃO DA LINHA</Text>
            <View style={styles.ratingStarsRow}>
              {[1, 2, 3, 4, 5].map((starVal) => {
                const filled = starVal <= rating;
                return (
                  <TouchableOpacity
                    key={starVal}
                    onPress={() => setRating(starVal as 1 | 2 | 3 | 4 | 5)}
                    style={styles.starTouch}
                  >
                    <Star
                      size={26}
                      color={filled ? '#F59E0B' : '#475569'}
                      fill={filled ? '#F59E0B' : 'transparent'}
                    />
                  </TouchableOpacity>
                );
              })}
              <Text style={styles.ratingText}>
                {rating === 5 ? 'Obra-prima / Clássica 🌟' : rating === 4 ? 'Excelente via 🧗' : 'Boa linha 👍'}
              </Text>
            </View>

            {/* 8. Notas / Relato da Cadena */}
            <Text style={styles.sectionLabel}>RELATO DO FEITO / NOTAS PESSOAIS</Text>
            <TextInput
              style={styles.notesTextArea}
              placeholder="Conte como foi a cadena: lances chaves, aderência da rocha, sensações, quantas tentativas..."
              placeholderTextColor="#64748B"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Award size={18} color="#0F172A" />
              <Text style={styles.saveBtnText}>SALVAR NO MEU DIÁRIO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    width: '100%',
    maxWidth: 540,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  scrollBody: {
    padding: 20,
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 14,
  },
  disciplineRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  disciplineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  disciplineBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  disciplineText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  disciplineTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionTitle: {
    color: '#64748B',
    fontSize: 10,
    marginBottom: 4,
  },
  suggestionChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  suggestionChipText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  gradeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  activeGradeTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeGradeTagText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
  },
  gradesList: {
    gap: 6,
    paddingVertical: 4,
  },
  gradeChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gradeChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  customGradeInput: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 12,
    marginTop: 8,
  },
  stylesGrid: {
    gap: 6,
  },
  styleOptionCard: {
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  styleOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  styleColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  styleOptionLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  styleOptionDesc: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
    marginLeft: 16,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  starTouch: {
    padding: 2,
  },
  ratingText: {
    color: '#94A3B8',
    fontSize: 12,
    marginLeft: 'auto',
  },
  notesTextArea: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0B1120',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  saveBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
});
