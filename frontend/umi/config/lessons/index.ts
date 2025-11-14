/**
 * Índice de todas as lições disponíveis
 */

import lesson1_1 from './lesson-1-1.json';
import lesson1_2 from './lesson-1-2.json';
import lesson1_3 from './lesson-1-3.json';
import lesson1_4 from './lesson-1-4.json';
import lesson2_1 from './lesson-2-1.json';
import lesson2_2 from './lesson-2-2.json';
import lesson3_1 from './lesson-3-1.json';
import lesson3_2 from './lesson-3-2.json';
import lesson3_3 from './lesson-3-3.json';
import lesson3_4 from './lesson-3-4.json';
import lesson4_1 from './lesson-4-1.json';
import lesson4_2 from './lesson-4-2.json';
import lesson4_3 from './lesson-4-3.json';
import lesson5_1 from './lesson-5-1.json';
import lesson5_2 from './lesson-5-2.json';
import lesson5_3 from './lesson-5-3.json';
import lesson5_4 from './lesson-5-4.json';
import lesson6_1 from './lesson-6-1.json';
import lesson6_2 from './lesson-6-2.json';
import lesson6_3 from './lesson-6-3.json';
import lesson7_1 from './lesson-7-1.json';
import lesson7_2 from './lesson-7-2.json';
import lesson7_3 from './lesson-7-3.json';
import lesson8_1 from './lesson-8-1.json';
import lesson8_2 from './lesson-8-2.json';
import lesson8_3 from './lesson-8-3.json';
import lesson9_1 from './lesson-9-1.json';
import lesson9_2 from './lesson-9-2.json';
import lesson9_3 from './lesson-9-3.json';
import lesson10_1 from './lesson-10-1.json';
import lesson10_2 from './lesson-10-2.json';
import lesson10_3 from './lesson-10-3.json';
import lesson10_4 from './lesson-10-4.json';

export const lessons: Record<string, any> = {
  '1.1': lesson1_1,
  '1.2': lesson1_2,
  '1.3': lesson1_3,
  '1.4': lesson1_4,
  '2.1': lesson2_1,
  '2.2': lesson2_2,
  '3.1': lesson3_1,
  '3.2': lesson3_2,
  '3.3': lesson3_3,
  '3.4': lesson3_4,
  '4.1': lesson4_1,
  '4.2': lesson4_2,
  '4.3': lesson4_3,
  '5.1': lesson5_1,
  '5.2': lesson5_2,
  '5.3': lesson5_3,
  '5.4': lesson5_4,
  '6.1': lesson6_1,
  '6.2': lesson6_2,
  '6.3': lesson6_3,
  '7.1': lesson7_1,
  '7.2': lesson7_2,
  '7.3': lesson7_3,
  '8.1': lesson8_1,
  '8.2': lesson8_2,
  '8.3': lesson8_3,
  '9.1': lesson9_1,
  '9.2': lesson9_2,
  '9.3': lesson9_3,
  '10.1': lesson10_1,
  '10.2': lesson10_2,
  '10.3': lesson10_3,
  '10.4': lesson10_4,
};

export function getLesson(lessonId: string) {
  return lessons[lessonId] || null;
}

export function getAllLessons() {
  return Object.values(lessons);
}

export function getLessonsBySection(section: string) {
  return Object.values(lessons).filter((lesson: any) => lesson.section === section);
}

export function getLessonsByUnit(section: string, unit: string) {
  return Object.values(lessons).filter(
    (lesson: any) => lesson.section === section && lesson.unit === unit
  );
}
