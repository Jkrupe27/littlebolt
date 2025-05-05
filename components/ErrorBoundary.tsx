import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import Text from '@/components/ui/Text';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to your error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text variant="h4" weight="bold" color={Colors.error[500]} style={styles.title}>
              Something went wrong
            </Text>
            <Text variant="body1" color={Colors.neutral[300]} style={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            {Platform.OS === 'web' && (
              <Text 
                variant="body2" 
                color={Colors.accent[500]}
                style={styles.refresh}
                onPress={() => window.location.reload()}
              >
                Click here to refresh the page
              </Text>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background.primary,
  },
  errorCard: {
    backgroundColor: Colors.background.card,
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  refresh: {
    textDecorationLine: 'underline',
    marginTop: 8,
  },
});

export default ErrorBoundary;