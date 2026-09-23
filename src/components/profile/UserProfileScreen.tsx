// Tela de Perfil do Escalador — CRUX Plataforma Colaborativa
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { UserProfile, AscentLog, CommunityPhoto, ClimbingDestination } from '../../types/climbing';
import {
  Award,
  Camera,
  MapPin,
  Calendar,
  Share2,
  Users,
  ImagePlus,
  Plus,
  Compass,
  Star,
  Flame,
  CheckCircle2,
  Sparkles,
  Mountain,
  LogOut,
  LogIn,
  User,
  Upload,
  Check,
  X,
  Link2,
} from 'lucide-react-native';
import { getGradeBadgeColor } from '../../services/gradeConverter';
import { CommunityService, DEFAULT_USER } from '../../services/communityService';

// Galeria de avatares de escaladores para troca rápida em 1 clique
const CLIMBER_AVATAR_PRESETS = [
  {
    id: 'preset-1',
    label: 'Clássico',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-2',
    label: 'Granito PB',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-3',
    label: 'Marinho',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-4',
    label: 'Alpinista',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-5',
    label: 'Crag Master',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-6',
    label: 'Boulder Pro',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-7',
    label: 'Aventureiro',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-8',
    label: 'Highlander',
    url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80',
  },
];

interface UserProfileScreenProps {
  user: UserProfile | null;
  logs: AscentLog[];
  communityPhotos: CommunityPhoto[];
  customDestinations: ClimbingDestination[];
  onOpenAuthModal: () => void;
  onOpenPostPhoto: () => void;
  onOpenCreateCrag: () => void;
  onLogout?: () => void;
  onUpdateUser?: (updatedUser: UserProfile) => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  user,
  logs,
  communityPhotos,
  customDestinations,
  onOpenAuthModal,
  onOpenPostPhoto,
  onOpenCreateCrag,
  onLogout,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'ascents' | 'photos' | 'crags'>('ascents');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState('');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const safeUser = user || DEFAULT_USER;
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safePhotos = Array.isArray(communityPhotos) ? communityPhotos : [];
  const safeDestinations = Array.isArray(customDestinations) ? customDestinations : [];

  // Abre modal de troca de foto com o avatar atual carregado
  const handleOpenAvatarModal = () => {
    setTempAvatarUrl(
      safeUser.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    );
    setShowAvatarModal(true);
  };

  // Upload de foto pela galeria / arquivos
  const handlePickAvatar = async () => {
    try {
      setIsUploadingAvatar(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          setTempAvatarUrl(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setTempAvatarUrl(asset.uri);
        }
      }
    } catch (err) {
      console.warn('Erro ao selecionar foto de perfil, usando fallback web:', err);
      triggerWebAvatarInput();
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Tirar foto com a câmera do celular
  const handleTakeAvatarPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'web') {
          window.alert('Permissão de câmera não concedida no navegador.');
        } else {
          Alert.alert('Permissão necessária', 'Permita o acesso à câmera para fotografar seu perfil.');
        }
        return;
      }

