import { z } from 'zod';
import { httpClient, ApiResponse } from './httpClient';

// User schema validation
const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']),
  isActive: z.boolean(),
  lastLogin: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const UsersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(UserSchema),
  count: z.number(),
  message: z.string().optional(),
});

const UserFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

// Types
export type User = z.infer<typeof UserSchema>;
export type UsersResponse = z.infer<typeof UsersResponseSchema>;
export type UserFormData = z.infer<typeof UserFormSchema>;

// API endpoints
const ENDPOINTS = {
  USERS: '/api/users',
  USER_BY_ID: (id: string): string => `/api/users/${id}`,
  USER_STATUS: (id: string): string => `/api/users/${id}/status`,
} as const;

/**
 * Get all users
 */
export async function getAllUsers(): Promise<UsersResponse> {
  try {
    const response = await httpClient.get<ApiResponse<User[]>>(ENDPOINTS.USERS);
    
    // Validate response structure
    const validatedResponse = UsersResponseSchema.parse({
      success: response.success,
      data: Array.isArray(response.data) ? response.data : [],
      count: Array.isArray(response.data) ? response.data.length : 0,
      message: response.message,
    });

    return validatedResponse;
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Return safe fallback
    return {
      success: false,
      data: [],
      count: 0,
      message: error instanceof Error ? error.message : 'Failed to fetch users',
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const response = await httpClient.get<ApiResponse<User>>(ENDPOINTS.USER_BY_ID(id));
    
    if (!response.success || !response.data) {
      return null;
    }

    // Validate user data
    return UserSchema.parse(response.data);
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Create new user
 */
export async function createUser(userData: UserFormData): Promise<ApiResponse<User>> {
  try {
    // Validate input data
    const validatedData = UserFormSchema.parse(userData);
    
    const response = await httpClient.post<User>(ENDPOINTS.USERS, validatedData);
    
    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
}

/**
 * Update user
 */
export async function updateUser(id: string, userData: Partial<UserFormData>): Promise<ApiResponse<User>> {
  try {
    // Validate input data (partial validation)
    const validatedData = UserFormSchema.partial().parse(userData);
    
    const response = await httpClient.put<User>(ENDPOINTS.USER_BY_ID(id), validatedData);
    
    return response;
  } catch (error) {
    console.error('Error updating user:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update user',
    };
  }
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<ApiResponse<null>> {
  try {
    const response = await httpClient.delete<null>(ENDPOINTS.USER_BY_ID(id));
    
    return response;
  } catch (error) {
    console.error('Error deleting user:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete user',
    };
  }
}

/**
 * Toggle user status (active/inactive)
 */
export async function toggleUserStatus(id: string): Promise<ApiResponse<User>> {
  try {
    const response = await httpClient.put<User>(ENDPOINTS.USER_STATUS(id), {});
    
    return response;
  } catch (error) {
    console.error('Error toggling user status:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to toggle user status',
    };
  }
}

/**
 * Search users by query
 */
export async function searchUsers(query: string): Promise<UsersResponse> {
  try {
    const response = await httpClient.get<ApiResponse<User[]>>(`${ENDPOINTS.USERS}?search=${encodeURIComponent(query)}`);
    
    // Validate response structure
    const validatedResponse = UsersResponseSchema.parse({
      success: response.success,
      data: Array.isArray(response.data) ? response.data : [],
      count: Array.isArray(response.data) ? response.data.length : 0,
      message: response.message,
    });

    return validatedResponse;
  } catch (error) {
    console.error('Error searching users:', error);
    
    // Return safe fallback
    return {
      success: false,
      data: [],
      count: 0,
      message: error instanceof Error ? error.message : 'Failed to search users',
    };
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: User['role']): Promise<UsersResponse> {
  try {
    const response = await httpClient.get<ApiResponse<User[]>>(`${ENDPOINTS.USERS}?role=${role}`);
    
    // Validate response structure
    const validatedResponse = UsersResponseSchema.parse({
      success: response.success,
      data: Array.isArray(response.data) ? response.data : [],
      count: Array.isArray(response.data) ? response.data.length : 0,
      message: response.message,
    });

    return validatedResponse;
  } catch (error) {
    console.error('Error fetching users by role:', error);
    
    // Return safe fallback
    return {
      success: false,
      data: [],
      count: 0,
      message: error instanceof Error ? error.message : 'Failed to fetch users by role',
    };
  }
}

/**
 * Validate user form data
 */
export function validateUserForm(data: unknown): { success: boolean; data?: UserFormData; errors?: string[] } {
  try {
    const validatedData = UserFormSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    
    return { success: false, errors: ['Invalid form data'] };
  }
}