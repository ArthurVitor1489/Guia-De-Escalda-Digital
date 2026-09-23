// Modal de Cadastro Manual de Nova Pedra / Falésia em Campo
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
  ClimbingDestination,
  Sector,
  Wall,
  Route,
  RockType,
  CompassOrientation,
  ProtectionCategory,
} from '../../types/climbing';
import {
  X,
  MapPin,
  Mountain,
  Compass,
  Sun,
  Shield,
  Clock,
  Camera,
  CheckCircle2,
  Navigation,
  Plus,
} from 'lucide-react-native';

interface CreateCragModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newDestination: ClimbingDestination) => void;
}

export const CreateCragModal: React.FC<CreateCragModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  // Informações da Pedra / Polo
  const [cragName, setCragName] = useState('');
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('PB');
  const [regionName, setRegionName] = useState('Agreste / Sertão');
  const [description, setDescription] = useState('');

  // Localização & GPS
  const [latitude, setLatitude] = useState('-7.2280');
  const [longitude, setLongitude] = useState('-35.8890');
  const [isCapturingGps, setIsCapturingGps] = useState(false);

  // Características da Rocha
  const [rockType, setRockType] = useState<RockType>('granito');
  const [orientation, setOrientation] = useState<CompassOrientation>('L');
  const [heightMeters, setHeightMeters] = useState('25');
  const [morningSun, setMorningSun] = useState<'sol' | 'sombra'>('sol');
  const [afternoonSun, setAfternoonSun] = useState<'sol' | 'sombra'>('sombra');

  // Trilha & Acesso
  const [approachMinutes, setApproachMinutes] = useState('15');
  const [approachTrail, setApproachTrail] = useState('');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80'
  );

  // Primeira Via da Pedra
  const [routeName, setRouteName] = useState('');
  const [routeGrade, setRouteGrade] = useState('6º');
  const [boltsCount, setBoltsCount] = useState('7');
  const [protectionType, setProtectionType] = useState<ProtectionCategory>('chapeleta');

  // Captura automática de GPS via navegador / dispositivo
  const handleCaptureGps = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsCapturingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(4));
          setLongitude(pos.coords.longitude.toFixed(4));
          setIsCapturingGps(false);
        },
        (err) => {
          setIsCapturingGps(false);
          if (Platform.OS === 'web') {
            window.alert('Não foi possível obter o GPS automaticamente. Preencha as coordenadas manualmente.');
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const handleSave = () => {
    if (!cragName.trim() || !cityName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Por favor, informe pelo menos o nome da pedra e a cidade.');
      }
      return;
    }

    const destId = `custom-dest-${Date.now()}`;
    const sectorId = `custom-sec-${Date.now()}`;
    const wallId = `custom-wall-${Date.now()}`;
    const routeId = `custom-route-${Date.now()}`;

    // Cria a primeira via se o usuário tiver preenchido
    const initialRoutes: Route[] = routeName.trim()
      ? [
          {
            id: routeId,
            wallId: wallId,
            orderIndex: 1,
            name: routeName.trim(),
            grade: {
              brazilian: routeGrade,
              french: '6a',
              yds: '5.10a',
              danger: 'E1',
            },
            heightMeters: parseInt(heightMeters) || 20,
            pitchesCount: 1,
            boltsCount: parseInt(boltsCount) || 6,
            protectionType: protectionType,
            anchorType: 'dupla_com_anel',
            style: 'esportiva',
            description: 'Primeira via cadastrada neste setor.',
          },
        ]
      : [];

    // Cria a Parede inicial da Pedra
    const newWall: Wall = {
      id: wallId,
      sectorId: sectorId,
      name: `Face Principal - ${cragName.trim()}`,
      orientation: orientation,
      sunShadeNotes: `Sol ${morningSun === 'sol' ? 'pela manhã' : 'à tarde'}, sombra ${afternoonSun === 'sombra' ? 'à tarde' : 'pela manhã'}.`,
      sunExposure: {
        morning: morningSun,
        afternoon: afternoonSun,
      },
      heightMeters: parseInt(heightMeters) || 25,
      rockType: rockType,
      approachNotes: approachTrail.trim() || 'Trilha de acesso local.',
      fallbackPhotoUrl: photoUrl.trim(),
      photos: [
        {
          id: `photo-${Date.now()}`,
          url: photoUrl.trim(),
          isMain: true,
          caption: `Foto da ${cragName.trim()}`,
        },
      ],
      routes: initialRoutes,
    };

    // Cria o Setor
    const newSector: Sector = {
      id: sectorId,
      name: cragName.trim(),
      cragName: cragName.trim(),
      region: regionName.trim() || 'Agreste / Paraíba',
      city: cityName.trim(),
      state: stateName.trim().toUpperCase(),
      coordinates: {
        latitude: parseFloat(latitude) || -7.228,
        longitude: parseFloat(longitude) || -35.889,
      },
      elevationMeters: 550,
      approachTimeMinutes: parseInt(approachMinutes) || 15,
      approachTrailDescription:
        approachTrail.trim() ||
        'Acesso sinalizado a partir da estrada vicinal com trilha até a base.',
      accessStatus: 'aberto',
      walls: [newWall],
    };

    // Cria o Destino / Polo
    const newDestination: ClimbingDestination = {
      id: destId,
      name: `${cragName.trim()} (${cityName.trim()})`,
      state: stateName.trim().toUpperCase(),
      regionName: regionName.trim() || `${cityName.trim()} - ${stateName.trim().toUpperCase()}`,
      coverImage: photoUrl.trim(),
      description:
        description.trim() ||
        `Novo setor de escalada cadastrado em campo por escaladores locais em ${cityName.trim()} - ${stateName.trim().toUpperCase()}.`,
      rockType: rockType.charAt(0).toUpperCase() + rockType.slice(1),
      totalRoutes: initialRoutes.length,
      totalSectors: 1,
      has3D: false,
      hasTrad: protectionType === 'movel' || protectionType === 'mista',
      hasSport: protectionType === 'chapeleta' || protectionType === 'grampo',
      hasBoulder: false,
      highlights: [cragName.trim(), `${heightMeters}m de altura`, rockType],
      distanceFromCapital: `Localizado em ${cityName.trim()} - ${stateName.trim().toUpperCase()}`,
      sectors: [newSector],
    };

    onSave(newDestination);
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
              <Text style={styles.title}>Cadastrar Nova Pedra</Text>
              <Text style={styles.subtitle}>
                Registre um novo ponto de escalada diretamente do campo
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* 1. IDENTIFICAÇÃO BÁSICA */}
            <Text style={styles.sectionHeader}>1. IDENTIFICAÇÃO DO LOCAL</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome da Pedra / Falésia *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Pedra da Santa, Falésia do Riacho, Bloco do Urubu"
                placeholderTextColor="#64748B"
                value={cragName}
                onChangeText={setCragName}
              />
            </View>

            <View style={styles.rowTwoCols}>
              <View style={[styles.fieldGroup, { flex: 2 }]}>
                <Text style={styles.label}>Cidade *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Campina Grande, Sousa, Remígio"
                  placeholderTextColor="#64748B"
                  value={cityName}
                  onChangeText={setCityName}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Estado *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="PB, RN, etc."
                  placeholderTextColor="#64748B"
                  value={stateName}
                  onChangeText={setStateName}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* 2. LOCALIZAÇÃO GPS */}
            <Text style={styles.sectionHeader}>2. COORDENADAS GPS</Text>
            <TouchableOpacity
              style={styles.gpsCaptureBtn}
              onPress={handleCaptureGps}
              activeOpacity={0.7}
            >
              <Navigation size={16} color="#0F172A" />
              <Text style={styles.gpsCaptureBtnText}>
                {isCapturingGps ? 'OBTENDO COORDENADAS GPS...' : '📍 CAPTURAR MINHA LOCALIZAÇÃO ATUAL'}
              </Text>
            </TouchableOpacity>

            <View style={styles.rowTwoCols}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="-7.2280"
                  placeholderTextColor="#64748B"
                  value={latitude}
                  onChangeText={setLatitude}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="-35.8890"
                  placeholderTextColor="#64748B"
                  value={longitude}
                  onChangeText={setLongitude}
                />
              </View>
            </View>

            {/* 3. CARACTERÍSTICAS DA ROCHA */}
            <Text style={styles.sectionHeader}>3. CARACTERÍSTICAS DA ROCHA</Text>
            <Text style={styles.label}>Tipo de Rocha</Text>
            <View style={styles.chipsRow}>
              {(['granito', 'calcario', 'arenito', 'quartzito', 'basalto'] as RockType[]).map(
                (r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.chip, rockType === r && styles.chipActive]}
                    onPress={() => setRockType(r)}
                  >
                    <Text style={[styles.chipText, rockType === r && styles.chipTextActive]}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <View style={styles.rowTwoCols}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Orientação da Face</Text>
                <View style={styles.chipsRowCompact}>
                  {(['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'] as CompassOrientation[]).map(
                    (o) => (
                      <TouchableOpacity
                        key={o}
                        style={[styles.chipMini, orientation === o && styles.chipActive]}
                        onPress={() => setOrientation(o)}
                      >
                        <Text style={[styles.chipTextMini, orientation === o && styles.chipTextActive]}>
                          {o}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Altura Média (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 25"
                  placeholderTextColor="#64748B"
                  value={heightMeters}
                  onChangeText={setHeightMeters}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>Exposição Solar</Text>
            <View style={styles.rowTwoCols}>
              <TouchableOpacity
                style={[styles.toggleBtn, morningSun === 'sol' && styles.toggleBtnActive]}
                onPress={() => setMorningSun(morningSun === 'sol' ? 'sombra' : 'sol')}
              >
                <Sun size={14} color={morningSun === 'sol' ? '#000000' : '#94A3B8'} />
                <Text style={[styles.toggleBtnText, morningSun === 'sol' && styles.toggleBtnTextActive]}>
                  Manhã: {morningSun.toUpperCase()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, afternoonSun === 'sombra' && styles.toggleBtnActiveBlue]}
                onPress={() => setAfternoonSun(afternoonSun === 'sol' ? 'sombra' : 'sol')}
              >
                <Sun size={14} color={afternoonSun === 'sol' ? '#000000' : '#38BDF8'} />
                <Text style={[styles.toggleBtnText, afternoonSun === 'sombra' && styles.toggleBtnTextActiveBlue]}>
                  Tarde: {afternoonSun.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 4. TRILHA E ACESSO */}
            <Text style={styles.sectionHeader}>4. TRILHA & ACESSO</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Tempo de Caminhada (minutos)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 15"
                placeholderTextColor="#64748B"
                value={approachMinutes}
                onChangeText={setApproachMinutes}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Como Chegar (Pontos de Referência, Porteiras)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ex: Deixar o carro na casa do Seu José, passar a porteira de madeira e seguir os totens até a base."
                placeholderTextColor="#64748B"
                value={approachTrail}
                onChangeText={setApproachTrail}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* 5. CADASTRAR PRIMEIRA VIA (OPCIONAL) */}
            <Text style={styles.sectionHeader}>5. CADASTRAR PRIMEIRA VIA (OPCIONAL)</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome da Via</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Linha dos Pioneiros"
                placeholderTextColor="#64748B"
                value={routeName}
                onChangeText={setRouteName}
              />
            </View>

            <View style={styles.rowTwoCols}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Grau Brasileiro</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 6º, 6º sup, 7a"
                  placeholderTextColor="#64748B"
                  value={routeGrade}
                  onChangeText={setRouteGrade}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Proteções (Costuras)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 7"
                  placeholderTextColor="#64748B"
                  value={boltsCount}
                  onChangeText={setBoltsCount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>Tipo de Proteção da Via</Text>
            <View style={styles.chipsRow}>
              {(['chapeleta', 'grampo', 'movel', 'mista'] as ProtectionCategory[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, protectionType === p && styles.chipActive]}
                  onPress={() => setProtectionType(p)}
                >
                  <Text style={[styles.chipText, protectionType === p && styles.chipTextActive]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Botão de Salvar */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.8}>
            <CheckCircle2 size={20} color="#0F172A" />
            <Text style={styles.submitBtnText}>REGISTRAR PEDRA NO GUIA OFFLINE</Text>
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
    maxHeight: '92%',
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
    paddingBottom: 12,
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
    marginBottom: 16,
  },
  sectionHeader: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 10,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  label: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
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
  gpsCaptureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#38BDF8',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  gpsCaptureBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chipsRowCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipMini: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextMini: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  toggleBtn: {
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
  toggleBtnActive: {
    backgroundColor: '#FFE600',
    borderColor: '#EAB308',
  },
  toggleBtnActiveBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderColor: '#38BDF8',
  },
  toggleBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  toggleBtnTextActiveBlue: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
