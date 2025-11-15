/**
 * Página de seção que lista todas as lições de uma seção específica
 * Exemplo: /sections/1, /sections/2, etc.
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getLessonsBySection } from '@config/lessons';

const sectionTitles: Record<string, string> = {
  '1': 'Fundamentos Físicos',
  '2': 'Base Harmônica',
  '3': 'O Motor Rítmico',
  '4': 'Gigantes do PoP',
  '5': 'Consolidar',
};

export default function SectionScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const sectionId = params.sectionId as string;

  const lessons = getLessonsBySection(sectionId);
  const sectionTitle = sectionTitles[sectionId] || `Seção ${sectionId}`;

  const handleLessonPress = (lessonId: string) => {
    router.push(`/lesson/${lessonId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F113C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sectionTitle}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.lessonsContainer}>
          {lessons.map((lesson: any) => (
            <TouchableOpacity
              key={lesson.id}
              style={styles.lessonCard}
              onPress={() => handleLessonPress(lesson.id)}
            >
              <View style={styles.lessonCardContent}>
                <View style={styles.lessonHeader}>
                  <Text style={styles.lessonId}>{lesson.id}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#7C3AED" />
                </View>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonDescription}>{lesson.description}</Text>
                <View style={styles.lessonFooter}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{lesson.type}</Text>
                  </View>
                  {lesson.xpReward && (
                    <View style={styles.xpBadge}>
                      <Ionicons name="star" size={14} color="#F97316" />
                      <Text style={styles.xpText}>{lesson.xpReward} XP</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#1F113C',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  lessonsContainer: {
    gap: 16,
  },
  lessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  lessonCardContent: {
    padding: 16,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lessonId: {
    fontSize: 14,
    fontFamily: 'Lexend-SemiBold',
    fontWeight: '600',
    color: '#7C3AED',
  },
  lessonTitle: {
    fontSize: 18,
    fontFamily: 'Lexend-Bold',
    fontWeight: '700',
    color: '#1F113C',
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  lessonFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'Lexend-Medium',
    fontWeight: '500',
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 12,
    fontFamily: 'Lexend-SemiBold',
    fontWeight: '600',
    color: '#F97316',
  },
});


