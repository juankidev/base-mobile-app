import { authStorage } from "@/src/features/auth/infrastructure/login/authStorage";
import { decodeJWT } from "@/src/utils/jwt";
import { getDeviceDateTime } from "@/src/utils/uitls";
import * as SecureStore from "expo-secure-store";
import { Slot, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function PrivateLayout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const token = await authStorage.getToken();
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const payload = decodeJWT(token);
      const nowSec = Math.floor(Date.now() / 1000);
      if (!payload || (payload.exp && nowSec >= payload.exp)) {
        await authStorage.removeToken();
        await SecureStore.setItemAsync("LAST_LOGOUT_AT", getDeviceDateTime());
        router.replace("/auth/login");
        return;
      }

      const lastActivityStr = await SecureStore.getItemAsync("LAST_ACTIVITY_AT");
      const lastActivityMs = lastActivityStr ? Number(lastActivityStr) : Date.now();
      const threeHoursMs = 3 * 60 * 60 * 1000;
      if (Date.now() - lastActivityMs > threeHoursMs) {
        await authStorage.removeToken();
        await SecureStore.setItemAsync("LAST_LOGOUT_AT", getDeviceDateTime());
        router.replace("/auth/login");
        return;
      }
      setLoading(false);
    }
    check();
  }, [router]);

  if (loading) return null;

  return <Slot />;
}
