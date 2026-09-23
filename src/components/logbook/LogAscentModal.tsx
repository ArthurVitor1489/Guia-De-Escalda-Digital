// Modal de Registro de Cadena / Diário de Escalada
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Route, AscentStyle, Wall, Sector } from '../../types/climbing';
import { X, Award, Star, CheckCircle, Calendar, User } from 'lucide-react-native';

interface LogAscentModalProps {
  route: Route | null;
  wall: Wall | null;
  sector: Sector | null;
  visible: boolean;
  onClose: () => void;
  onSaveAscent: (logData: {
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
  }) => void;
}

export const LogAscentModal: React.FC<LogAscentModalProps> = ({
  route,
  wall,
  sector,
  visible,
  onClose,
  onSaveAscent,
}) => {
  if (!route || !wall || !sector) return null;

  const [style, setStyle] = useState<AscentStyle>('redpoint');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [gradeOpinion, setGradeOpinion] = useState(route.grade.brazilian);
  const [notes, setNotes] = useState('');
  const [partner, setPartner] = useState('');

  const stylesOptions: Array<{ id: AscentStyle; label: string; desc: string }> = [
    { id: 'onsight', label: 'À Vista (Onsight)', desc: '1ª tentativa sem beta ou informação prévia' },
    { id: 'flash', label: 'Flash', desc: '1ª tentativa com dicas ou visualização' },
    { id: 'redpoint', label: 'Trabalhada (Redpoint)', desc: 'Cadena após estudar os movimentos' },
    { id: 'repeat', label: 'Repetição', desc: 'Via já encadenada anteriormente' },
    { id: 'project', label: 'Projeto / Tentativa', desc: 'Treino da via ainda não encadenada' },
  ];

  const handleSave = () => {
    onSaveAscent({
      routeId: route.id,
      routeName: route.name,
      wallName: wall.name,
      sectorName: sector.name,
      gradeStr: route.grade.brazilian,
      date: new Date().toISOString().split('T')[0],
      style,
      ratingStars: rating,
      userGradeOpinion: gradeOpinion,
      personalNotes: notes,
      partner,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Registrar Cadena</Text>
              <Text style={styles.subtitle}>
                {route.name} ({route.grade.brazilian}) • {wall.name}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Seleção do Estilo da Cadena */}
            <Text style={styles.sectionLabel}>ESTILO DA ASCENSÃO</Text>
            <View style={styles.stylesList}>
              {stylesOptions.map(opt => {
                const isSelected = style === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.styleOption, isSelected && styles.styleOptionSelected]}
                    onPress={() => setStyle(opt.id)}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.styleTexts}>
                      <Text style={[styles.styleLabel, isSelected && styles.styleLabelSelected]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.styleDesc}>{opt.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Avaliação da Via (Estrelas) */}
            <Text style={styles.sectionLabel}>AVALIAÇÃO DA LINHA</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star as any)}
                  style={styles.starBtn}
                >
                  <Star
                    size={28}
                    color={star <= rating ? '#F59E0B' : '#334155'}
                    fill={star <= rating ? '#F59E0B' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Opinião de Grau */}
            <Text style={styles.sectionLabel}>SUA OPINIÃO DO GRAU</Text>
            <TextInput
              style={styles.textInput}
              value={gradeOpinion}
              onChangeText={setGradeOpinion}
              placeholder="Ex: 7a, concordei com 6º sup..."
              placeholderTextColor="#64748B"
            />

            {/* Parceiro de Corda */}
            <Text style={styles.sectionLabel}>PARCEIRO(A) DE CORDA (SEGURADOR)</Text>
            <TextInput
              style={styles.textInput}
              value={partner}
              onChangeText={setPartner}
              placeholder="Nome do parceiro que deu a seg"
              placeholderTextColor="#64748B"
            />

            {/* Anotações Pessoais / Beta */}
            <Text style={styles.sectionLabel}>ANOTAÇÕES PESSOAIS / BETA</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Sensações, beta de pés, descanso no teto..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          {/* Botão Salvar */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <CheckCircle size={20} color="#0F172A" />
            <Text style={styles.saveBtnText}>CONFIRMAR NO MEU DIÁRIO</Text>
          </TouchableOpacity>
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
    maxHeight: '90%',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  formScroll: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  stylesList: {
    gap: 8,
  },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
    gap: 12,
  },
  styleOptionSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#10B981',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  styleTexts: {
    flex: 1,
  },
  styleLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  styleLabelSelected: {
    color: '#10B981',
  },
  styleDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 4,
  },
  starBtn: {
    padding: 4,
  },
  textInput: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
