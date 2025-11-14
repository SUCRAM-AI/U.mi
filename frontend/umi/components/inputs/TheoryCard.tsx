/**
 * Componente de Card para conteúdo teórico
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  lessonId?: string;
  section?: string;
}

const tablaturaImage = require('@assets/tablatura/tablatura.png');
const aranhaImage = require('@assets/acordes/aranha.png');
const emImage = require('@assets/acordes/MiMenor(Em).png');
const amImage = require('@assets/acordes/LáMenor(Am).png');
const eImage = require('@assets/acordes/Mi(E).png');
const simbolosImage = require('@assets/simbolos/simbolos.png');
const trastesImage = require('@assets/images/trastes.png');
const doMaiorImage = require('@assets/escalas/do_maior.png');

export function TheoryCard({
  title,
  content,
  image,
  audioUri,
  onPlayAudio,
  isPlaying,
  children,
  lessonId,
  section,
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

  const isSection3 = section === '3';
  const isLesson93 = lessonId === '9.3';

  return (
    <View style={[styles.container, (isSection3 || isLesson93) && styles.compactContainer]}>
      <View style={[styles.header, (isSection3 || isLesson93) && styles.compactHeader]}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={[styles.content, (isSection3 || isLesson93) && styles.compactContent]}>
        {/* Imagem tablatura.png para lesson 1.4 - aparece antes dos tópicos */}
        {lessonId === '1.4' && (
          <View style={styles.centeredImageContainer}>
            <Image source={tablaturaImage} style={styles.centeredImage} resizeMode="contain" />
          </View>
        )}

        {/* Imagem trastes.png para lesson 2.1 - aparece entre título e texto */}
        {lessonId === '2.1' && (
          <View style={styles.trastesImageContainer}>
            <Image source={trastesImage} style={styles.trastesImage} resizeMode="contain" />
          </View>
        )}

        {/* Imagem MiMenor(Em).png para lesson 3.2 - aparece entre título e texto */}
        {lessonId === '3.2' && (
          <View style={styles.centeredImageContainer}>
            <Image source={emImage} style={styles.centeredImage} resizeMode="contain" />
          </View>
        )}

        {/* Imagem LáMenor(Am).png para lesson 3.3 - aparece entre título e texto */}
        {lessonId === '3.3' && (
          <View style={styles.centeredImageContainer}>
            <Image source={amImage} style={styles.centeredImage} resizeMode="contain" />
          </View>
        )}

        {/* Imagens MiMenor(Em).png e LáMenor(Am).png lado a lado para lesson 3.4 */}
        {lessonId === '3.4' && (
          <View style={styles.sideBySideImageContainer}>
            <View style={styles.sideBySideImageWrapper}>
              <Image source={emImage} style={styles.sideBySideImage} resizeMode="contain" />
            </View>
            <View style={styles.sideBySideImageWrapper}>
              <Image source={amImage} style={styles.sideBySideImage} resizeMode="contain" />
            </View>
          </View>
        )}

        {/* Imagem Mi(E).png para lesson 4.2 - aparece entre título e texto */}
        {lessonId === '4.2' && (
          <View style={styles.centeredImageContainer}>
            <Image source={eImage} style={styles.centeredImage} resizeMode="contain" />
          </View>
        )}

        {/* Imagem simbolos.png para lesson 5.4 - aparece entre título e texto */}
        {lessonId === '5.4' && (
          <View style={styles.simbolosImageContainer}>
            <Image source={simbolosImage} style={styles.simbolosImage} resizeMode="contain" />
          </View>
        )}

        {/* Imagem do_maior.png para lesson 9.1 - aparece entre título e texto */}
        {lessonId === '9.1' && (
          <View style={styles.centeredImageContainer}>
            <Image source={doMaiorImage} style={styles.centeredImage} resizeMode="contain" />
          </View>
        )}

        {image && lessonId !== '1.4' && lessonId !== '2.1' && lessonId !== '3.2' && lessonId !== '3.3' && lessonId !== '3.4' && lessonId !== '4.2' && lessonId !== '5.4' && lessonId !== '9.1' && (
          <View style={[styles.imageContainer, isLesson93 && styles.compactImageContainer]}>
            <Image source={{ uri: image }} style={[styles.image, isLesson93 && styles.compactImage]} />
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
      </View>
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
  compactContainer: {
    padding: 8,
    paddingTop: 8,
    paddingBottom: 8,
    marginVertical: 4,
  },
  header: {
    marginBottom: 0,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#F5F3FF',
  },
  compactHeader: {
    paddingBottom: 2,
    marginBottom: 0,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#1F113C',
  },
  content: {
    paddingTop: 4,
  },
  compactContent: {
    paddingTop: 2,
  },
  contentText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '400',
    color: '#374151',
    lineHeight: 24,
    marginTop: 0,
    paddingTop: 0,
  },
  imageContainer: {
    width: '100%',
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 1,
    resizeMode: 'contain',
  },
  compactImageContainer: {
    marginVertical: 1,
  },
  compactImage: {
    height: 1,
  },
  centeredImageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  centeredImage: {
    width: '100%',
    maxWidth: '100%',
    height: 320,
    borderRadius: 16,
  },
  simbolosImageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  simbolosImage: {
    width: '80%',
    maxWidth: 300,
    height: 240,
    borderRadius: 16,
  },
  trastesImageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trastesImage: {
    width: '75%',
    maxWidth: 280,
    height: 240,
    borderRadius: 16,
  },
  sideBySideImageContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    marginTop: 4,
  },
  sideBySideImageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '48%',
  },
  sideBySideImage: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 200,
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
