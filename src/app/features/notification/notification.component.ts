import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import {NotificationsService} from "./services/notifications.service.js"
import {AppNotification} from "./models/notification.interface"


interface NotificationStyle {
  text: string;
  icon: string;
  color: string;
}

const STYLES: Record<string, NotificationStyle> = {
  like_post: { text: 'liked your post', icon: 'fa-solid fa-thumbs-up', color: 'bg-blue-500' },
  share_post: { text: 'shared your post', icon: 'fa-solid fa-share', color: 'bg-emerald-500' },
  comment_post: { text: 'commented on your post', icon: 'fa-solid fa-comment', color: 'bg-amber-500' },
  follow_user: { text: 'started following you', icon: 'fa-solid fa-user-plus', color: 'bg-violet-500' },
};

const DEFAULT_STYLE: NotificationStyle = {
  text: 'sent you a notification',
  icon: 'fa-solid fa-bell',
  color: 'bg-slate-500',
};

@Component({
  selector: 'app-notifications',
  imports: [TimeAgoPipe, NgxSkeletonLoaderComponent],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationsComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  private readonly router = inject(Router);

  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);
  filter = signal<'all' | 'unread'>('all');

  isLoading = signal(true);
  isLoadingMore = signal(false);
  isMarkingAll = signal(false);
  hasMore = signal(false);
  skeletonItems = [1, 2, 3, 4];

  private page = 1;
  private readonly limit = 10;

  visibleNotifications = computed(() =>
    this.filter() === 'unread' ? this.notifications().filter((n) => !n.isRead) : this.notifications()
  );

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  loadNotifications(): void {
    this.notificationsService.getNotifications(1, this.limit).subscribe({
      next: (res) => {
        this.notifications.set(res.data.notifications);
        this.hasMore.set(res.meta.pagination.currentPage < res.meta.pagination.numberOfPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  loadMore(): void {
    if (this.isLoadingMore()) return;

    this.isLoadingMore.set(true);
    this.page++;

    this.notificationsService.getNotifications(this.page, this.limit).subscribe({
      next: (res) => {
        this.notifications.update((list) => [...list, ...res.data.notifications]);
        this.hasMore.set(res.meta.pagination.currentPage < res.meta.pagination.numberOfPages);
        this.isLoadingMore.set(false);
      },
      error: (err) => {
        console.log(err);
        this.page--;
        this.isLoadingMore.set(false);
      },
    });
  }

  loadUnreadCount(): void {
    this.notificationsService.getUnreadCount().subscribe({
      next: (res) => this.unreadCount.set(res.data?.unreadCount ?? res.data?.count ?? 0),
      error: (err) => console.log(err),
    });
  }

  style(n: AppNotification): NotificationStyle {
    return STYLES[n.type] ?? DEFAULT_STYLE;
  }

  markAsRead(n: AppNotification): void {
    if (n.isRead) return;

    this.setRead(n._id, true);
    this.unreadCount.update((c) => Math.max(0, c - 1));

    this.notificationsService.markAsRead(n._id).subscribe({
      error: (err) => {
        console.log(err);
        this.setRead(n._id, false); 
        this.unreadCount.update((c) => c + 1);
      },
    });
  }

  markAllAsRead(): void {
    if (this.isMarkingAll() || this.unreadCount() === 0) return;

    this.isMarkingAll.set(true);
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
        this.isMarkingAll.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isMarkingAll.set(false);
      },
    });
  }

  private setRead(id: string, value: boolean): void {
    this.notifications.update((list) =>
      list.map((n) => (n._id === id ? { ...n, isRead: value } : n))
    );
  }

  open(n: AppNotification): void {
    this.markAsRead(n);

    if (n.type === 'follow_user') {
      this.router.navigate(['/profile', n.actor._id]);
    } else if (n.entityType === 'post') {
      this.router.navigate(['/postDetails', n.entityId]);
    }
  }
}