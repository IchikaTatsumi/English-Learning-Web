import { apiFetch } from "../../../lib/api-fetch";
import { ServerResponseModel } from "../../../lib/typedefs/server-response";
import { CreateUserDTO, UserDTO } from "../dtos/user.dto";

/**
 * User Service API
 * Maps to backend UserController endpoints
 */
export const userService = {
  /**
   * Get all users (Admin only)
   * GET /users
   * Backend: UsersController.getAllUsers()
   */
  async getAllUsers(): Promise<ServerResponseModel<UserDTO[]>> {
    return await apiFetch<UserDTO[]>("/users", { 
      withCredentials: true 
    });
  },

  /**
   * Get current user info
   * GET /users/me
   * Backend: UsersController.getMe()
   */
  async getMyInfo(): Promise<ServerResponseModel<UserDTO>> {
    return await apiFetch<UserDTO>("/users/me", { 
      withCredentials: true 
    });
  },

  /**
   * Get user by ID (Admin only)
   * GET /users/:id
   * Backend: UsersController.getUserById()
   */
  async getUserById(id: string): Promise<ServerResponseModel<UserDTO>> {
    return await apiFetch<UserDTO>(`/users/${id}`, { 
      withCredentials: true 
    });
  },

  /**
   * Create a new user (Admin only)
   * POST /users
   * Backend: UsersController.createUser()
   */
  async createUser(userData: CreateUserDTO): Promise<ServerResponseModel<UserDTO>> {
    return await apiFetch<UserDTO>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
  },

  /**
   * Delete user by ID (Admin only)
   * DELETE /users/:id
   * Backend: UsersController.deleteUser()
   */
  async deleteUser(id: string): Promise<ServerResponseModel<UserDTO>> {
    return await apiFetch<UserDTO>(`/users/${id}`, {
      method: "DELETE",
      withCredentials: true,
    });
  },
};