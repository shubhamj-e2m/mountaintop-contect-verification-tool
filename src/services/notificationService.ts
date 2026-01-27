import { apiClient } from '../lib/apiClient';
import type { Notification } from '../types/notification';

/**
 * Get notifications for the current user
 */
export async function getNotifications(options: { read?: boolean; limit?: number } = {}): Promise<Notification[]> {
  try {
    const params = new URLSearchParams();
    if (options.read !== undefined) {
      params.append('read', options.read.toString());
    }
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
    
    const notifications = await apiClient.get<Notification[]>(endpoint);
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.count;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    await apiClient.put(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  try {
    await apiClient.put('/notifications/read-all');
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Dismiss a notification
 */
export async function dismissNotification(notificationId: string): Promise<void> {
  try {
    await apiClient.delete(`/notifications/${notificationId}`);
  } catch (error) {
    console.error('Error dismissing notification:', error);
    throw error;
  }
}
