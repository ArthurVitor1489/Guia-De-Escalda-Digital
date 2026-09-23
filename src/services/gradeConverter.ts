// Conversor de Graduações de Escalada (Sistema Brasileiro, Francês e YDS)
import { DangerRating, Route } from '../types/climbing';

export interface GradeMapping {
  score: number;       // Valor numérico linear para ordenação e comparação
  brazilian: string;   // Escala Brasileira
  french: string;      // Escala Francesa
  yds: string;         // Escala Americana (Yosemite Decimal System)
  color: string;       // Cor de destaque visual para o grau
}

export const GRADE_TABLE: GradeMapping[] = [
  { score: 10, brazilian: '3º', french: '4a', yds: '5.5', color: '#10B981' },
  { score: 20, brazilian: '4º', french: '4c', yds: '5.6', color: '#10B981' },
  { score: 30, brazilian: '4º sup', french: '5a', yds: '5.7', color: '#10B981' },
  { score: 40, brazilian: '5º', french: '5b', yds: '5.8', color: '#3B82F6' },
  { score: 50, brazilian: '5º sup', french: '5c', yds: '5.9', color: '#3B82F6' },
  { score: 60, brazilian: '6º', french: '6a', yds: '5.10a', color: '#3B82F6' },
  { score: 70, brazilian: '6º sup', french: '6a+', yds: '5.10b', color: '#8B5CF6' },
  { score: 80, brazilian: '7a', french: '6b', yds: '5.10c', color: '#8B5CF6' },
  { score: 90, brazilian: '7b', french: '6b+', yds: '5.10d', color: '#8B5CF6' },
  { score: 100, brazilian: '7c', french: '6c', yds: '5.11a', color: '#EC4899' },
  { score: 110, brazilian: '8a', french: '6c+', yds: '5.11b', color: '#EC4899' },
  { score: 120, brazilian: '8b', french: '7a', yds: '5.11c', color: '#F59E0B' },
  { score: 130, brazilian: '8c', french: '7a+', yds: '5.11d', color: '#F59E0B' },
  { score: 140, brazilian: '9a', french: '7b', yds: '5.12a', color: '#EF4444' },
  { score: 150, brazilian: '9b', french: '7b+', yds: '5.12b', color: '#EF4444' },
  { score: 160, brazilian: '9c', french: '7c', yds: '5.12c', color: '#EF4444' },
  { score: 170, brazilian: '10a', french: '7c+', yds: '5.12d', color: '#DC2626' },
  { score: 180, brazilian: '10b', french: '8a', yds: '5.13a', color: '#DC2626' },
  { score: 190, brazilian: '10c', french: '8a+', yds: '5.13b', color: '#B91C1C' },
  { score: 200, brazilian: '11a', french: '8b', yds: '5.13c', color: '#991B1B' },
  { score: 210, brazilian: '11b', french: '8b+', yds: '5.13d', color: '#7F1D1D' },
  { score: 220, brazilian: '11c', french: '8c', yds: '5.14a', color: '#581C87' },
  { score: 230, brazilian: '12a', french: '8c+', yds: '5.14b', color: '#3B0764' },
];

export const DANGER_EXPLANATIONS: Record<DangerRating, { title: string; description: string; badgeColor: string }> = {
  E1: {
    title: 'E1 — Bem Protegida',
    description: 'Chapeletas próximas ou fendas perfeitas. Quedas curtas e limpas sem perigo de choque.',
    badgeColor: '#10B981',
  },
  E2: {
    title: 'E2 — Queda Segura mas Longa',
    description: 'Proteções bem posicionadas, porém com distanciamento moderado. Queda livre no vazio sem obstáculo.',
    badgeColor: '#3B82F6',
  },
  E3: {
    title: 'E3 — Perigosa',
    description: 'Proteções espaçadas. Possibilidade de choque em platôs ou quinas de pedra em caso de queda.',
    badgeColor: '#F59E0B',
  },
  E4: {
    title: 'E4 — Muito Perigosa',
    description: 'Proteções duvidosas ou longos estirões desprotegidos. Alto risco de fratura grave ou queda ao chão.',
    badgeColor: '#EF4444',
  },
  E5: {
    title: 'E5 — Risco de Morte',
    description: 'Proteções simbólicas ou inexistentes. Uma queda é potencialmente fatal.',
    badgeColor: '#7F1D1D',
  },
};

/**
 * Retorna a graduação formatada de acordo com o sistema preferido (padrão Brasileiro)
 */
export function formatRouteGrade(route: Route, preferred: 'brazilian' | 'french' | 'yds' = 'brazilian'): string {
  let mainGrade = route.grade.brazilian;
  if (preferred === 'french') mainGrade = route.grade.french;
  if (preferred === 'yds') mainGrade = route.grade.yds;

  if (route.grade.danger) {
    return `${mainGrade} ${route.grade.danger}`;
  }
  return mainGrade;
}

/**
 * Retorna a cor correspondente à dificuldade da via (à prova de falhas)
 */
export function getGradeBadgeColor(gradeStr?: string | null): string {
  if (!gradeStr || typeof gradeStr !== 'string') return '#6B7280';
  const cleanGrade = gradeStr.trim().toLowerCase();
  const match = GRADE_TABLE.find(
    g => (g.brazilian && g.brazilian.toLowerCase() === cleanGrade) ||
         (g.french && g.french.toLowerCase() === cleanGrade) ||
         (g.yds && g.yds.toLowerCase() === cleanGrade)
  );
  return match ? match.color : '#6B7280';
}
