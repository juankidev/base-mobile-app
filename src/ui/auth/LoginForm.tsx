import { AlertBanner } from '@/components/generals/AlertBanner';
import { alertService } from '@/src/services/alerts/alert.service';
import { Feather } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const { width, height } = Dimensions.get('window');

export function LoginForm({ onSubmit }: { onSubmit: (email: string, password: string) => Promise<any> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const isButtonEnabled = email.length > 0 && password.length > 0;

  const handleSubmit = async () => {
    setErrorMessage("");
    try {
      setIsLoading(true);
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        alertService.show({
          type: 'warning',
          title: 'Fallo de red al intentar loguear',
          message: 'Sin conexión a internet. Verifica tu red e inténtalo de nuevo.',
        });
        return;
      }

      const response = await onSubmit(email, password);
      if (response?.statusCode === 200) {
        router.replace("../../routes");
        return;
      }
      if (response?.statusCode === 423) {
        alertService.show({
          type: 'neutral',
          title: 'Cuenta bloqueada / inactiva',
          message: 'Tu cuenta está inactiva. Contacta al administrador.',
        });
        return;
      }
      if (response?.statusCode === 401 || response?.statusCode === 404) {
        alertService.show({
          type: 'error',
          title: 'Credenciales incorrectas',
          message: 'Usuario o contraseña incorrectos. Intenta nuevamente.',
        });
        return;
      }
      if (response?.statusCode === 400) {
        alertService.show({
          type: 'error',
          title: 'Usuario incorrecto',
          message: 'Usuario registrado no es una dirección de correo valida',
        });
        return;
      }
    } catch (error: any) {
      setErrorMessage(error.message ?? "Error en la autenticación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <AlertBanner />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image
          style={styles.logo}
          source={require("@/assets/images/meilog-logo.png")}
          contentFit="contain"
        />

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Usuario Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Usuario</Text>
            <View style={[
              styles.inputContainer,
              emailFocused && styles.inputFocused,
              errorMessage && styles.inputError
            ]}>
              <Feather name="user" size={20} color="#003d82" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu correo electrónico"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMessage("");
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Contraseña Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={[
              styles.inputContainer,
              passwordFocused && styles.inputFocused,
              errorMessage && styles.inputError
            ]}>
              <Feather name="lock" size={20} color="#003d82" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage("");
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#003d82"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {errorMessage !== "" && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Submit Button */}
        <View style={[styles.buttonContainer, { marginBottom: keyboardHeight > 0 ? 20 : 40 }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isButtonEnabled && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isButtonEnabled || isLoading}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.submitButtonText,
              !isButtonEnabled && styles.submitButtonTextDisabled
            ]}>
              {isLoading ? "Cargando..." : "Ingresar"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Meico S.A.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f5',
  },
  scrollContent: {
    flexGrow: 1,
    marginTop: 60,
    paddingHorizontal: 20,
  },
  logo: {
    flex: 2.5,
    marginTop: 40,
    marginBottom: 60,
    width: '100%',
    alignSelf: 'center'
  },
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003d82',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: '#003d82',
    boxShadow: '0px 0px 12px 2px rgba(2, 73, 186, 0.48)',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 100,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: -16,
    marginBottom: 16,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-start',
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#003d82',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#d0d0d0',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  footer: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 40,
    marginBottom: 40,
    fontWeight: '500',
  },
});
