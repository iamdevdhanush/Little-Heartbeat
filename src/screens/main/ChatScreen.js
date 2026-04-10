import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { generateChatResponse } from '../../services/aiService';
import { getTranslation } from '../../data/translations';
import RiskBadge from '../../components/common/RiskBadge';

const QUICK_PROMPTS = [
  'I have a headache 😔',
  'My feet are swollen 🦵',
  'I feel nauseous today 🤢',
  'What should I eat? 🥗',
  'How much should I walk? 🚶',
  'I feel very tired 😴',
];

export default function ChatScreen() {
  const { profile, language } = useApp();
  const t = getTranslation(language);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'bot',
      text: `Hello ${profile?.name || 'Mama'}! 💕\n\nI'm your Little Heartbeat assistant. I'm here to help you through your pregnancy journey.\n\nYou can tell me about any symptoms, ask questions, or just talk about how you're feeling. I'll always be gentle and supportive.`,
      time: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (text) => {
    const msgText = text || inputText.trim();
    if (!msgText) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: msgText, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const response = await generateChatResponse(msgText, profile, language);
      
      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response.text,
        time: new Date(),
        isAnalysis: response.isAnalysis || response.requiresEmergency,
        analysisData: response,
      };

      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);

      if (response.requiresEmergency) {
        Alert.alert(
          '⚠️ High Risk Detected',
          'Based on your symptoms, we recommend seeking immediate medical attention. Would you like to access emergency help?',
          [
            { text: 'I\'m Okay', style: 'cancel' },
            { text: 'Get Emergency Help', onPress: () => navigation.navigate('Emergency') },
          ]
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: 'I\'m sorry, I had trouble processing that. Please try again or contact your doctor directly. 💕',
        time: new Date(),
        isAnalysis: false,
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const renderMessage = (msg) => {
    const isUser = msg.role === 'user';

    return (
      <View key={msg.id} style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperBot]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Text style={{ fontSize: 16 }}>💗</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          {msg.isAnalysis && msg.analysisData && (
            <View style={styles.analysisBadge}>
              <RiskBadge risk={msg.analysisData.risk} />
            </View>
          )}
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
            {msg.text}
          </Text>
          <Text style={[styles.timeText, isUser ? styles.timeTextUser : styles.timeTextBot]}>
            {formatTime(msg.time)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#FFF0F5', '#FFF8FA']} style={styles.header}>
        <View style={styles.headerAvatar}>
          <Text style={{ fontSize: 24 }}>💗</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Little Heartbeat AI</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Always here for you</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}

          {isTyping && (
            <View style={[styles.msgWrapper, styles.msgWrapperBot]}>
              <View style={styles.botAvatar}>
                <Text style={{ fontSize: 16 }}>💗</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={styles.typingText}>  Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickPromptsScroll}
            contentContainerStyle={styles.quickPromptsContent}
          >
            {QUICK_PROMPTS.map((prompt, i) => (
              <TouchableOpacity key={i} style={styles.quickChip} onPress={() => sendMessage(prompt)}>
                <Text style={styles.quickChipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Tell me how you're feeling..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFD6E5', justifyContent: 'center', alignItems: 'center',
    marginRight: 12, borderWidth: 2, borderColor: '#FFB3CC',
  },
  headerName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.riskLow, marginRight: 5 },
  onlineText: { fontSize: 12, color: colors.textMuted },
  headerInfo: {},

  messageList: { flex: 1 },
  messageContent: { padding: 16, paddingBottom: 8 },
  msgWrapper: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', maxWidth: '85%' },
  msgWrapperUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgWrapperBot: { alignSelf: 'flex-start' },

  botAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FFD6E5', justifyContent: 'center', alignItems: 'center',
    marginRight: 8, marginBottom: 2,
  },
  bubble: {
    maxWidth: '100%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: colors.primary, borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#F8F0FF', borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: '#EEE0FF',
  },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextBot: { color: colors.textPrimary },
  timeText: { fontSize: 10, marginTop: 4 },
  timeTextUser: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  timeTextBot: { color: colors.textMuted },
  analysisBadge: { marginBottom: 6 },
  typingBubble: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  typingText: { color: colors.textMuted, fontSize: 13 },

  quickPromptsScroll: { maxHeight: 50 },
  quickPromptsContent: { paddingHorizontal: 12, paddingVertical: 6, gap: 8 },
  quickChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full,
    backgroundColor: '#FFF0F5', borderWidth: 1, borderColor: '#FFD6E5',
  },
  quickChipText: { fontSize: 13, color: colors.primary, fontWeight: '500' },

  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingTop: 8,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: colors.border,
    gap: 8,
  },
  input: {
    flex: 1, backgroundColor: '#FFF5F8', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
    color: colors.textPrimary, maxHeight: 100,
    borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#FFB3CC' },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
