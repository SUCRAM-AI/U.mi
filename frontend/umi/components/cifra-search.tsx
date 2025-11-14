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
    console.log('🔘 Botão de busca clicado');
    console.log('📝 Artista:', artist);
    console.log('📝 Música:', song);
    
    if (!artist.trim() || !song.trim()) {
      console.log('⚠️ Campos vazios');
      Alert.alert('Atenção', 'Preencha o artista e o nome da música');
      return;
    }

    console.log('✅ Campos preenchidos, iniciando busca...');
    setLoading(true);
    try {
      console.log('📞 Chamando getCifra...');
      const result = await getCifra(artist.trim(), song.trim());
      console.log('📥 Resultado recebido:', result ? 'sucesso' : 'null', result?.error || 'sem erro');
      
      if (result && !result.error) {
        console.log('✅ Cifra encontrada, chamando onCifraFound');
        onCifraFound(result);
      } else {
        console.log('❌ Cifra não encontrada ou com erro');
        Alert.alert(
          'Não encontrado',
          'Não foi possível encontrar esta cifra. Verifique o nome do artista e da música.'
        );
      }
    } catch (error) {
      console.error('❌ Erro capturado no handleSearch:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao buscar a cifra');
    } finally {
      console.log('🏁 Finalizando busca');
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
          onPress={() => {
            console.log('🔘 TOUCH DETECTADO - onPress chamado');
            handleSearch();
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="search" size={20} color="#FFFFFF" />
              <Text style={styles.searchButtonText}>Buscar</Text>
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
