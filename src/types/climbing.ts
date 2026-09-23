// Definições de Tipos — App de Escalada & Guia Digital Interativo

export type RockType = 'calcario' | 'granito' | 'arenito' | 'quartzito' | 'basalto';

export type CompassOrientation = 'N' | 'NE' | 'L' | 'SE' | 'S' | 'SO' | 'O' | 'NO';

export type RouteStyle = 'esportiva' | 'tradicional' | 'mista' | 'boulder';

export type DangerRating = 'E1' | 'E2' | 'E3' | 'E4' | 'E5';

export type AnchorType = 
  | 'dupla_com_anel' 
  | 'corrente' 
  | 'mosquetao_aco' 
  | 'parada_natural' 
  | 'chapeleta_simples';

export type AscentStyle = 
  | 'onsight'     // À vista sem beta prévio
  | 'flash'       // Cadena de primeira com informações prévias
  | 'redpoint'    // Cadena após tentativas / trabalhada
  | 'repeat'      // Repetição de via já encadenada
  | 'project'     // Projeto em andamento / tentativa
  | 'top_rope';   // Escalada em top-rope

export interface GradeSystem {
  brazilian: string; // Ex: "6º sup", "7a", "8b"
  french: string;    // Ex: "6b", "6c+", "7b"
  yds: string;       // Ex: "5.10d", "5.11b"
  danger?: DangerRating; // Exposição (E1 a E5)
}

// Geometria 2D normalizada (0.0 a 1.0) sobre o croqui/foto
export interface Point2D {
  x: number;
  y: number;
}

export interface Bolt2D {
  x: number;
  y: number;
  index: number;
}

export interface RouteGeometry2D {
  routeId: string;
  pathPoints: Point2D[]; // Pontos que formam o traçado (curva Bézier ou polilinha)
  bolts: Bolt2D[];       // Posições das chapeletas
  anchor: Point2D;       // Posição da parada/corrente
  startPoint: Point2D;   // Base da via
  color?: string;        // Cor de destaque da linha
}

// Geometria 3D no espaço local da malha da rocha (em metros)
export type Vector3Tuple = [number, number, number];

export interface Bolt3D {
  position: Vector3Tuple;
  index: number;
}

export interface RouteGeometry3D {
  routeId: string;
  pathPoints3D: Vector3Tuple[]; // Sequência de vértices 3D acompanhando a face da rocha
  bolts3D: Bolt3D[];            // Posição 3D de cada chapeleta
  anchor3D: Vector3Tuple;       // Posição 3D da parada
  startPoint3D: Vector3Tuple;   // Base 3D da via
  color?: string;
  tubeRadius?: number;          // Espessura do traçado 3D
}

// Informações da Primeira Ascensão e Abridores
export interface FirstAscentInfo {
  climbers?: string[];
  year?: number;
  notes?: string;
}

export interface BoltersInfo {
  names: string[];
  year?: number;
  hardwareNotes?: string; // Ex: "Grampos de titânio 1/2 colados com resina epóxi"
}

export type ProtectionCategory = 
  | 'chapeleta' 
  | 'grampo' 
  | 'movel' 
  | 'mista' 
  | 'artificial'
  | 'crashpad';

export interface SunExposureInfo {
  morning: 'sol' | 'sombra';
  afternoon: 'sol' | 'sombra';
}

// Entidade Via de Escalada
export interface Route {
  id: string;
  wallId: string;
  orderIndex: number; // Ordem da esquerda para a direita na parede (1, 2, 3...)
  name: string;
  grade: GradeSystem;
  heightMeters: number;
  pitchesCount: number; // Quantidade de enfiadas
  boltsCount: number;   // Quantidade de costuras necessárias
  protectionType?: ProtectionCategory; // Grampo, Chapeleta, Móvel, Mista, Artificial
  isProject?: boolean;  // Via em projeto / ainda não encadenada
  rackRequired?: string; // Ex: "1 jogo de friends e 1 jogo de nuts, Camalots #.3 ao #3"
  anchorType: AnchorType;
  style: RouteStyle;
  firstAscent?: FirstAscentInfo;
  bolters?: BoltersInfo;
  description: string;
  safetyWarnings?: string;
  curiosities?: string; // Curiosidades históricas
  geometry2D?: RouteGeometry2D;
  geometry3D?: RouteGeometry3D;
}

