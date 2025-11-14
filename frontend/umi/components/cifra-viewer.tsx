/**
 * Visualizador de cifra estilo Cifra Club
 * Mantém padrões de cores do app
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CifraClubResponse } from '@services/api';

interface CifraViewerProps {
  cifra: CifraClubResponse;
  onClose?: () => void;
}

export function CifraViewer({ cifra, onClose }: CifraViewerProps) {
  const [fontSize, setFontSize] = useState(16);

  // Extrair acordes únicos da cifra
  const uniqueChords = useMemo(() => {
    const chords = new Set<string>();
    cifra.cifra.forEach((line) => {
      // Regex para encontrar acordes (ex: Dm7, Bb9, F, F2, C#m7, etc.)
      const matches = line.match(/\b[A-G][#b]?(m|M|dim|aug|sus|add|maj|min)?\d*[#b]?\d*\b/g);
      if (matches) {
        matches.forEach((chord) => {
          const cleanChord = chord.trim();
          if (cleanChord.length > 0 && cleanChord.length < 10) {
            chords.add(cleanChord);
          }
        });
      }
    });
    return Array.from(chords).sort();
  }, [cifra.cifra]);

  // Extrair afinação (primeira linha que contém "Afinação:")
  const tuning = useMemo(() => {
    const tuningLine = cifra.cifra.find((line) => line.includes('Afinação:'));
    return tuningLine || null;
  }, [cifra.cifra]);

  // Renderizar linha da cifra
  const renderCifraLine = (line: string, index: number) => {
    if (!line.trim()) {
      return <View key={index} style={styles.emptyLine} />;
    }

    // Verificar se é um título de seção (ex: [Refrão])
    if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
      return (
        <View key={index} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{line.trim()}</Text>
        </View>
      );
    }

    // Verificar se é tablatura (contém "|" e números)
    if (line.includes('|') && /\d/.test(line)) {
      return (
        <Text key={index} style={[styles.tabLine, { fontSize }]}>
          {line}
        </Text>
      );
    }

    // Verificar se contém acordes
    const chordRegex = /\b([A-G][#b]?(m|M|dim|aug|sus|add|maj|min)?\d*[#b]?\d*)\b/g;
    const parts: Array<{ text: string; isChord: boolean }> = [];
    let lastIndex = 0;
    let match;

    while ((match = chordRegex.exec(line)) !== null) {
      // Texto antes do acorde
      if (match.index > lastIndex) {
        parts.push({
          text: line.substring(lastIndex, match.index),
          isChord: false,
        });
      }
      // Acorde
      parts.push({
        text: match[1],
        isChord: true,
      });
      lastIndex = match.index + match[0].length;
    }

    // Texto restante
    if (lastIndex < line.length) {
      parts.push({
        text: line.substring(lastIndex),
        isChord: false,
      });
    }

    // Se não encontrou acordes, renderizar linha normal
    if (parts.length === 0) {
      parts.push({ text: line, isChord: false });
    }

    return (
      <View key={index} style={styles.cifraLine}>
        {parts.map((part, partIndex) => (
          <Text
            key={partIndex}
            style={[
              part.isChord ? styles.chord : styles.lyric,
              { fontSize },
            ]}
          >
            {part.text}
          </Text>
        ))}
      </View>
    );
  };

  const handleOpenYouTube = async () => {
    if (cifra.youtube_url) {
      const canOpen = await Linking.canOpenURL(cifra.youtube_url);
      if (canOpen) {
        await Linking.openURL(cifra.youtube_url);
      }
    }
  };

  const handleOpenCifraClub = async () => {
    if (cifra.cifraclub_url) {
      const canOpen = await Linking.canOpenURL(cifra.cifraclub_url);
      if (canOpen) {
        await Linking.openURL(cifra.cifraclub_url);
      }
    }
  };

  const increaseFont = () => {
    if (fontSize < 20) setFontSize(fontSize + 1);
  };

  const decreaseFont = () => {
    if (fontSize > 12) setFontSize(fontSize - 1);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#1F113C" />
          </TouchableOpacity>
        )}
        <View style={styles.headerTextContainer}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {cifra.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {cifra.artist}
          </Text>
        </View>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleOpenYouTube}
          >
            <Ionicons name="logo-youtube" size={20} color="#FF0000" />
            <Text style={styles.toolbarButtonText}>YouTube</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleOpenCifraClub}
          >
            <Ionicons name="open-outline" size={20} color="#7C3AED" />
            <Text style={styles.toolbarButtonText}>Cifra Club</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.fontControls}>
          <TouchableOpacity
            style={styles.fontButton}
            onPress={decreaseFont}
            disabled={fontSize <= 12}
          >
            <Ionicons name="remove" size={18} color={fontSize <= 12 ? '#9CA3AF' : '#7C3AED'} />
          </TouchableOpacity>
          <Text style={styles.fontSizeText}>{fontSize}</Text>
          <TouchableOpacity
            style={styles.fontButton}
            onPress={increaseFont}
            disabled={fontSize >= 20}
          >
            <Ionicons name="add" size={18} color={fontSize >= 20 ? '#9CA3AF' : '#7C3AED'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Afinação */}
      {tuning && (
        <View style={styles.tuningContainer}>
          <Ionicons name="tune" size={18} color="#F97316" />
          <Text style={styles.tuningText}>{tuning}</Text>
        </View>
      )}

      {/* Acordes únicos */}
      {uniqueChords.length > 0 && (
        <View style={styles.chordsContainer}>
          <Text style={styles.chordsTitle}>Acordes desta música:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chordsList}
          >
            {uniqueChords.map((chord, index) => (
              <View key={index} style={styles.chordBadge}>
                <Text style={styles.chordBadgeText}>{chord}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Cifra */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {cifra.cifra.map((line, index) => renderCifraLine(line, index))}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F3FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  songTitle: {
    fontSize: 22,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#1F113C',
  },
  artistName: {
    fontSize: 16,
    fontFamily: 'Lexend',
    color: '#6B7280',
    marginTop: 4,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  toolbarLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toolbarButtonText: {
    fontSize: 12,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#1F113C',
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fontButton: {
    padding: 4,
  },
  fontSizeText: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#1F113C',
    minWidth: 24,
    textAlign: 'center',
  },
  tuningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#FFF7ED',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tuningText: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#F97316',
    flex: 1,
  },
  chordsContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  chordsTitle: {
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#1F113C',
    marginBottom: 12,
  },
  chordsList: {
    gap: 8,
  },
  chordBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    marginRight: 8,
  },
  chordBadgeText: {
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyLine: {
    height: 8,
  },
  sectionContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#7C3AED',
    textAlign: 'center',
  },
  cifraLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
    lineHeight: 28,
  },
  chord: {
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#7C3AED',
    marginRight: 4,
    lineHeight: 28,
  },
  lyric: {
    fontSize: 16,
    fontFamily: 'Lexend',
    color: '#1F113C',
    lineHeight: 28,
  },
  tabLine: {
    fontFamily: 'monospace',
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
  },
});

