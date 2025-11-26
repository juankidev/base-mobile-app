import { getDeviceDateTime } from "@/src/utils/uitls";
import * as SecureStore from "expo-secure-store";
import { AuthRepository } from "../../domain/login/AuthRepository";
import { authStorage } from "./authStorage";

export const authRepositoryImpl: AuthRepository = {
  async login(email: string, password: string) {
    const users: Record<string, string> = {
      "leizzy@example.com": "123456",
      "picker@example.com": "111222",
      "blocked@example.com": "123456",
    };
    const blocked = new Set<string>(["blocked@example.com"]);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        data: null,
        message: "El texto del campo Usuario no es una dirección de correo valida",
        success: false,
      };
    }

    if (!users[email]) {
      return {
        statusCode: 404,
        data: null,
        message: "Usuario registrado no existe en la base de datos",
        success: false,
      };
    }
    if (blocked.has(email)) {
      console.log("Cuenta bloqueada / inactiva", email);
      
      return {
        statusCode: 423,
        data: null,
        message: "Cuenta bloqueada / inactiva",
        success: false,
      };
    }

    if (users[email] !== password) {
      return {
        statusCode: 401,
        data: null,
        message: "Contraseña errada",
        success: false,
      };
    }

    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const exp = Math.floor(Date.now() / 1000) + 3 * 60 * 60;
    const payload = btoa(JSON.stringify({ email, empresa: "Meico", exp }));
    const signature = "mock-signature";
    const token = `${header}.${payload}.${signature}`;

    await authStorage.saveToken(token);
    await SecureStore.setItemAsync("LAST_AUTH_AT", getDeviceDateTime());
    await SecureStore.setItemAsync("LAST_ACTIVITY_AT", String(Date.now()));

    return {
      statusCode: 200,
      data: token,
      message: "Autenticación exitosa",
      success: true,
    };
  },

  async logout() {
    await authStorage.removeToken();
  },
};
