import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button, Card, Input, MockBadge, Screen, Text } from '@/components/ui';
import { useI18n } from '@/contexts/LanguageContext';
import { services } from '@/services';
import { useTheme } from '@/theme';

export default function Ai() {
  const { t } = useI18n();
  const { colors, spacing } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const send = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(false);
    services.analytics.track('ai_prompt_sent', { length: prompt.length });
    try {
      const result = await services.ai.ask(prompt);
      setAnswer(result.text);
    } catch (e) {
      services.monitoring.captureException(e, { where: 'ai.ask' });
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll edges={['top']}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">{t('ai.title')}</Text>
          {services.ai.mode === 'mock' ? <MockBadge /> : null}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Input
            value={prompt}
            onChangeText={setPrompt}
            placeholder={t('ai.placeholder')}
            multiline
            style={{ minHeight: 96, textAlignVertical: 'top' }}
          />
          <Button title={t('ai.send')} onPress={send} loading={loading} disabled={!prompt.trim()} />
        </View>

        <Card>
          {error ? (
            <Text color={colors.danger}>{t('common.error')}</Text>
          ) : (
            <Text muted={!answer}>{answer ?? t('ai.empty')}</Text>
          )}
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}
