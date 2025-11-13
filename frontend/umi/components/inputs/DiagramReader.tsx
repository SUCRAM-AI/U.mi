/**
 * Componente para leitura de diagramas de acordes
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DiagramReaderProps {
  diagram: {
    image?: string;
    chordName: string;
    frets: number[];
    strings: number[];
    fingerPositions?: { fret: number; string: number; finger: number }[];
  };
  onComplete?: () => void;
  title?: string;
  showLabels?: boolean;
}

export function DiagramReader({
  diagram,
  onComplete,
  title,
  showLabels = true,
}: DiagramReaderProps) {
  const [selectedFret, setSelectedFret] = useState<number | null>(null);
  const [selectedString, setSelectedString] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  const strings = 6; // Violão tem 6 cordas
  const frets = 5; // Mostrar 5 trastes

  const handleFretPress = (fret: number, string: number) => {
    if (completed) return;

    setSelectedFret(fret);
    setSelectedString(string);

    // Verificar se está correto
    const isCorrect = diagram.frets.includes(fret) && 
                      diagram.strings.includes(string);

    if (isCorrect && onComplete) {
      setCompleted(true);
      onComplete();
    }
  };

  const renderFretboard = () => {
    return (
      <View style={styles.fretboardContainer}>
        {/* Chord Name */}
        <Text style={styles.chordName}>{diagram.chordName}</Text>

        {/* Nut */}
        <View style={styles.nut} />

        {/* Strings */}
        {Array.from({ length: strings }, (_, stringIndex) => (
          <View key={stringIndex} style={styles.stringContainer}>
            <View style={styles.stringLine} />
            {Array.from({ length: frets }, (_, fretIndex) => {
              const fret = fretIndex + 1;
              const isSelected = selectedFret === fret && 
                                 selectedString === stringIndex;
              const isMarked = diagram.frets.includes(fret) && 
                               diagram.strings.includes(stringIndex);
              const fingerPos = diagram.fingerPositions?.find(
                (p) => p.fret === fret && p.string === stringIndex
              );

              return (
                <TouchableOpacity
                  key={fretIndex}
                  style={[
                    styles.fret,
                    isMarked && styles.fretMarked,
                    isSelected && styles.fretSelected,
                  ]}
                  onPress={() => handleFretPress(fret, stringIndex)}
                  disabled={completed}
                >
                  {fingerPos && (
                    <View style={styles.fingerIndicator}>
                      <Text style={styles.fingerText}>{fingerPos.finger}</Text>
                    </View>
                  )}
                  {isMarked && !fingerPos && (
                    <View style={styles.dot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Fret Numbers */}
        {showLabels && (
          <View style={styles.fretNumbers}>
            {Array.from({ length: frets }, (_, i) => (
              <Text key={i} style={styles.fretNumber}>
                {i + 1}
              </Text>
            ))}
          </View>
        )}

        {/* String Labels */}
        {showLabels && (
          <View style={styles.stringLabels}>
            {['E', 'A', 'D', 'G', 'B', 'E'].map((note, index) => (
              <Text key={index} style={styles.stringLabel}>
                {note}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      {diagram.image ? (
        <Image source={{ uri: diagram.image }} style={styles.diagramImage} />
      ) : (
        renderFretboard()
      )}

      {completed && (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
          <Text style={styles.successText}>Correto!</Text>
        </View>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#1F113C',
  },
  fretboardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  chordName: {
    fontSize: 24,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 20,
  },
  nut: {
    height: 4,
    backgroundColor: '#1F113C',
    marginBottom: 20,
    borderRadius: 2,
  },
  stringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    position: 'relative',
  },
  stringLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#D1D5DB',
    top: '50%',
  },
  fret: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 2,
    borderRightColor: '#9CA3AF',
  },
  fretMarked: {
    backgroundColor: '#F5F3FF',
  },
  fretSelected: {
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#F97316',
    borderRadius: 8,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
  },
  fingerIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '700',
  },
  fretNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  fretNumber: {
    fontSize: 12,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
    textAlign: 'center',
  },
  stringLabels: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    position: 'absolute',
    left: -30,
    top: 50,
    height: 240,
    justifyContent: 'space-around',
  },
  stringLabel: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#6B7280',
  },
  diagramImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    borderRadius: 16,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    gap: 8,
  },
  successText: {
    fontSize: 18,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#22C55E',
  },
});