// Modelo 3D da Parede
export interface Wall3DModel {
  id: string;
  wallId: string;
  glbUrl?: string; // URL do modelo GLTF/GLB fotogramétrico
  isProceduralMesh?: boolean; // Se utiliza malha procedural de alta fidelidade
  dimensionsMeters: {
    width: number;
    height: number;
    depth: number;
  };
  cameraPresets: {
    initialPosition: Vector3Tuple;
    target: Vector3Tuple;
    minDistance: number;
    maxDistance: number;
  };
  meshPolyCount?: number;
  photogrammetrySource?: {
    photoCount: number;
    resolution: string;
    dateCaptured?: string;
  };
}

// Croqui / Foto 2D Interativa
export interface Topo2D {
  id: string;
  wallId: string;
  imageUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  photographer?: string;
}

export interface WallPhoto {
  id: string;
  url: string;
  caption?: string;
  photographer?: string;
  isMain?: boolean;
}

export type VisualRepresentationTier = '3d' | 'interactive_2d' | 'photo';

// Entidade Central: Parede
export interface Wall {
  id: string;
  sectorId: string;
  name: string;
  orientation: CompassOrientation;
  sunShadeNotes: string; // Ex: "Sol pela manhã até as 12h, sombra à tarde toda"
  sunExposure?: SunExposureInfo; // Ícone de Sol Manhã / Tarde Sombra clássico do EENe
  heightMeters: number;
  rockType: RockType;
  approachNotes: string; // Ex: "10 metros à direita da trilha principal"
  history?: string;      // História da conquista da parede
  model3D?: Wall3DModel;
  activeTopo2D?: Topo2D;
  fallbackPhotoUrl: string;
  photos: WallPhoto[];
  routes: Route[];
}

// Entidade Setor / Falésia
export interface Sector {
  id: string;
  name: string;
  cragName: string; // Ex: "Serra do Cipó", "Pedra do Baú"
  region: string;
  city: string;
  state: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  elevationMeters: number;
  approachTimeMinutes: number;
  approachTrailDescription: string;
  accessStatus: 'aberto' | 'restrito' | 'fechado';
  accessNotes?: string;
  parkingCoordinates?: {
    latitude: number;
    longitude: number;
  };
  history?: string;
  rules?: string[];
  walls: Wall[];
}

// Registro no Diário de Cadena do Usuário
export interface AscentLog {
  id: string;
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
}

// Entidade Polo / Destino de Escalada (Cidade / Região)
export interface ClimbingDestination {
  id: string;
  name: string; // Ex: "Algodão de Jandaíra", "Campina Grande", "Sousa"
  state: string; // Ex: "PB", "RN", "PE", "CE", "MG"
  regionName: string; // Ex: "Curimataú Ocidental", "Agreste Paraibano", "Alto Sertão"
  coverImage: string;
  description: string;
  rockType: string;
  totalRoutes: number;
  totalSectors: number;
  has3D: boolean;
  hasTrad: boolean;
  hasSport: boolean;
  hasBoulder: boolean;
  distanceFromCapital?: string;
  highlights: string[];
  sectors: Sector[];
}

// Perfil do Escalador da Comunidade
export interface UserProfile {
  id: string;
  name: string;
  username: string; // Ex: "arthur_climb"
  email: string;
  city: string;
  state: string;
  avatarUrl: string;
  bio: string;
  hardestGrade: string; // Ex: "8a"
  memberSince: string;
  totalAscentsCount?: number;
  totalPhotosCount?: number;
}

// Foto Colaborativa da Comunidade (Postada em uma via ou falésia)
export interface CommunityPhoto {
  id: string;
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
  date: string;
  likesCount: number;
}

// Dica / Beta Compartilhado pela Comunidade
export interface CommunityBeta {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  routeId: string;
  text: string;
  date: string;
}
