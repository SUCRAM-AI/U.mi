import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onPressAbout: () => void;
  onPressLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, onPressAbout, onPressLogout }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View />
      </Pressable>
      <View style={styles.centered} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.title}>Configurações</Text>

          <TouchableOpacity style={styles.item} onPress={onPressAbout} activeOpacity={0.8}>
            <Text style={styles.itemText}>Sobre</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={[styles.item]} onPress={onPressLogout} activeOpacity={0.8}>
            <Text style={[styles.itemText, styles.logoutText]}>Sair</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#1e1b23',
    marginBottom: 8,
    textAlign: 'center',
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  itemText: {
    fontFamily: 'Lexend-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#1e1b23',
    textAlign: 'center',
  },
  logoutText: {
    color: '#ef4444',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  closeBtn: {
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ede9fe',
  },
  closeText: {
    color: '#7c3aed',
    fontFamily: 'Lexend-SemiBold',
    fontWeight: '600',
  },
});

export default SettingsModal;
