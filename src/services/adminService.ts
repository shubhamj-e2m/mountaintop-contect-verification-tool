import { apiClient } from '../lib/apiClient';
import type { User, UserRole } from '../types/user';

/**
 * Get all users in the system (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
    try {
        const users = await apiClient.get<User[]>('/admin/users');
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

/**
 * Update a user's role (admin only)
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<User> {
    try {
        const user = await apiClient.put<User>(`/admin/users/${userId}/role`, { role });
        return user;
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
}

/**
 * Delete a user (admin only)
 */
export async function deleteUser(userId: string): Promise<void> {
    try {
        await apiClient.delete(`/admin/users/${userId}`);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}
