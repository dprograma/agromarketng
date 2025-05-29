export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  time?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationResponse {
  notifications: Notification[];
}

export interface UnreadNotificationResponse {
  count: number;
}

export interface NotificationUpdateRequest {
  ids: string[];
}

export interface NotificationUpdateResponse {
  success: boolean;
  message: string;
}
