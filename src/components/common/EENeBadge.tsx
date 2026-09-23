// Componentes de Simbologia e Ícones Oficiais do Guia de Escalada (Padrão EENe)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  AlertTriangle,
  Sun,
  Moon,
  Hammer,
  HelpCircle,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react-native';
import { ProtectionCategory, SunExposureInfo } from '../../types/climbing';

interface ProtectionBadgeProps {
  type?: ProtectionCategory;
  isProject?: boolean;
}

export const ProtectionBadge: React.FC<ProtectionBadgeProps> = ({ type, isProject }) => {
  if (isProject) {
    return (
      <View style={[styles.badgeBase, styles.badgeYellow]}>
        <Hammer size={12} color="#000000" />
        <Text style={styles.badgeTextBlack}>PROJETO</Text>
      </View>
    );
  }

  if (!type) return null;

  switch (type) {
    case 'chapeleta':
      return (
        <View style={[styles.badgeBase, styles.badgeYellow]}>
          <Shield size={12} color="#000000" />
          <Text style={styles.badgeTextBlack}>CHAPELETA</Text>
        </View>
      );
    case 'grampo':
      return (
        <View style={[styles.badgeBase, styles.badgeYellow]}>
          <Layers size={12} color="#000000" />
          <Text style={styles.badgeTextBlack}>GRAMPO</Text>
        </View>
      );
    case 'movel':
      return (
        <View style={[styles.badgeBase, styles.badgeYellow]}>
          <Sparkles size={12} color="#000000" />
          <Text style={styles.badgeTextBlack}>MÓVEL</Text>
        </View>
      );
    case 'mista':
      return (
        <View style={[styles.badgeBase, styles.badgePurple]}>
          <Layers size={12} color="#FFFFFF" />
          <Text style={styles.badgeTextWhite}>MISTA</Text>
        </View>
      );
    case 'artificial':
      return (
        <View style={[styles.badgeBase, styles.badgeOrange]}>
          <Hammer size={12} color="#FFFFFF" />
          <Text style={styles.badgeTextWhite}>ARTIFICIAL</Text>
        </View>
      );
    default:
      return null;
  }
};

interface SunShadeCardProps {
  sunExposure?: SunExposureInfo;
}

export const SunShadeCard: React.FC<SunShadeCardProps> = ({ sunExposure }) => {
  if (!sunExposure) return null;

  return (
    <View style={styles.sunShadeContainer}>
      <View style={[styles.sunHalf, sunExposure.morning === 'sol' ? styles.bgSun : styles.bgShade]}>
        {sunExposure.morning === 'sol' ? (
          <Sun size={12} color="#000000" />
        ) : (
          <Moon size={12} color="#94A3B8" />
        )}
        <Text
          style={[
            styles.sunHalfText,
            sunExposure.morning === 'sol' ? styles.textDark : styles.textLight,
          ]}
        >
          MANHÃ: {sunExposure.morning.toUpperCase()}
        </Text>
      </View>

      <View style={[styles.sunHalf, sunExposure.afternoon === 'sol' ? styles.bgSun : styles.bgShade]}>
        {sunExposure.afternoon === 'sol' ? (
          <Sun size={12} color="#000000" />
        ) : (
          <Moon size={12} color="#94A3B8" />
        )}
        <Text
          style={[
            styles.sunHalfText,
            sunExposure.afternoon === 'sol' ? styles.textDark : styles.textLight,
          ]}
        >
          TARDE: {sunExposure.afternoon.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeYellow: {
    backgroundColor: '#FFE600',
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  badgePurple: {
    backgroundColor: '#8B5CF6',
  },
  badgeOrange: {
    backgroundColor: '#F97316',
  },
  badgeTextBlack: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  badgeTextWhite: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sunShadeContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sunHalf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bgSun: {
    backgroundColor: '#FFE600',
  },
  bgShade: {
    backgroundColor: '#0F172A',
  },
  sunHalfText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textDark: {
    color: '#000000',
  },
  textLight: {
    color: '#94A3B8',
  },
});
