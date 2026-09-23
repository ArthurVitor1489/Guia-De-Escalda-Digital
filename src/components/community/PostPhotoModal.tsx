// Modal para Postar Foto de Via ou Falésia para a Comunidade
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
} from 'react-native';
import { Route, Wall, UserProfile } from '../../types/climbing';
import { X, Camera, ImagePlus, CheckCircle2, MessageSquare } from 'lucide-react-native';

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

  // Exemplos rápidos de fotos para teste
  const samplePhotos = [
    'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  ];

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
            </View>

            {/* Opções de fotos de exemplo */}
            <Text style={styles.label}>Escolha ou cole o link da foto:</Text>
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
              <Text style={styles.label}>URL da Foto (ou câmera)</Text>
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
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
