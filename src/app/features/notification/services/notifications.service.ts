import { environment } from './../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly httpClient = inject(HttpClient);

  getNotifications(page: number = 1, limit: number = 10): Observable<any> {
    return this.httpClient.get(`${environment.baseURL}notifications`, {
      params: { page, limit },
    });
  }

  getUnreadCount(): Observable<any> {
    return this.httpClient.get(`${environment.baseURL}notifications/unread-count`);
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.httpClient.patch(`${environment.baseURL}notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.httpClient.patch(`${environment.baseURL}notifications/read-all`, {});
  }
}