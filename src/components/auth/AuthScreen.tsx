// Tela Completa de Login e Cadastro — CRUX
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { UserProfile } from '../../types/climbing';
import { CommunityService, DEFAULT_USER } from '../../services/communityService';
import {
  Mountain,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User,
  MapPin,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Compass,
  X,
} from 'lucide-react-native';

interface AuthScreenProps {
  onSuccess: (user: UserProfile) => void;
  onContinueAsGuest?: () => void;
  initialMode?: 'login' | 'register';
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onContinueAsGuest,
  initialMode = 'login',
  onClose,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Campos de Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Campos de Cadastro
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Campina Grande');
  const [state, setState] = useState('PB');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);

  // Usuários cadastrados para login rápido
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    async function loadUsers() {
      const users = await CommunityService.getRegisteredUsers();
      setRegisteredUsers(users);
    }
    loadUsers();
  }, []);

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  ];

  // Ação de Login
  const handleLogin = async () => {
    setLoginError('');
    if (!loginIdentifier.trim()) {
      setLoginError('Informe seu e-mail ou @username');
      return;
    }

    try {
      const user = await CommunityService.login(loginIdentifier);
      onSuccess(user);
    } catch {
      setLoginError('Não foi possível entrar. Tente novamente.');
    }
  };

  // Login com perfil de demonstração
  const handleQuickLogin = async (user: UserProfile) => {
    await CommunityService.updateProfile(user);
    onSuccess(user);
  };

  // Ação de Cadastro
  const handleRegister = async () => {
    setLoginError('');
    if (!name.trim()) {
      setLoginError('Informe seu nome completo.');
      return;
    }

    try {
      const user = await CommunityService.registerUser({
        name: name.trim(),
        username: username.trim() || name.toLowerCase().replace(/\s+/g, '_'),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@crux.app`,
        city: city.trim() || 'Campina Grande',
        state: state.trim() || 'PB',
        avatarUrl: avatarOptions[avatarIndex],
        bio: bio.trim(),
      });
      onSuccess(user);
    } catch {
      setLoginError('Erro ao cadastrar. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Botão de Fechar (se fornecido) */}
        {onClose && (
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}

        {/* Marca & Cabeçalho */}
        <View style={styles.brandSection}>
          <View style={styles.brandIconCircle}>
            <Mountain size={36} color="#10B981" />
          </View>
          <Text style={styles.brandTitle}>CRUX</Text>
          <Text style={styles.brandTagline}>GUIA DE ESCALADA COLABORATIVO</Text>
          <Text style={styles.brandSub}>
            Conecte-se com a comunidade de escaladores, compartilhe betas, registre cadenas e descubra falésias.
          </Text>
        </View>

        {/* Seletor de Modo: Entrar vs Cadastrar */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[styles.tabToggleBtn, mode === 'login' && styles.tabToggleBtnActive]}
            onPress={() => {
              setMode('login');
              setLoginError('');
            }}
          >
            <LogIn size={16} color={mode === 'login' ? '#10B981' : '#94A3B8'} />
            <Text style={[styles.tabToggleText, mode === 'login' && styles.tabToggleTextActive]}>
              ENTRAR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabToggleBtn, mode === 'register' && styles.tabToggleBtnActive]}
            onPress={() => {
              setMode('register');
              setLoginError('');
            }}
          >
            <UserPlus size={16} color={mode === 'register' ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.tabToggleText, mode === 'register' && styles.tabToggleTextActive]}>
              CRIAR CONTA
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mensagem de Erro (se houver) */}
        {loginError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {loginError}</Text>
          </View>
        ) : null}

        {/* Formulário de Login */}
        {mode === 'login' ? (
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>Acesse sua Conta</Text>
            <Text style={styles.cardHeaderSub}>Digite seus dados de acesso cadastrados</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-mail ou @Username</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="arthur_climb ou arthur@exemplo.com"
                  placeholderTextColor="#64748B"
                  value={loginIdentifier}
                  onChangeText={setLoginIdentifier}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Sua senha de escalador"
                  placeholderTextColor="#64748B"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} activeOpacity={0.8}>
              <LogIn size={18} color="#0F172A" />
              <Text style={styles.submitBtnText}>ENTRAR NO CRUX</Text>
            </TouchableOpacity>

            {/* Alternativa: Acesso Rápido para Teste com Perfis da Comunidade */}
            <View style={styles.quickLoginDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU ESCOLHA UM ESCALADOR CADASTRADO</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.quickUsersList}>
              {registeredUsers.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.quickUserCard}
                  onPress={() => handleQuickLogin(u)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: u.avatarUrl }} style={styles.quickUserAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quickUserName}>{u.name}</Text>
                    <Text style={styles.quickUserHandle}>@{u.username} • {u.city}, {u.state}</Text>
                  </View>
                  <ArrowRight size={16} color="#10B981" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Opção de Navegar como Visitante */}
            {onContinueAsGuest && (
              <TouchableOpacity
                style={styles.guestBtn}
                onPress={onContinueAsGuest}
                activeOpacity={0.8}
              >
                <Compass size={16} color="#94A3B8" />
                <Text style={styles.guestBtnText}>Continuar navegando como visitante (offline)</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          /* Formulário de Cadastro */
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>Cadastre-se na Comunidade</Text>
            <Text style={styles.cardHeaderSub}>Crie seu perfil para registrar cadenas e postar fotos</Text>

            {/* Escolha do Avatar */}
            <Text style={styles.inputLabel}>Escolha seu Avatar</Text>
            <View style={styles.avatarRow}>
              {avatarOptions.map((url, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.avatarChoice, avatarIndex === idx && styles.avatarChoiceActive]}
                  onPress={() => setAvatarIndex(idx)}
                >
                  <Image source={{ uri: url }} style={styles.avatarChoiceImg} />
                  {avatarIndex === idx && (
                    <View style={styles.avatarCheckBadge}>
                      <CheckCircle2 size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome Completo *</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: João Silva"
                  placeholderTextColor="#64748B"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.rowTwoCols}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>@Username</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="joaoclimb"
                    placeholderTextColor="#64748B"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>E-mail</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="joao@gmail.com"
                    placeholderTextColor="#64748B"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            <View style={styles.rowTwoCols}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.inputLabel}>Cidade</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={18} color="#64748B" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Campina Grande"
                    placeholderTextColor="#64748B"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Estado</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="PB"
                    placeholderTextColor="#64748B"
                    value={state}
                    onChangeText={setState}
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#64748B" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Crie uma senha de acesso"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio / Experiência (Opcional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Ex: Escalador esportivo e tradicional apaixonado pelas pedras da Paraíba."
                placeholderTextColor="#64748B"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} activeOpacity={0.8}>
              <UserPlus size={18} color="#0F172A" />
              <Text style={styles.submitBtnText}>FINALIZAR CADASTRO NO CRUX</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeLink}
              onPress={() => setMode('login')}
            >
              <Text style={styles.switchModeText}>
                Já tem uma conta? <Text style={styles.switchModeHighlight}>Fazer Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginBottom: 8,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1.5,
    marginTop: 2,
    marginBottom: 8,
  },
  brandSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabToggleBtnActive: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabToggleText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardHeaderSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 12,
    fontSize: 13,
  },
  textArea: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    height: 70,
    textAlignVertical: 'top',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  avatarChoice: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  avatarChoiceActive: {
    borderColor: '#10B981',
    transform: [{ scale: 1.05 }],
  },
  avatarChoiceImg: {
    width: '100%',
    height: '100%',
  },
  avatarCheckBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    borderRadius: 10,
    padding: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 14,
  },
  submitBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  quickLoginDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
  },
  quickUsersList: {
    gap: 8,
    marginBottom: 16,
  },
  quickUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  quickUserName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  quickUserHandle: {
    color: '#38BDF8',
    fontSize: 10,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  guestBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  switchModeLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchModeText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  switchModeHighlight: {
    color: '#10B981',
    fontWeight: '700',
  },
});
