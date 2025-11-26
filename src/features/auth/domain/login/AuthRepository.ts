import { ApiResponse } from "../ApiResponse";
import { AuthUser } from "./AuthUser";

export interface AuthRepository {
  login: (email: string, password: string) => Promise<ApiResponse<AuthUser | string>>;
  logout(): Promise<void>;
}
