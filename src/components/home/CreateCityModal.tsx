// Modal de Cadastro de Nova Cidade / Polo de Escalada (Nível 1 da Hierarquia)
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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ClimbingDestination } from '../../types/climbing';
import {
  X,
  MapPin,
  Mountain,
  Camera,
  CheckCircle2,
  Plus,
  ImagePlus,
  Sparkles,
  Layers,
  Box,
  Shield,
} from 'lucide-react-native';

interface CreateCityModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newCity: ClimbingDestination) => void;
}

const SAMPLE_CITY_COVERS = [
  {
    name: 'Inselbergs Paraibanos',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Granito do Agreste',
    url: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Sertão Nordestino',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Falésias de Calcário',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
  },
];

const POPULAR_STATES = ['PB', 'RN', 'PE', 'CE', 'BA', 'MG', 'SP', 'RJ'];
const ROCK_TYPES = ['Granito', 'Gnaisse', 'Calcário', 'Arenito', 'Quartzito', 'Basalto'];

export const CreateCityModal: React.FC<CreateCityModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('PB');
  const [regionName, setRegionName] = useState('');
  const [description, setDescription] = useState('');
  const [rockType, setRockType] = useState('Granito');
  const [distanceFromCapital, setDistanceFromCapital] = useState('');

  // Modalidades presentes na cidade
  const [hasBoulder, setHasBoulder] = useState(true);
  const [hasSport, setHasSport] = useState(true);
  const [hasTrad, setHasTrad] = useState(false);

  // Foto de Capa
  const [coverImage, setCoverImage] = useState(SAMPLE_CITY_COVERS[0].url);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      setIsUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          setCoverImage(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setCoverImage(asset.uri);
        }
      }
    } catch (err) {
      console.warn('Erro com ImagePicker, fallback para web input:', err);
      triggerWebFileInput();
    } finally {
      setIsUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'web') {
          window.alert('Permissão para câmera não concedida no navegador.');
        } else {
          Alert.alert('Permissão necessária', 'Permita o acesso à câmera para fotografar a cidade.');
        }
        return;
      }

      setIsUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          setCoverImage(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setCoverImage(asset.uri);
        }
      }
    } catch (err) {
      console.warn('Erro ao abrir câmera, fallback para web:', err);
      triggerWebFileInput();
    } finally {
      setIsUploading(false);
    }
  };

  const triggerWebFileInput = () => {
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
              setCoverImage(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const handleSave = () => {
    if (!cityName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Por favor, informe o nome da cidade ou polo de escalada.');
      } else {
        Alert.alert('Campo obrigatório', 'Informe o nome da cidade.');
      }
      return;
    }

    const cityClean = cityName.trim();
    const cityId = `dest-custom-${Date.now()}`;

    const newDestination: ClimbingDestination = {
      id: cityId,
      name: cityClean,
      state: stateName.trim().toUpperCase(),
      regionName: regionName.trim() || `${cityClean} e Região`,
      coverImage: coverImage.trim(),
      description:
        description.trim() ||
        `Polo de escalada em ${cityClean} (${stateName.trim().toUpperCase()}), cadastrado pela comunidade de escaladores locais.`,
      rockType: rockType,
      totalRoutes: 0,
      totalSectors: 0,
      has3D: false,
      hasTrad: hasTrad,
      hasSport: hasSport,
      hasBoulder: hasBoulder,
      distanceFromCapital: distanceFromCapital.trim() || `Localizado no estado de ${stateName.trim().toUpperCase()}`,
      highlights: [cityClean, rockType, 'Comunidade Ativa'],
      sectors: [],
    };

    onSave(newDestination);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.levelBadge}>
                <MapPin size={12} color="#10B981" />
                <Text style={styles.levelBadgeText}>NÍVEL 1 • CIDADE / POLO</Text>
              </View>
              <Text style={styles.title}>Cadastrar Nova Cidade</Text>
              <Text style={styles.subtitle}>
                Adicione um novo polo onde você e outros escaladores cadastrarão pedras e vias.
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Nome da Cidade e Estado */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>NOME DA CIDADE / POLO *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Sousa, Bananeiras, Picotes, Remígio..."
                placeholderTextColor="#64748B"
                value={cityName}
                onChangeText={setCityName}
              />
            </View>

            {/* Seletor de Estado */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>ESTADO (UF)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {POPULAR_STATES.map(st => {
                  const isSelected = stateName === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setStateName(st)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{st}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Região e Distância */}
            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>REGIÃO / MICRORREGIÃO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Alto Sertão, Agreste..."
                  placeholderTextColor="#64748B"
                  value={regionName}
                  onChangeText={setRegionName}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>DISTÂNCIA / ACESSO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 400 km de João Pessoa"
                  placeholderTextColor="#64748B"
                  value={distanceFromCapital}
                  onChangeText={setDistanceFromCapital}
                />
              </View>
            </View>

            {/* Tipo de Rocha */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>TIPO DE ROCHA PREDOMINANTE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {ROCK_TYPES.map(rk => {
                  const isSelected = rockType === rk;
                  return (
                    <TouchableOpacity
                      key={rk}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setRockType(rk)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{rk}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Modalidades Presentes */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>MODALIDADES PRESENTES NESTA CIDADE</Text>
              <View style={styles.modalitiesRow}>
                <TouchableOpacity
                  style={[styles.modalityBtn, hasBoulder && styles.modalityBtnActive]}
                  onPress={() => setHasBoulder(!hasBoulder)}
                  activeOpacity={0.7}
                >
                  <Box size={16} color={hasBoulder ? '#10B981' : '#94A3B8'} />
                  <Text style={[styles.modalityBtnText, hasBoulder && styles.modalityBtnTextActive]}>
                    🪨 Boulders
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalityBtn, hasSport && styles.modalityBtnActive]}
                  onPress={() => setHasSport(!hasSport)}
                  activeOpacity={0.7}
                >
                  <Sparkles size={16} color={hasSport ? '#10B981' : '#94A3B8'} />
                  <Text style={[styles.modalityBtnText, hasSport && styles.modalityBtnTextActive]}>
                    🧗 Esportiva
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalityBtn, hasTrad && styles.modalityBtnActive]}
                  onPress={() => setHasTrad(!hasTrad)}
                  activeOpacity={0.7}
                >
                  <Shield size={16} color={hasTrad ? '#10B981' : '#94A3B8'} />
                  <Text style={[styles.modalityBtnText, hasTrad && styles.modalityBtnTextActive]}>
                    🛡️ Trad / Móvel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Foto de Capa da Cidade */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>FOTO DE CAPA DA CIDADE / POLO</Text>
              <View style={styles.photoActionsRow}>
                <TouchableOpacity
                  style={styles.uploadBtnPrimary}
                  onPress={handlePickImage}
                  disabled={isUploading}
                  activeOpacity={0.8}
                >
                  <ImagePlus size={16} color="#FFFFFF" />
                  <Text style={styles.uploadBtnPrimaryText}>Galeria / Arquivos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadBtnSecondary}
                  onPress={handleTakePhoto}
                  disabled={isUploading}
                  activeOpacity={0.8}
                >
                  <Camera size={16} color="#38BDF8" />
                  <Text style={styles.uploadBtnSecondaryText}>Tirar Foto</Text>
                </TouchableOpacity>
              </View>

              {/* Preview da Imagem Selecionada */}
              {coverImage ? (
                <View style={styles.photoPreviewWrapper}>
                  <Image source={{ uri: coverImage }} style={styles.photoPreview} resizeMode="cover" />
                  <View style={styles.photoSelectedBadge}>
                    <CheckCircle2 size={12} color="#10B981" />
                    <Text style={styles.photoSelectedText}>Foto pronta para publicação</Text>
                  </View>
                </View>
              ) : null}

              {/* Presets Rápidos */}
              <Text style={styles.presetsLabel}>Ou escolha uma imagem de referência rápida:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
                {SAMPLE_CITY_COVERS.map((sample, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.presetThumb, coverImage === sample.url && styles.presetThumbActive]}
                    onPress={() => setCoverImage(sample.url)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: sample.url }} style={styles.presetImage} />
                    <Text style={styles.presetText} numberOfLines={1}>{sample.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Descrição / História do Polo */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>DESCRIÇÃO / HISTÓRIA DO POLO</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ex: Polo tradicional de escalada em granito no sertão. Conta com blocos de boulder na base e paredes para vias esportivas..."
                placeholderTextColor="#64748B"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Botão de Salvar Cidade */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <CheckCircle2 size={18} color="#0F172A" />
              <Text style={styles.saveBtnText}>CRIAR CIDADE & COMEÇAR A CADASTRAR PEDRAS</Text>
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
    maxWidth: 290,
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
  chipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#10B981',
    fontWeight: '700',
  },
  modalitiesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalityBtn: {
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
  modalityBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  modalityBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  modalityBtnTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  uploadBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
  },
  uploadBtnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  uploadBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingVertical: 10,
    borderRadius: 8,
  },
  uploadBtnSecondaryText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 12,
  },
  photoPreviewWrapper: {
    position: 'relative',
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoSelectedBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoSelectedText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
  },
  presetsLabel: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 6,
  },
  presetsRow: {
    gap: 8,
  },
  presetThumb: {
    width: 90,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetThumbActive: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  presetImage: {
    width: '100%',
    height: 42,
  },
  presetText: {
    color: '#94A3B8',
    fontSize: 9,
    textAlign: 'center',
    paddingHorizontal: 2,
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
