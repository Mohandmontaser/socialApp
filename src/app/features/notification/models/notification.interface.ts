export interface NotificationUser {
    _id: string;
    name: string;
    photo: string;
  }
  
  export interface NotificationEntity {
    _id: string;
    id: string;
    body?: string;
    user?: string;
    commentsCount?: number;
    sharesCount?: number;
    likesCount?: number;
    isShare?: boolean;
  }
  
  export interface AppNotification {
    _id: string;
    recipient: NotificationUser;
    actor: NotificationUser;
    type: string; 
    entityType: string; 
    entityId: string;
    isRead: boolean;
    createdAt: string;
    entity: NotificationEntity | null;
  }