      setIsUploadingAvatar(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          setTempAvatarUrl(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setTempAvatarUrl(asset.uri);
        }
      }
    } catch (err) {
      console.warn('Erro ao abrir câmera para foto de perfil:', err);
      triggerWebAvatarInput();
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Fallback web para input de arquivo HTML
  const triggerWebAvatarInput = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setTempAvatarUrl(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  // Salva a nova foto no perfil do usuário e sincroniza com a aplicação
  const handleSaveAvatar = async () => {
    if (!tempAvatarUrl || !tempAvatarUrl.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Selecione uma imagem ou insira uma URL válida.');
      } else {
        Alert.alert('Atenção', 'Selecione uma imagem ou insira uma URL válida.');
      }
      return;
    }

    try {
      setIsSavingAvatar(true);
      const updatedUser: UserProfile = {
        ...safeUser,
        avatarUrl: tempAvatarUrl.trim(),
      };

      await CommunityService.updateProfile(updatedUser);

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      setShowAvatarModal(false);

      if (Platform.OS === 'web') {
        window.alert('Foto de perfil atualizada com sucesso!');
      } else {
        Alert.alert('Sucesso', 'Sua foto de perfil foi atualizada com sucesso!');
      }
    } catch (err) {
      console.warn('Erro ao salvar foto de perfil:', err);
      if (Platform.OS === 'web') {
        window.alert('Não foi possível salvar a nova foto de perfil.');
      } else {
        Alert.alert('Erro', 'Não foi possível salvar a nova foto de perfil.');
      }
    } finally {
      setIsSavingAvatar(false);
    }
  };

  // Filtra fotos postadas pelo usuário atual
  const userPhotos = safePhotos.filter(p => p && p.userId === safeUser.id);

  // Calcula estatísticas
  const onsightCount = safeLogs.filter(l => l && l.style === 'onsight').length;
  const flashCount = safeLogs.filter(l => l && l.style === 'flash').length;
  const redpointCount = safeLogs.filter(l => l && l.style === 'redpoint').length;

  // Se o usuário não estiver logado (modo visitante)
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.guestCard}>
          <View style={styles.guestIconCircle}>
            <User size={38} color="#10B981" />
          </View>
          <Text style={styles.guestTitle}>Nenhum escalador conectado</Text>
          <Text style={styles.guestSubtitle}>
            Entre com sua conta ou crie um perfil gratuito para registrar cadenas no seu diário, postar fotos de vias e falésias, e fazer parte da comunidade CRUX.
          </Text>

          <TouchableOpacity
            style={styles.guestLoginBtn}
            onPress={onOpenAuthModal}
            activeOpacity={0.8}
          >
            <LogIn size={18} color="#0F172A" />
            <Text style={styles.guestLoginBtnText}>ENTRAR OU CRIAR CONTA</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner Superior & Header do Perfil */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          {/* Avatar com badge de edição ao clicar */}
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleOpenAvatarModal}
            activeOpacity={0.8}
            accessibilityLabel="Trocar foto do perfil"
            accessibilityRole="button"
          >
            <Image
              source={{
                uri:
                  safeUser.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
              }}
              style={styles.avatarImg}
            />
            {/* Ícone de câmera para indicar edição da foto */}
            <View style={styles.editAvatarBadge}>
              <Camera size={13} color="#FFFFFF" />
            </View>
            <View style={styles.verifiedBadge}>
              <CheckCircle2 size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.switchUserBtn}
              onPress={onOpenAuthModal}
              activeOpacity={0.8}
            >
              <Users size={14} color="#38BDF8" />
              <Text style={styles.switchUserText}>Trocar / Criar</Text>
            </TouchableOpacity>

            {onLogout && (
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={onLogout}
                activeOpacity={0.8}
              >
                <LogOut size={14} color="#EF4444" />
                <Text style={styles.logoutBtnText}>Sair</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.userName}>{safeUser.name || 'Escalador'}</Text>
        <Text style={styles.userHandle}>@{safeUser.username || 'escalador'}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MapPin size={13} color="#38BDF8" />
            <Text style={styles.metaText}>
              {safeUser.city || 'Campina Grande'}, {safeUser.state || 'PB'}
            </Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <View style={styles.metaItem}>
            <Calendar size={13} color="#94A3B8" />
            <Text style={styles.metaText}>No CRUX desde {safeUser.memberSince || '2023'}</Text>
          </View>
        </View>

        {safeUser.bio ? (
          <Text style={styles.bioText}>{safeUser.bio}</Text>
        ) : null}

        {/* Destaque de Maior Grau */}
        <View style={styles.hardestGradeCard}>
          <Flame size={18} color="#F59E0B" />
          <View style={styles.hardestGradeInfo}>
            <Text style={styles.hardestGradeLabel}>CADENA MAIS DURA</Text>
            <Text style={styles.hardestGradeValue}>{safeUser.hardestGrade || '7a'}</Text>
          </View>
          <View style={styles.hardestGradeTag}>
            <Text style={styles.hardestGradeTagText}>ESPORTIVA</Text>
          </View>
        </View>

        {/* Grid de Estatísticas Gerais */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{safeLogs.length}</Text>
            <Text style={styles.statLabel}>Cadenas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userPhotos.length}</Text>
            <Text style={styles.statLabel}>Fotos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{safeDestinations.length}</Text>
            <Text style={styles.statLabel}>Pedras</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{onsightCount}</Text>
            <Text style={styles.statLabel}>A Vista</Text>
          </View>
        </View>
      </View>

      {/* Abas de Navegação Interna */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'ascents' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ascents')}
        >
          <Award size={16} color={activeTab === 'ascents' ? '#10B981' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'ascents' && styles.tabButtonTextActive]}>
            Cadenas ({safeLogs.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'photos' && styles.tabButtonActive]}
          onPress={() => setActiveTab('photos')}
        >
          <Camera size={16} color={activeTab === 'photos' ? '#38BDF8' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'photos' && styles.tabButtonTextActive]}>
            Fotos & Betas ({userPhotos.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'crags' && styles.tabButtonActive]}
          onPress={() => setActiveTab('crags')}
        >
          <Mountain size={16} color={activeTab === 'crags' ? '#F59E0B' : '#64748B'} />
          <Text style={[styles.tabButtonText, activeTab === 'crags' && styles.tabButtonTextActive]}>
            Pedras ({safeDestinations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo da Aba 1: Cadenas & Diário */}
      {activeTab === 'ascents' && (
        <View style={styles.sectionContainer}>
          {safeLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <Award size={40} color="#334155" />
              <Text style={styles.emptyStateTitle}>Nenhuma cadena registrada</Text>
              <Text style={styles.emptyStateSub}>
                Abra uma via no Guia da Parede e clique em "Registrar Cadena" para alimentar seu logbook!
              </Text>
            </View>
          ) : (
            <View style={styles.ascentsList}>
              {safeLogs.map((log) => {
                const gradeStr = log.gradeStr || (log as any).routeGrade || '5º';
                const gradeColor = getGradeBadgeColor(gradeStr);
                const ratingStars = log.ratingStars || (log as any).rating || 5;
                const notes = log.personalNotes || (log as any).notes || '';
                const styleKey = log.style || 'redpoint';

                return (
                  <View key={log.id} style={styles.ascentCard}>
                    <View style={styles.ascentHeader}>
                      <View style={styles.ascentTitleGroup}>
                        <Text style={styles.ascentRouteName}>{log.routeName}</Text>
                        <Text style={styles.ascentLocation}>
                          {log.wallName} • {log.sectorName}
                        </Text>
                      </View>
                      <View style={[styles.ascentGradeBadge, { backgroundColor: gradeColor }]}>
                        <Text style={styles.ascentGradeText}>{gradeStr}</Text>
                      </View>
                    </View>

                    <View style={styles.ascentMetaRow}>
                      <View
                        style={[
                          styles.stylePill,
                          styleKey === 'onsight'
                            ? styles.styleOnsight
                            : styleKey === 'flash'
                            ? styles.styleFlash
                            : styles.styleRedpoint,
                        ]}
                      >
                        <Text style={styles.stylePillText}>{styleKey.toUpperCase()}</Text>
                      </View>

                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            color={s <= ratingStars ? '#F59E0B' : '#334155'}
                            fill={s <= ratingStars ? '#F59E0B' : 'transparent'}
                          />
                        ))}
                      </View>

                      <Text style={styles.ascentDate}>{log.date}</Text>
                    </View>

                    {notes ? (
                      <Text style={styles.ascentNotes}>"{notes}"</Text>
                    ) : null}

                    {log.partner ? (
                      <Text style={styles.ascentPartner}>🧗 Parceria: {log.partner}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Conteúdo da Aba 2: Fotos & Betas da Comunidade */}
      {activeTab === 'photos' && (
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.addPhotoBannerBtn}
            onPress={onOpenPostPhoto}
            activeOpacity={0.8}
          >
            <ImagePlus size={18} color="#0F172A" />
            <Text style={styles.addPhotoBannerText}>POSTAR NOVA FOTO / BETA</Text>
          </TouchableOpacity>

          {userPhotos.length === 0 ? (
            <View style={styles.emptyState}>
              <Camera size={40} color="#334155" />
              <Text style={styles.emptyStateTitle}>Nenhuma foto compartilhada ainda</Text>
              <Text style={styles.emptyStateSub}>
                Compartilhe fotos dos lances, agarras e paisagens das falésias para ajudar outros escaladores!
              </Text>
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {userPhotos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image source={{ uri: photo.photoUrl }} style={styles.photoCardImg} resizeMode="cover" />
                  <View style={styles.photoCardOverlay}>
                    {photo.routeName && (
                      <View style={styles.photoRouteTag}>
                        <Text style={styles.photoRouteTagText}>{photo.routeName}</Text>
                      </View>
                    )}
                    <Text style={styles.photoCaption} numberOfLines={2}>
                      {photo.caption || 'Foto da via'}
                    </Text>
                    <View style={styles.photoCardBottom}>
                      <Text style={styles.photoDate}>{photo.date}</Text>
                      <Text style={styles.photoLikes}>❤️ {photo.likesCount || 0}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Conteúdo da Aba 3: Pedras Cadastradas pelo Usuário */}
      {activeTab === 'crags' && (
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.addPhotoBannerBtn, { backgroundColor: '#F59E0B' }]}
            onPress={onOpenCreateCrag}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#0F172A" />
            <Text style={styles.addPhotoBannerText}>REGISTRAR NOVA PEDRA EM CAMPO</Text>
          </TouchableOpacity>

          {safeDestinations.length === 0 ? (
            <View style={styles.emptyState}>
              <Compass size={40} color="#334155" />
              <Text style={styles.emptyStateTitle}>Nenhuma pedra cadastrada por você</Text>
              <Text style={styles.emptyStateSub}>
                Descobriu uma rocha nova? Capture as coordenadas de GPS, tipo de rocha e fotos da falésia.
              </Text>
            </View>
          ) : (
            <View style={styles.cragsList}>
              {safeDestinations.map((dest) => {
                const cityName = dest.sectors?.[0]?.city || (dest as any).city || 'Paraíba';
                const routesCount = dest.totalRoutes || (dest as any).totalRoutesCount || 0;

                return (
                  <View key={dest.id} style={styles.customCragCard}>
                    <View style={styles.customCragHeader}>
                      <View>
                        <Text style={styles.customCragName}>{dest.name}</Text>
                        <Text style={styles.customCragLocation}>
                          {cityName}, {dest.state} • {routesCount} vias
                        </Text>
                      </View>
                      <View style={styles.customCragBadge}>
                        <Text style={styles.customCragBadgeText}>NOVO</Text>
                      </View>
                    </View>
                    <Text style={styles.customCragDesc} numberOfLines={2}>
                      {dest.description}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Modal de Troca de Foto de Perfil */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.avatarModalContent}>
            {/* Header do Modal */}
            <View style={styles.avatarModalHeader}>
              <View style={styles.avatarModalTitleBox}>
                <Camera size={20} color="#10B981" />
                <Text style={styles.avatarModalTitle}>Alterar Foto do Perfil</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAvatarModal(false)}
                style={styles.avatarModalCloseBtn}
              >
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.avatarModalBody}>
              {/* Preview do Avatar Selecionado */}
              <View style={styles.avatarPreviewSection}>
                <View style={styles.avatarPreviewRing}>
                  <Image
                    source={{
                      uri:
                        tempAvatarUrl ||
                        safeUser.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                    }}
                    style={styles.avatarPreviewImg}
                  />
                  {isUploadingAvatar && (
                    <View style={styles.avatarUploadingOverlay}>
                      <ActivityIndicator size="small" color="#10B981" />
                    </View>
                  )}
                </View>
                <Text style={styles.avatarPreviewHint}>
                  Prévia da foto no seu perfil
                </Text>
              </View>

              {/* Botões de Ação Rápida: Galeria e Câmera */}
              <Text style={styles.avatarSectionLabel}>ESCOLHER DO DISPOSITIVO</Text>
              <View style={styles.avatarPickerRow}>
                <TouchableOpacity
                  style={styles.avatarPickerBtn}
                  onPress={handlePickAvatar}
                  disabled={isUploadingAvatar}
                  activeOpacity={0.8}
                >
                  <Upload size={16} color="#38BDF8" />
                  <Text style={styles.avatarPickerBtnText}>Galeria / Arquivo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.avatarPickerBtn}
                  onPress={handleTakeAvatarPhoto}
                  disabled={isUploadingAvatar}
                  activeOpacity={0.8}
                >
                  <Camera size={16} color="#10B981" />
                  <Text style={styles.avatarPickerBtnText}>Tirar Foto</Text>
                </TouchableOpacity>
              </View>

              {/* Input de URL Direta */}
              <Text style={styles.avatarSectionLabel}>OU DIGITE A URL DA IMAGEM</Text>
              <View style={styles.avatarInputWrapper}>
                <Link2 size={16} color="#64748B" style={{ marginLeft: 10 }} />
                <TextInput
                  style={styles.avatarUrlInput}
                  placeholder="https://exemplo.com/sua-foto.jpg"
                  placeholderTextColor="#64748B"
                  value={tempAvatarUrl}
                  onChangeText={setTempAvatarUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Presets de Escaladores */}
              <View style={styles.presetsHeaderRow}>
                <Text style={styles.avatarSectionLabel}>OU ESCOLHA UM AVATAR DE ESCALADA</Text>
                <Sparkles size={14} color="#F59E0B" />
              </View>
              <View style={styles.presetsGrid}>
                {CLIMBER_AVATAR_PRESETS.map((preset) => {
                  const isSelected = tempAvatarUrl === preset.url;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.presetItem,
                        isSelected && styles.presetItemSelected,
                      ]}
                      onPress={() => setTempAvatarUrl(preset.url)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: preset.url }} style={styles.presetImage} />
                      {isSelected && (
                        <View style={styles.presetCheckBadge}>
                          <Check size={10} color="#FFF" />
                        </View>
                      )}
                      <Text
                        style={[
                          styles.presetLabel,
                          isSelected && styles.presetLabelSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Footer com Cancelar e Salvar */}
            <View style={styles.avatarModalFooter}>
              <TouchableOpacity
                style={styles.avatarCancelBtn}
                onPress={() => setShowAvatarModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.avatarCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.avatarSaveBtn, isSavingAvatar && { opacity: 0.6 }]}
                onPress={handleSaveAvatar}
                disabled={isSavingAvatar}
                activeOpacity={0.8}
              >
                {isSavingAvatar ? (
                  <ActivityIndicator size="small" color="#0F172A" />
                ) : (
                  <Check size={16} color="#0F172A" />
                )}
                <Text style={styles.avatarSaveBtnText}>
                  {isSavingAvatar ? 'Salvando...' : 'Salvar Foto'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  headerCard: {
    backgroundColor: '#0F172A',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    backgroundColor: '#10B981',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  switchUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  switchUserText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  guestCard: {
    backgroundColor: '#0F172A',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  guestIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  guestTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  guestSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  guestLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  guestLoginBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 13,
    color: '#38BDF8',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  metaDot: {
    color: '#475569',
  },
  bioText: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 14,
  },
  hardestGradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    gap: 12,
  },
  hardestGradeInfo: {
    flex: 1,
  },
  hardestGradeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hardestGradeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F59E0B',
  },
  hardestGradeTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hardestGradeTagText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#10B981',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  sectionContainer: {
    padding: 16,
  },
  addPhotoBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 10,
    marginBottom: 16,
  },
  addPhotoBannerText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  ascentsList: {
    gap: 10,
  },
  ascentCard: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ascentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ascentTitleGroup: {
    flex: 1,
  },
  ascentRouteName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ascentLocation: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  ascentGradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ascentGradeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  ascentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stylePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  styleOnsight: {
    backgroundColor: '#10B981',
  },
  styleFlash: {
    backgroundColor: '#38BDF8',
  },
  styleRedpoint: {
    backgroundColor: '#F59E0B',
  },
  stylePillText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ascentDate: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 'auto',
  },
  ascentNotes: {
    fontSize: 12,
    color: '#CBD5E1',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  ascentPartner: {
    fontSize: 11,
    color: '#94A3B8',
  },
  photosGrid: {
    gap: 12,
  },
  photoCard: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  photoCardImg: {
    width: '100%',
    height: '100%',
  },
  photoCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 10,
  },
  photoRouteTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  photoRouteTagText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '900',
  },
  photoCaption: {
    color: '#F8FAFC',
    fontSize: 12,
    marginBottom: 4,
  },
  photoCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoDate: {
    color: '#94A3B8',
    fontSize: 10,
  },
  photoLikes: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  cragsList: {
    gap: 10,
  },
  customCragCard: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  customCragHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  customCragName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  customCragLocation: {
    fontSize: 11,
    color: '#38BDF8',
    marginTop: 2,
  },
  customCragBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  customCragBadgeText: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '900',
  },
  customCragDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  // Modal de Troca de Foto
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  avatarModalContent: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  avatarModalTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarModalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  avatarModalCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  avatarModalBody: {
    padding: 18,
  },
  avatarPreviewSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPreviewRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#10B981',
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    marginBottom: 8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPreviewImg: {
    width: '100%',
    height: '100%',
  },
  avatarUploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPreviewHint: {
    color: '#94A3B8',
    fontSize: 12,
  },
  avatarSectionLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 14,
    marginBottom: 8,
  },
  avatarPickerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  avatarPickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarPickerBtnText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  avatarInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  avatarUrlInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 12,
  },
  presetsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetItem: {
    width: '23%',
    alignItems: 'center',
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
    position: 'relative',
  },
  presetItemSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  presetImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 4,
  },
  presetCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10B981',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  presetLabelSelected: {
    color: '#10B981',
    fontWeight: '800',
  },
  avatarModalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0B1120',
  },
  avatarCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCancelBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  avatarSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
  },
  avatarSaveBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
});
