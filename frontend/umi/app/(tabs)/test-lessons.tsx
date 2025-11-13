/**
 * Tela de teste para acessar todas as lições
 * Use esta tela para verificar se todas as lições estão funcionando
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAllLessons } from '@config/lessons';

export default function TestLessons() {
  const router = useRouter();
  const allLessons = getAllLessons();

  // Agrupar lições por seção
  const lessonsBySection: Record<string, any[]> = {};
  allLessons.forEach((lesson: any) => {
    const section = lesson.section || '0';
    if (!lessonsBySection[section]) {
      lessonsBySection[section] = [];
    }
    lessonsBySection[section].push(lesson);
  });

  // Ordenar seções
  const sections = Object.keys(lessonsBySection).sort((a, b) => 
    parseInt(a) - parseInt(b)
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Teste de Lições</Text>
        <Text style={styles.subtitle}>
          {allLessons.length} lições disponíveis
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {sections.map((section) => (
          <View key={section} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              📚 Seção {section}
            </Text>
            
            {lessonsBySection[section]
              .sort((a, b) => {
                // Ordenar por unit
                const unitA = parseInt(a.unit || '0');
                const unitB = parseInt(b.unit || '0');
                return unitA - unitB;
              })
              .map((lesson: any) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonButton}
                  onPress={() => router.push(`/lesson/${lesson.id}`)}
                >
                  <View style={styles.lessonButtonContent}>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonId}>{lesson.id}</Text>
                      <Text style={styles.lessonTitle} numberOfLines={1}>
                        {lesson.title || 'Sem título'}
                      </Text>
                    </View>
                    <View style={styles.lessonMeta}>
                      <Text style={styles.lessonType}>{lesson.type || 'N/A'}</Text>
                      <Text style={styles.arrow}>→</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        ))}

        {/* Botão para voltar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/trilha')}
        >
          <Text style={styles.backButtonText}>← Voltar para Trilha</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfaff',
  },
  header: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#1F113C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Lexend',
    color: '#6B7280',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 12,
    paddingLeft: 4,
  },
  lessonButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  lessonButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  lessonInfo: {
    flex: 1,
    marginRight: 12,
  },
  lessonId: {
    fontSize: 12,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 16,
    fontFamily: 'Lexend-SemiBold',
    fontWeight: '600',
    color: '#1F113C',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonType: {
    fontSize: 12,
    fontFamily: 'Lexend',
    color: '#6B7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  arrow: {
    fontSize: 18,
    color: '#7C3AED',
  },
  backButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#ffffff',
  },
});

