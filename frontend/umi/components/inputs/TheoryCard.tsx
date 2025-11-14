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

// Importar SVGs como componentes
import DiagramaAcordeSVG from '@assets/images/diagrama_acorde.svg';

// Mapeamento de imagens PNG de assets (apenas imagens que existem)
// Para adicionar novas imagens, adicione aqui e certifique-se de que o arquivo existe em assets/images/
const assetImages: Record<string, any> = {
  'assets/images/acorde_em.png': require('@assets/images/acorde_em.png'),
  'assets/images/acorde_am.png': require('@assets/images/acorde_am.png'),
  'assets/images/acorde_e.png': require('@assets/images/acorde_e.png'),
  'assets/images/acordes.png': require('@assets/images/acordes.png'),
  // Adicione outras imagens conforme forem criadas
};

// Mapeamento de SVGs (importados como componentes)
const assetSVGs: Record<string, React.ComponentType<any>> = {
  'assets/images/diagrama_acorde.svg': DiagramaAcordeSVG,
  // Adicione outros SVGs conforme forem criados
};

interface TheoryCardProps {
  title: string;
  content: string | string[] | Array<string | { text: string; image?: string }>;
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
          {content.map((item, index) => {
            // Suporta tanto string quanto objeto com text e image
            const itemText = typeof item === 'string' ? item : (item && typeof item === 'object' && 'text' in item ? item.text : String(item));
            const itemImage = typeof item === 'object' && item !== null && 'image' in item ? item.image : undefined;
            
            return (
              <View key={index} style={styles.listItemContainer}>
                <View style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
                  <Text style={styles.listItemText}>{itemText}</Text>
                </View>
                {itemImage && (
                  <View style={styles.listItemImageContainer}>
                    {assetSVGs[itemImage] ? (
                      <View style={styles.listItemSvgContainer}>
                        {(() => {
                          const SVGComponent = assetSVGs[itemImage];
                          return <SVGComponent width="100%" height="200" />;
                        })()}
                      </View>
                    ) : assetImages[itemImage] ? (
                      <Image 
                        source={assetImages[itemImage]} 
                        style={styles.listItemImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.listItemImagePlaceholder}>
                        <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
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

      <View style={styles.content}>
        {image && (
          <View style={styles.imageContainer}>
            {assetSVGs[image] ? (
              // Renderizar SVG como componente
              <View style={styles.svgContainer}>
                {(() => {
                  const SVGComponent = assetSVGs[image];
                  return <SVGComponent width="100%" height="350" />;
                })()}
              </View>
            ) : assetImages[image] ? (
              // Renderizar PNG como Image
              <Image 
                source={assetImages[image]} 
                style={styles.image}
                resizeMode="contain"
                onError={(error) => {
                  console.warn('Erro ao carregar imagem:', image, error);
                }}
              />
            ) : (
              // Placeholder para imagens não encontradas
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                <Text style={styles.imagePlaceholderText}>
                  Imagem não encontrada
                </Text>
                <Text style={styles.imagePlaceholderSubtext}>
                  {image}
                </Text>
              </View>
            )}
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
    flexWrap: 'wrap',
  },
  content: {
    width: '100%',
  },
  contentText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '400',
    color: '#374151',
    lineHeight: 24,
    flexWrap: 'wrap',
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
  svgContainer: {
    width: '100%',
    minHeight: 350,
    justifyContent: 'center',
    alignItems: 'center',
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
  listItemContainer: {
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '400',
    color: '#374151',
    lineHeight: 24,
    flexWrap: 'wrap',
  },
  listItemImageContainer: {
    width: '100%',
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  listItemSvgContainer: {
    width: '100%',
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#6B7280',
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    fontFamily: 'Lexend',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
