// Modal de Autenticação e Cadastro de Novo Escalador
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { UserProfile } from '../../types/climbing';
import { CommunityService, DEFAULT_USER } from '../../services/communityService';
import { X, UserPlus, LogIn, CheckCircle2, User, Sparkles } from 'lucide-react-native';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onUserChanged: (user: UserProfile) => void;
  currentUser: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  onClose,
  onUserChanged,
  currentUser,
}) => {
  const [mode, setMode] = useState<'register' | 'switch'>('register');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Campina Grande');
  const [state, setState] = useState('PB');
  const [bio, setBio] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  ];

  // Perfis comunitários pré-definidos para alternância rápida
  const quickProfiles: UserProfile[] = [
    DEFAULT_USER,
    {
      id: 'user-caui',
      name: 'Cauí Vieira',
      username: 'caui_eene',
      email: 'caui@escaladapb.org',
      city: 'João Pessoa',
      state: 'PB',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Conquistador de vias no EENe Algodão de Jandaíra e Brejo Paraibano. Apaixonado por móvel e bigwall.',
      hardestGrade: '8c',
      memberSince: '2013',
      totalAscentsCount: 42,
      totalPhotosCount: 15,
    },
    {
      id: 'user-wolgrand',
      name: 'Wolgrand Falcão',
      username: 'wolgrand_granito',
      email: 'wolgrand@campina.climb',
      city: 'Campina Grande',
      state: 'PB',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bio: 'Desbravador das falésias de Campina Grande: Pedra Escola, A Rampa, Morcego e Pedra do Marinho.',
      hardestGrade: '8a',
      memberSince: '2015',
      totalAscentsCount: 56,
      totalPhotosCount: 22,
    },
    {
      id: 'user-maria-climb',
      name: 'Maria Clara Rocha',
      username: 'mclara_climb',
      email: 'mclara@nordesteclimb.com',
      city: 'Natal',
      state: 'RN',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bio: 'Escaladora em Serra Caiada e Algodão de Jandaíra. Incentivadora da escalada feminina nordestina.',
      hardestGrade: '7a',
      memberSince: '2024',
      totalAscentsCount: 19,
      totalPhotosCount: 11,
    }
  ];

  const handleRegister = async () => {
    if (!name.trim()) return;

    const user = await CommunityService.registerUser({
      name: name.trim(),
      username: username.trim() || name.toLowerCase().replace(/\s+/g, '_'),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@crux.app`,
      city: city.trim() || 'Campina Grande',
      state: state.trim() || 'PB',
      bio: bio.trim(),
    });

    // Se selecionou um avatar personalizado
    user.avatarUrl = avatarOptions[avatarIndex];
    await CommunityService.updateProfile(user);

    onUserChanged(user);
    onClose();
  };

  const handleSwitchUser = async (profile: UserProfile) => {
    await CommunityService.updateProfile(profile);
    onUserChanged(profile);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Comunidade de Escaladores</Text>
              <Text style={styles.subtitle}>
                Perfil colaborativo para registro de vias, cadenas e fotos
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Abas de Modo: Cadastro vs Alternar Perfil */}
          <View style={styles.tabModeRow}>
            <TouchableOpacity
              style={[styles.tabModeBtn, mode === 'register' && styles.tabModeBtnActive]}
              onPress={() => setMode('register')}
            >
              <UserPlus size={16} color={mode === 'register' ? '#10B981' : '#94A3B8'} />
              <Text style={[styles.tabModeText, mode === 'register' && styles.tabModeTextActive]}>
                Criar Novo Perfil
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabModeBtn, mode === 'switch' && styles.tabModeBtnActive]}
              onPress={() => setMode('switch')}
            >
              <LogIn size={16} color={mode === 'switch' ? '#38BDF8' : '#94A3B8'} />
              <Text style={[styles.tabModeText, mode === 'switch' && styles.tabModeTextActive]}>
                Trocar Escalador
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {mode === 'register' ? (
              <>
                {/* Escolher Avatar */}
                <Text style={styles.label}>Escolha seu Avatar de Escalador</Text>
                <View style={styles.avatarRow}>
                  {avatarOptions.map((url, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.avatarThumb, avatarIndex === idx && styles.avatarThumbActive]}
                      onPress={() => setAvatarIndex(idx)}
                    >
                      <Image source={{ uri: url }} style={styles.avatarImg} />
                      {avatarIndex === idx && (
                        <View style={styles.avatarSelectedBadge}>
                          <CheckCircle2 size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Campos do formulário */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nome Completo *</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ex: João Victor Silva"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={styles.rowTwoCols}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.label}>@Username</Text>
                    <TextInput
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      placeholder="joaoclimb"
                      placeholderTextColor="#64748B"
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.label}>E-mail</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="joao@gmail.com"
                      placeholderTextColor="#64748B"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.rowTwoCols}>
                  <View style={[styles.fieldGroup, { flex: 2 }]}>
                    <Text style={styles.label}>Cidade</Text>
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                      placeholder="Ex: Campina Grande"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.label}>UF</Text>
                    <TextInput
                      style={styles.input}
                      value={state}
                      onChangeText={setState}
                      placeholder="PB"
                      placeholderTextColor="#64748B"
                      maxLength={2}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Bio / Experiência de Escalada</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Ex: Escalador esportivo e tradicional do Agreste, apaixonado pelas falésias da Paraíba."
                    placeholderTextColor="#64748B"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.actionBtn, !name.trim() && styles.actionBtnDisabled]}
                  onPress={handleRegister}
                  disabled={!name.trim()}
                  activeOpacity={0.8}
                >
                  <UserPlus size={18} color="#0F172A" />
                  <Text style={styles.actionBtnText}>CRIAR MEU PERFIL DE ESCALADOR</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Perfis de Escaladores Disponíveis</Text>
                <Text style={styles.helperText}>
                  Alterne entre perfis de teste ou utilize seu perfil oficial para postar e registrar.
                </Text>

                <View style={styles.profilesList}>
                  {quickProfiles.map((prof) => {
                    const isCurrent = prof.id === currentUser.id;
                    return (
                      <TouchableOpacity
                        key={prof.id}
                        style={[styles.profileCard, isCurrent && styles.profileCardActive]}
                        onPress={() => handleSwitchUser(prof)}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: prof.avatarUrl }} style={styles.profileCardAvatar} />
                        <View style={styles.profileCardInfo}>
                          <View style={styles.profileCardNameRow}>
                            <Text style={styles.profileCardName}>{prof.name}</Text>
                            {isCurrent && (
                              <View style={styles.activeUserPill}>
                                <Text style={styles.activeUserPillText}>ATIVO</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.profileCardHandle}>@{prof.username} • {prof.city}, {prof.state}</Text>
                          <Text style={styles.profileCardBio} numberOfLines={2}>{prof.bio}</Text>
                          <View style={styles.profileCardStats}>
                            <Text style={styles.profileCardStatItem}>
                              🏆 Grau Máx: <Text style={{ color: '#10B981', fontWeight: 'bold' }}>{prof.hardestGrade}</Text>
                            </Text>
                            <Text style={styles.profileCardStatItem}>
                              🧗 {prof.totalAscentsCount} Cadenas
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '88%',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: 10,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
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
  tabModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabModeBtnActive: {
    backgroundColor: '#1E293B',
    borderColor: '#10B981',
  },
  tabModeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabModeTextActive: {
    color: '#F8FAFC',
    fontWeight: '900',
  },
  formScroll: {
    marginBottom: 10,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  helperText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  avatarThumb: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  avatarThumbActive: {
    borderColor: '#10B981',
    transform: [{ scale: 1.05 }],
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarSelectedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    borderRadius: 10,
    padding: 2,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    padding: 11,
    borderRadius: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 65,
    textAlignVertical: 'top',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  profilesList: {
    gap: 12,
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'flex-start',
    gap: 12,
  },
  profileCardActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  profileCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#475569',
  },
  profileCardInfo: {
    flex: 1,
  },
  profileCardNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  activeUserPill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeUserPillText: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '900',
  },
  profileCardHandle: {
    fontSize: 12,
    color: '#38BDF8',
    marginBottom: 4,
  },
  profileCardBio: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
    marginBottom: 6,
  },
  profileCardStats: {
    flexDirection: 'row',
    gap: 12,
  },
  profileCardStatItem: {
    fontSize: 11,
    color: '#E2E8F0',
  },
});
