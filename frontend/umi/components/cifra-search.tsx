/**
 * Componente de busca de músicas do Cifra Club
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCifra, CifraClubResponse } from '@services/api';

interface CifraSearchProps {
  onCifraFound: (cifra: CifraClubResponse) => void;
}

export function CifraSearch({ onCifraFound }: CifraSearchProps) {
  const [artist, setArtist] = useState('');
  const [song, setSong] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('�� CifraSearch renderizado');
  console.log('�� Props:', { onCifraFound: !!onCifraFound });

  const handleSearch = async () => {
    if (!artist.trim() || !song.trim()) {
      Alert.alert('Atenção', 'Preencha o artista e o nome da música');
      return;
    }

    setLoading(true);
    try {
      const result = await getCifra(artist.trim(), song.trim());
      
      if (result && !result.error && result.cifra && result.cifra.length > 0) {
        onCifraFound(result);
      } else {
        Alert.alert('Erro', result?.error || 'Não foi possível encontrar esta cifra');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao buscar a cifra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar Cifra</Text>
      <Text style={styles.subtitle}>
        Encontre cifras do Cifra Club e pratique tocando junto!
      </Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="musical-notes" size={20} color="#7C3AED" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Artista (ex: Coldplay)"
            placeholderTextColor="#9CA3AF"
            value={artist}
            onChangeText={setArtist}
            autoCapitalize="words"
            editable={!loading}
            returnKeyType="next"
            onSubmitEditing={() => {
              // Focar no próximo campo ou buscar se ambos estiverem preenchidos
              if (song.trim()) {
                handleSearch();
              }
            }}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="musical-note" size={20} color="#7C3AED" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Música (ex: The Scientist)"
            placeholderTextColor="#9CA3AF"
            value={song}
            onChangeText={setSong}
            autoCapitalize="words"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="search" size={20} color="#FFFFFF" />
              <Text style={styles.searchButtonText} pointerEvents="none">Buscar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#1F113C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Lexend',
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Lexend',
    color: '#1F113C',
    paddingVertical: 14,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
