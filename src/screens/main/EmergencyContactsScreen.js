import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../../theme/colors';
import Button from '../../components/common/Button';
import { 
  getEmergencyContacts, 
  saveEmergencyContacts, 
  getDeviceContacts 
} from '../../services/sosService';

export default function EmergencyContactsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState([]);
  const [deviceContacts, setDeviceContacts] = useState([]);
  const [showDeviceContacts, setShowDeviceContacts] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    const saved = await getEmergencyContacts();
    setContacts(saved);
    setLoading(false);
  };

  const handleAddFromDevice = async () => {
    const allContacts = await getDeviceContacts();
    setDeviceContacts(allContacts);
    setShowDeviceContacts(true);
  };

  const handleSelectContact = (contact) => {
    if (contacts.find(c => c.id === contact.id)) {
      Alert.alert('Already Added', 'This contact is already in your emergency list.');
      return;
    }
    const updated = [...contacts, { ...contact, isPrimary: contacts.length === 0 }];
    setContacts(updated);
    saveEmergencyContacts(updated);
    setShowDeviceContacts(false);
    Alert.alert('Added!', `${contact.name} has been added to your emergency contacts.`);
  };

  const handleAddManual = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('Missing Info', 'Please enter both name and phone number.');
      return;
    }

    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    if (!phoneRegex.test(newContactPhone.trim())) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }

    const newContact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      isPrimary: contacts.length === 0,
    };

    const updated = [...contacts, newContact];
    setContacts(updated);
    saveEmergencyContacts(updated);
    setNewContactName('');
    setNewContactPhone('');
    Alert.alert('Added!', `${newContact.name} has been added to your emergency contacts.`);
  };

  const handleRemoveContact = (contactId) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = contacts.filter(c => c.id !== contactId);
            if (updated.length > 0 && !updated[0].isPrimary) {
              updated[0].isPrimary = true;
            }
            setContacts(updated);
            saveEmergencyContacts(updated);
          },
        },
      ]
    );
  };

  const handleSetPrimary = (contactId) => {
    const updated = contacts.map(c => ({
      ...c,
      isPrimary: c.id === contactId,
    }));
    setContacts(updated);
    saveEmergencyContacts(updated);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#FFE4EE', '#E8F4FF']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚨 Emergency Contacts</Text>
        <Text style={styles.headerSubtitle}>
          These contacts will receive your location during an emergency
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>
        {contacts.length === 0 ? (
          <View style={[styles.emptyCard, shadows.sm]}>
            <Text style={styles.emptyEmoji}>📱</Text>
            <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
            <Text style={styles.emptyText}>
              Add contacts who will be notified during an emergency. They will receive your location via SMS.
            </Text>
          </View>
        ) : (
          <View style={[styles.contactsCard, shadows.sm]}>
            <Text style={styles.sectionTitle}>Your Emergency Contacts</Text>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactRow}>
                <View style={styles.contactInfo}>
                  <View style={styles.contactNameRow}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>
                <View style={styles.contactActions}>
                  {!contact.isPrimary && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleSetPrimary(contact.id)}
                    >
                      <Text style={styles.actionBtnText}>Set Primary</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.removeBtn]}
                    onPress={() => handleRemoveContact(contact.id)}
                  >
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.addCard, shadows.sm]}>
          <Text style={styles.sectionTitle}>Add from Phone</Text>
          <Button
            title="Choose from Contacts"
            onPress={handleAddFromDevice}
            variant="outline"
            style={{ marginBottom: 12 }}
          />

          {showDeviceContacts && deviceContacts.length > 0 && (
            <View style={styles.deviceContactsList}>
              {deviceContacts.slice(0, 10).map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.deviceContactRow}
                  onPress={() => handleSelectContact(contact)}
                >
                  <Text style={styles.deviceContactName}>{contact.name}</Text>
                  <Text style={styles.deviceContactPhone}>{contact.phone}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.addCard, shadows.sm]}>
          <Text style={styles.sectionTitle}>Add Manually</Text>
          <TextInput
            style={styles.input}
            placeholder="Contact Name"
            value={newContactName}
            onChangeText={setNewContactName}
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={newContactPhone}
            onChangeText={setNewContactPhone}
            keyboardType="phone-pad"
            placeholderTextColor={colors.textMuted}
          />
          <Button
            title="Add Contact"
            onPress={handleAddManual}
            style={{ marginTop: 8 }}
          />
        </View>

        <View style={[styles.infoCard, shadows.sm]}>
          <Text style={styles.infoTitle}>💡 How it works</Text>
          <Text style={styles.infoText}>
            When you tap the SOS button, Little Heartbeat will:
          </Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>📍 Get your current location</Text>
            <Text style={styles.infoItem}>📱 Send an SMS to all contacts</Text>
            <Text style={styles.infoItem}>🗺️ Include a Google Maps link</Text>
            <Text style={styles.infoItem}>⚠️ Alert them of the emergency</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20 },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  headerSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  scroll: { padding: 16, gap: 12 },
  emptyCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.xl,
    padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  contactsCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  contactRow: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  contactInfo: { flex: 1 },
  contactNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  primaryBadge: {
    backgroundColor: colors.riskLowBg, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radius.full,
  },
  primaryBadgeText: { fontSize: 10, fontWeight: '700', color: colors.riskLow },
  contactPhone: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  contactActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: colors.backgroundSecondary, borderRadius: radius.full,
  },
  actionBtnText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  removeBtn: { backgroundColor: colors.riskHighBg },
  removeBtnText: { fontSize: 12, color: colors.riskHigh, fontWeight: '600' },
  addCard: {
    backgroundColor: '#FFFFFF', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: colors.border,
  },
  input: {
    backgroundColor: colors.background, borderRadius: radius.lg,
    padding: 12, fontSize: 14, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  deviceContactsList: { marginTop: 8, maxHeight: 200 },
  deviceContactRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  deviceContactName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  deviceContactPhone: { fontSize: 12, color: colors.textMuted },
  infoCard: {
    backgroundColor: '#F0F7FF', borderRadius: radius.xl,
    padding: 16, borderWidth: 1, borderColor: '#D6E8FF',
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: colors.accentDark, marginBottom: 8 },
  infoText: { fontSize: 13, color: colors.accentDark, marginBottom: 8 },
  infoList: { gap: 6 },
  infoItem: { fontSize: 13, color: colors.accentDark },
});
