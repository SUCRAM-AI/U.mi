/**
 * Componente de Card para conteúdo teórico
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TheoryCardProps {
  title: string;
  content: string | string[];
  image?: string;
  audioUri?: string;
  onPlayAudio?: () => void;
  isPlaying?: boolean;
  children?: React.ReactNode;
}

export function TheoryCard({
  title,
  content,
  image,
  audioUri,
  onPlayAudio,
  isPlaying,
  children,
}: TheoryCardProps) {
  const renderContent = () => {
    if (Array.isArray(content)) {
      return (
        <View style={styles.listContainer}>
          {content.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    }

    return <Text style={styles.contentText}>{content}</Text>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        )}

        {audioUri && onPlayAudio && (
          <TouchableOpacity
            style={styles.audioButton}
            onPress={onPlayAudio}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={32}
              color="#F97316"
            />
            <Text style={styles.audioButtonText}>
              {isPlaying ? 'Pausar Áudio' : 'Ouvir Áudio'}
            </Text>
          </TouchableOpacity>
        )}

        {renderContent()}

        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#F5F3FF',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#1F113C',
  },
  content: {
    maxHeight: 400,
  },
  contentText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '400',
    color: '#374151',
    lineHeight: 24,
  },
  imageContainer: {
    width: '100%',
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F97316',
    marginVertical: 16,
  },
  audioButtonText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#F97316',
  },
  listContainer: {
    gap: 12,
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '400',
    color: '#374151',
    lineHeight: 24,
  },
});
