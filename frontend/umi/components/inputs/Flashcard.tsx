/**
 * Componente de Flashcard para teoria e memorização
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FlashcardProps {
  front: string;
  back: string;
  frontImage?: string;
  backImage?: string;
  onFlip?: () => void;
}

export function Flashcard({
  front,
  back,
  frontImage,
  backImage,
  onFlip,
}: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const flipAnimation = useState(new Animated.Value(0))[0];

  const handleFlip = () => {
    const toValue = flipped ? 0 : 1;
    
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    setFlipped(!flipped);
    onFlip?.();
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={handleFlip}
        activeOpacity={0.9}
      >
        {/* Front */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            {
              opacity: frontOpacity,
              transform: [{ rotateY: frontInterpolate }],
            },
          ]}
        >
          <View style={styles.cardContent}>
            {frontImage ? (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageText}>Imagem</Text>
              </View>
            ) : (
              <Text style={styles.cardText}>{front}</Text>
            )}
          </View>
          <View style={styles.flipHint}>
            <Ionicons name="flip-outline" size={20} color="#6B7280" />
            <Text style={styles.flipHintText}>Toque para virar</Text>
          </View>
        </Animated.View>

        {/* Back */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              opacity: backOpacity,
              transform: [{ rotateY: backInterpolate }],
            },
          ]}
        >
          <View style={styles.cardContent}>
            {backImage ? (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageText}>Imagem</Text>
              </View>
            ) : (
              <Text style={styles.cardText}>{back}</Text>
            )}
          </View>
          <View style={styles.flipHint}>
            <Ionicons name="flip-outline" size={20} color="#6B7280" />
            <Text style={styles.flipHintText}>Toque para virar</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  cardContainer: {
    width: width - 64,
    height: 300,
    perspective: 1000,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cardBack: {
    backgroundColor: '#F5F3FF',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 24,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#1F113C',
    textAlign: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    color: '#9CA3AF',
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  flipHintText: {
    fontSize: 14,
    fontFamily: 'Lexend',
    color: '#6B7280',
  },
});
