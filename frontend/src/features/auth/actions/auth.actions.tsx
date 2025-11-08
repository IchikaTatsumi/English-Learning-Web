"use server";

import { LoginDto } from "@/features/auth/dtos/request/login.dto";
import { RegisterDto } from "@/features/auth/dtos/request/register.dto";
import { Role } from "@/lib/constants/enums";
import { authService } from "../services/auth.service";

export async function registerAction(params: RegisterDto) {
  return authService.register(params);
}

export async function loginAction(params: LoginDto) {
  return authService.login(params);
}

export async function logoutAction() {
  return authService.logout();
}

export async function checkAuthAction(params?: { role?: Role }) {
  return authService.check(params);
}

export async function getIdentityAction() {
  return authService.getIdentity();
}