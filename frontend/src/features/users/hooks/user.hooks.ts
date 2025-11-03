"use client";

import { useEffect, useState } from "react";
import { ServerResponseModel } from "../../../lib/typedefs/server-response";
import {
  CreateUserDTO,
  LoginDTO,
  LoginResponseDTO,
  UserDTO,
} from "../dtos/user.dto";
import { userService } from "../services/user.service";

// Custom hooks for User APIs
export const useUsers = () => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllUsers = async (): Promise<ServerResponseModel<UserDTO[]>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getAllUsers();
      if (response.success) {
        setUsers(response.data || []);
      } else {
        setError(response.message || "Error fetching users");
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { success: false, message: errorMessage, statusCode: 500 };
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, fetchAllUsers };
};

export const useUser = (id?: string) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (
    userId: string
  ): Promise<ServerResponseModel<UserDTO>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getUserById(userId);
      if (response.success) {
        setUser(response.data || null);
      } else {
        setError(response.message || "Error fetching user");
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { success: false, message: errorMessage, statusCode: 500 };
    } finally {
      setLoading(false);
    }
  };

  const fetchMyInfo = async (): Promise<ServerResponseModel<UserDTO>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getMyInfo();
      if (response.success) {
        setUser(response.data || null);
      } else {
        setError(response.message || "Error fetching user info");
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { success: false, message: errorMessage, statusCode: 500 };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id]);

  return { user, loading, error, fetchUser, fetchMyInfo };
};

export const useUserMutations = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (
    userData: CreateUserDTO
  ): Promise<ServerResponseModel<UserDTO>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.createUser(userData);
      if (!response.success) {
        setError(response.message || "Error creating user");
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { success: false, message: errorMessage, statusCode: 500 };
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string): Promise<ServerResponseModel<any>> => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.deleteUser(id);
      if (!response.success) {
        setError(response.message || "Error deleting user");
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { success: false, message: errorMessage, statusCode: 500 };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, createUser, deleteUser };
};