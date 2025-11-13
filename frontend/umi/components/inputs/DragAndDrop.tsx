/**
 * Componente de Drag and Drop para quizzes interativos
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';

interface DragItem {
  id: string;
  label: string;
  correctTarget?: string;
}

interface DropZone {
  id: string;
  label: string;
}

interface DragAndDropProps {
  items: DragItem[];
  dropZones: DropZone[];
  onComplete?: (correct: boolean) => void;
  title?: string;
  instruction?: string;
}

export function DragAndDrop({
  items,
  dropZones,
  onComplete,
  title,
  instruction,
}: DragAndDropProps) {
  const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleItemPress = (itemId: string) => {
    if (completed) return;

    // Se o item já está em uma zona, remover
    if (selectedItems[itemId]) {
      const newSelected = { ...selectedItems };
      delete newSelected[itemId];
      setSelectedItems(newSelected);
      setDraggedItem(null);
      return;
    }

    setDraggedItem(itemId);
  };

  const handleDropZonePress = (zoneId: string) => {
    if (!draggedItem || completed) return;

    const item = items.find((i) => i.id === draggedItem);
    if (!item) return;

    // Verificar se a zona já tem um item
    const hasItem = Object.values(selectedItems).includes(zoneId);
    if (hasItem) {
      Alert.alert('Atenção', 'Esta zona já tem um item. Remova-o primeiro.');
      return;
    }

    const newSelected = { ...selectedItems, [draggedItem]: zoneId };
    setSelectedItems(newSelected);
    setDraggedItem(null);

    // Verificar se todas as zonas foram preenchidas
    if (Object.keys(newSelected).length === dropZones.length) {
      checkAnswer(newSelected);
    }
  };

  const checkAnswer = (selected: Record<string, string>) => {
    let correct = true;

    items.forEach((item) => {
      const selectedZone = selected[item.id];
      if (item.correctTarget && selectedZone !== item.correctTarget) {
        correct = false;
      }
    });

    setCompleted(true);
    onComplete?.(correct);

    if (correct) {
      Alert.alert('Parabéns!', 'Você acertou todas as correspondências!');
    } else {
      Alert.alert('Tente novamente', 'Algumas correspondências estão incorretas.');
    }
  };

  const reset = () => {
    setSelectedItems({});
    setDraggedItem(null);
    setCompleted(false);
  };

  const getItemInZone = (zoneId: string) => {
    const itemId = Object.keys(selectedItems).find(
      (id) => selectedItems[id] === zoneId
    );
    return items.find((i) => i.id === itemId);
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {instruction && <Text style={styles.instruction}>{instruction}</Text>}

      {/* Items para arrastar */}
      <View style={styles.itemsContainer}>
        {items.map((item) => {
          const isSelected = !!selectedItems[item.id];
          const isDragging = draggedItem === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.item,
                isSelected && styles.itemSelected,
                isDragging && styles.itemDragging,
                completed && isSelected && styles.itemCorrect,
              ]}
              onPress={() => handleItemPress(item.id)}
              disabled={completed}
            >
              <Text style={styles.itemText}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Drop Zones */}
      <View style={styles.zonesContainer}>
        {dropZones.map((zone) => {
          const itemInZone = getItemInZone(zone.id);
          const isHighlighted = draggedItem && !itemInZone;

          return (
            <TouchableOpacity
              key={zone.id}
              style={[
                styles.dropZone,
                itemInZone && styles.dropZoneFilled,
                isHighlighted && styles.dropZoneHighlighted,
              ]}
              onPress={() => handleDropZonePress(zone.id)}
              disabled={!!itemInZone || !draggedItem || completed}
            >
              <Text style={styles.zoneLabel}>{zone.label}</Text>
              {itemInZone && (
                <Text style={styles.zoneItem}>{itemInZone.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {completed && (
        <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

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
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    fontFamily: 'Lexend',
    color: '#6B7280',
    marginBottom: 16,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  itemDragging: {
    borderColor: '#F97316',
    transform: [{ scale: 1.1 }],
  },
  itemCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  itemText: {
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
    color: '#1F113C',
  },
  zonesContainer: {
    gap: 16,
  },
  dropZone: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneFilled: {
    borderColor: '#7C3AED',
    borderStyle: 'solid',
    backgroundColor: '#F5F3FF',
  },
  dropZoneHighlighted: {
    borderColor: '#F97316',
    backgroundColor: '#FFF7ED',
  },
  zoneLabel: {
    fontSize: 14,
    fontFamily: 'Lexend',
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  zoneItem: {
    fontSize: 18,
    fontFamily: 'Lexend',
    fontWeight: '700',
    color: '#7C3AED',
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F97316',
    borderRadius: 24,
    alignSelf: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Lexend',
    fontWeight: '600',
  },
});
