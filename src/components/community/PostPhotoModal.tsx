// Modal para Postar Foto de Via ou Falésia para a Comunidade com Upload Direto
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
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Route, Wall, UserProfile } from '../../types/climbing';
import { X, Camera, ImagePlus, CheckCircle2, MessageSquare, FolderUp } from 'lucide-react-native';

interface PostPhotoModalProps {
  visible: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  activeRoute?: Route | null;
  activeWall?: Wall | null;
  onSavePhoto: (photoData: {
    userId: string;
    userName: string;
    userAvatar: string;
    userCity: string;
    routeId?: string;
    routeName?: string;
    wallId?: string;
    wallName?: string;
    photoUrl: string;
    caption: string;
  }) => void;
}

export const PostPhotoModal: React.FC<PostPhotoModalProps> = ({
  visible,
  onClose,
  currentUser,
  activeRoute,
  activeWall,
  onSavePhoto,
}) => {
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80'
  );
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Exemplos rápidos de fotos para teste
  const samplePhotos = [
    'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  ];

  // Upload de imagem da galeria / arquivos do celular ou computador
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
          setPhotoUrl(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setPhotoUrl(asset.uri);
        }
      }
    } catch (err) {
      console.warn('Erro com ImagePicker, acionando fallback web:', err);
      triggerWebFileInput();
    } finally {
      setIsUploading(false);
    }
  };

  // Capturar foto com a câmera do celular
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'web') {
          window.alert('Permissão de acesso à câmera não concedida no navegador.');
        } else {
          Alert.alert('Permissão necessária', 'Permita o acesso à câmera para fotografar a via.');
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
          setPhotoUrl(`data:image/jpeg;base64,${asset.base64}`);
        } else {
          setPhotoUrl(asset.uri);
        }
      }
    } catch (err) {
      console.warn('Erro ao abrir câmera, acionando fallback web:', err);
      triggerWebFileInput();
    } finally {
      setIsUploading(false);
    }
  };

  // Fallback direto HTML input para navegadores web
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
              setPhotoUrl(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const handlePost = () => {
    if (!photoUrl.trim()) return;

    onSavePhoto({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      userCity: `${currentUser.city} - ${currentUser.state}`,
      routeId: activeRoute?.id,
      routeName: activeRoute ? `${activeRoute.name} (${activeRoute.grade.brazilian})` : undefined,
      wallId: activeWall?.id,
      wallName: activeWall?.name,
      photoUrl: photoUrl.trim(),
      caption: caption.trim() || 'Foto compartilhada no guia colaborativo!',
    });

    setCaption('');
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
              <Text style={styles.title}>Postar Foto na Via</Text>
              <Text style={styles.subtitle}>
                {activeRoute
                  ? `Compartilhe fotos em ${activeRoute.name} (${activeRoute.grade.brazilian})`
                  : activeWall
                  ? `Compartilhe fotos em ${activeWall.name}`
                  : 'Compartilhe fotos com a comunidade de escalada'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Preview da Imagem */}
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: photoUrl }} style={styles.imagePreview} resizeMode="cover" />
              <View style={styles.previewBadge}>
                <CheckCircle2 size={12} color="#10B981" />
                <Text style={styles.previewBadgeText}>PRONTA PARA PUBLICAR</Text>
              </View>
            </View>

            {/* Botões de Upload e Câmera */}
            <View style={styles.uploadRow}>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handlePickImage}
                activeOpacity={0.8}
                disabled={isUploading}
              >
                <FolderUp size={16} color="#0F172A" />
                <Text style={styles.uploadBtnText}>
                  {isUploading ? 'CARREGANDO...' : 'ENVIAR FOTO DO DISPOSITIVO'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
                disabled={isUploading}
              >
                <Camera size={16} color="#38BDF8" />
                <Text style={styles.cameraBtnText}>CÂMERA</Text>
              </TouchableOpacity>
            </View>

            {/* Opções de fotos de exemplo */}
            <Text style={styles.label}>Ou selecione um exemplo rápido:</Text>
            <View style={styles.samplesRow}>
              {samplePhotos.map((url, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.sampleThumb, photoUrl === url && styles.sampleThumbActive]}
                  onPress={() => setPhotoUrl(url)}
                >
                  <Image source={{ uri: url }} style={styles.sampleImg} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Campo URL personalizado */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Ou cole o link direto da foto</Text>
              <TextInput
                style={styles.input}
                value={photoUrl}
                onChangeText={setPhotoUrl}
                placeholder="https://..."
                placeholderTextColor="#64748B"
              />
            </View>

            {/* Legenda / Beta */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Legenda / Beta da Via</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={caption}
                onChangeText={setCaption}
                placeholder="Ex: Pegada no reglete afiado antes da 4ª costura! Vista incrível ao pôr do sol..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {/* Botão de Publicação */}
          <TouchableOpacity style={styles.postBtn} onPress={handlePost} activeOpacity={0.8}>
            <ImagePlus size={20} color="#0F172A" />
            <Text style={styles.postBtnText}>PUBLICAR FOTO NA COMUNIDADE</Text>
          </TouchableOpacity>
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
    fontSize: 20,
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
  formScroll: {
    marginBottom: 14,
  },
  imagePreviewWrapper: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  previewBadgeText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  uploadBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 11,
    borderRadius: 10,
  },
  uploadBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
  },
  cameraBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  cameraBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  label: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  samplesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  sampleThumb: {
    width: 60,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#334155',
  },
  sampleThumbActive: {
    borderColor: '#10B981',
  },
  sampleImg: {
    width: '100%',
    height: '100%',
  },
  fieldGroup: {
    marginBottom: 12,
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
    height: 70,
    textAlignVertical: 'top',
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  postBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
