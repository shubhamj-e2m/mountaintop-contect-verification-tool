import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, CheckCheck, Loader2 } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, dismissNotification } from '../../services/notificationService';
import type { Notification } from '../../types/notification';

interface NotificationDropdownProps {
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ unreadCount, onUnreadCountChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch unread count periodically (only when tab is visible)
  useEffect(() => {
    const fetchUnreadCount = async () => {
      // Only fetch if tab is visible
      if (document.hidden) return;
      
      try {
        const count = await getUnreadCount();
        onUnreadCountChange(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Refresh every 60 seconds (reduced from 30s)

    // Also listen for visibility changes to fetch immediately when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUnreadCount();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onUnreadCountChange]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const allNotifications = await getNotifications({ limit: 20 });
      // Sort: unread first, then by created_at descending
      const sorted = allNotifications.sort((a, b) => {
        if (a.read !== b.read) {
          return a.read ? 1 : -1;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setNotifications(sorted);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      setMarkingAsRead(notification.id);
      try {
        await markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
        );
        // Update unread count
        const count = await getUnreadCount();
        onUnreadCountChange(count);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      } finally {
        setMarkingAsRead(null);
      }
    }

    // Navigate to the link
    navigate(notification.link_url);
    setIsOpen(false);
  };

  const handleDismiss = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    setDismissing(notificationId);
    try {
      await dismissNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Update unread count if it was unread
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        const count = await getUnreadCount();
        onUnreadCountChange(count);
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    } finally {
      setDismissing(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllAsRead(true);
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onUnreadCountChange(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-bg-tertiary rounded-md transition-smooth"
        title="Notifications"
      >
        <Bell size={20} className="text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1.5 flex items-center justify-center bg-red-600 text-white text-xs font-semibold rounded-full border-2 border-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-[var(--color-border)] rounded-lg shadow-lg z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm font-normal text-[var(--color-text-secondary)]">
                  ({unreadCount} unread)
                </span>
              )}
            </h3>
            {unreadNotifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAllAsRead}
                className="text-sm text-[var(--color-accent)] hover:underline disabled:opacity-50 flex items-center gap-1"
              >
                {markingAllAsRead ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Marking...
                  </>
                ) : (
                  <>
                    <CheckCheck size={14} />
                    Mark all read
                  </>
                )}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-secondary)]">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-[var(--color-bg-secondary)] transition-smooth cursor-pointer ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-[var(--color-text-primary)]">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                            disabled={markingAsRead === notification.id}
                            className="p-1.5 text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] rounded-md transition-smooth disabled:opacity-50"
                            title="Mark as read"
                          >
                            {markingAsRead === notification.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDismiss(e, notification.id)}
                          disabled={dismissing === notification.id}
                          className="p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] rounded-md transition-smooth disabled:opacity-50"
                          title="Dismiss"
                        >
                          {dismissing === notification.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <X size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
