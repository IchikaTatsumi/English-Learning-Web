import { apiFetch } from "../../../lib/api-fetch";
import { ServerResponseModel } from "../../../lib/typedefs/server-response";
import { CreateUserDTO, UserDTO } from "../dtos/user.dto";

// User Service API
export const userService = {
  // Get all users (Admin only)
  async getAllUsers(): Promise<ServerResponseModel<UserDTO[]>> {
    return await apiFetch<UserDTO[]>("/users", { withCredentials: true });
  },

  // Create a new user (Admin only)
  async createUser(
    userData: CreateUserDTO
  ): Promise<ServerResponseModel<UserDTO>> {
    return await apiFetch<UserDTO>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
  },

  // Get current user info
  async getMyInfo(): Promise<ServerResponseModel<UserDTO>> {
    return await apiFetch<UserDTO>("/users/me", { withCredentials: true });
  },

  // Get user by ID (Admin only)
  async getUserById(id: string): Promise<ServerResponseModel<UserDTO>> {
    return await apiFetch<UserDTO>(`/users/${id}`, { withCredentials: true });
  },

  // Delete user by ID (Admin only)
  async deleteUser(id: string): Promise<ServerResponseModel<any>> {
    return await apiFetch(`/users/${id}`, {
      method: "DELETE",
      withCredentials: true,
    });
  },
};
