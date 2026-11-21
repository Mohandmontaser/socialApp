import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { UsersService } from './services/users.service';
import { ProfileUser } from './models/profile-user.interface';
import { Post } from '../timeline/components/post-card/models/post.interface';
import { PostsService } from '../timeline/components/post-card/services/posts.service';
import { CurrentUserService } from '../../core/services/current-user.service';
import { PostCardComponent } from '../timeline/components/post-card/post-card.component';

@Component({
  selector: 'app-profile',
  imports: [NgxSkeletonLoaderModule, PostCardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly postsService = inject(PostsService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  userData = signal<ProfileUser>({} as ProfileUser);
  userPosts = signal<Post[]>([]);
  savedPosts = signal<Post[]>([]);
  postsTotal = signal<number>(0);
  activeTab = signal<'posts' | 'saved'>('posts');
  isLoadingProfile = signal(true);
  isLoadingPosts = signal(true);
  isLoadingSaved = signal(false);
  isUploadingPhoto = signal(false);
  skeletonPosts = [1, 2, 3];

  viewedUserId = signal<string | null>(null);

  visiblePosts = computed(() =>
    this.activeTab() === 'posts' ? this.userPosts() : this.savedPosts(),
  );
  isLoadingList = computed(() =>
    this.activeTab() === 'posts' ? this.isLoadingPosts() : this.isLoadingSaved(),
  );

  isOwnProfile(): boolean {
    return this.viewedUserId() === null;
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      this.viewedUserId.set(id);
      this.resetState();
      id ? this.getOtherProfile(id) : this.getUserData();
    });

    this.postsService.postCreated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshPosts());
  }

  private resetState(): void {
    this.userData.set({} as ProfileUser);
    this.userPosts.set([]);
    this.savedPosts.set([]);
    this.postsTotal.set(0);
    this.activeTab.set('posts');
    this.isLoadingProfile.set(true);
    this.isLoadingPosts.set(true);
  }

  getUserData(): void {
    this.usersService.getMyProfile().subscribe({
      next: (res) => {
        this.userData.set(res.data.user);
        this.isLoadingProfile.set(false);
        this.getUserPosts(res.data.user._id);
      },
      error: (err) => {
        console.log(err);
        this.isLoadingProfile.set(false);
        this.isLoadingPosts.set(false);
      },
    });
  }

  getOtherProfile(userId: string): void {
    this.usersService.getUserProfile(userId).subscribe({
      next: (res) => {
        this.userData.set(res.data.user);
        this.isLoadingProfile.set(false);
        this.getUserPosts(userId);
      },
      error: (err) => {
        console.log(err);
        this.isLoadingProfile.set(false);
        this.isLoadingPosts.set(false);
      },
    });
  }

  getUserPosts(userId: string): void {
    this.usersService.getUserPosts(userId).subscribe({
      next: (res) => {
        this.userPosts.set(res.data.posts);
        this.postsTotal.set(res.meta.pagination.total);
        this.isLoadingPosts.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoadingPosts.set(false);
      },
    });
  }

  refreshPosts(): void {
    if (this.activeTab() === 'saved') {
      this.loadBookmarks(false);
    } else if (this.userData()._id) {
      this.getUserPosts(this.userData()._id);
    }
  }

  selectTab(tab: 'posts' | 'saved'): void {
    this.activeTab.set(tab);
    if (tab === 'saved' && !this.savedPosts().length) {
      this.loadBookmarks(true);
    }
  }

  loadBookmarks(showSkeleton: boolean): void {
    if (showSkeleton) this.isLoadingSaved.set(true);

    this.usersService.getBookmarks().subscribe({
      next: (res) => {
        this.savedPosts.set(res.data.bookmarks ?? []);
        this.isLoadingSaved.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoadingSaved.set(false);
      },
    });
  }

  onBookmarkToggled(nowBookmarked: boolean): void {
    this.userData.update((u) => ({
      ...u,
      bookmarksCount: Math.max(0, (u.bookmarksCount ?? 0) + (nowBookmarked ? 1 : -1)),
    }));

    if (this.activeTab() === 'saved') {
      this.loadBookmarks(false);
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploadingPhoto.set(true);
    this.usersService.uploadProfilePhoto(file).subscribe({
      next: () => {
        input.value = '';
        this.usersService.getMyProfile().subscribe({
          next: (res) => {
            this.userData.set(res.data.user);
            this.currentUser.updatePhoto(res.data.user.photo);
            this.isUploadingPhoto.set(false);
          },
          error: () => this.isUploadingPhoto.set(false),
        });
      },
      error: (err) => {
        console.log(err);
        this.isUploadingPhoto.set(false);
        input.value = '';
      },
    });
  }
}
