import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { Post } from '../../components/post-card/models/post.interface';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { PostsService } from '../../components/post-card/services/posts.service';
import { InfiniteScroll } from '../../../../shared/directives/infinite-scroll'; 

@Component({
  selector: 'app-community',
  imports: [PostCardComponent, NgxSkeletonLoaderComponent, InfiniteScroll],
  templateUrl: './community.component.html',
  styleUrl: './community.component.css',
})
export class CommunityComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly destroyRef = inject(DestroyRef);

  posts = signal<Post[]>([]);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  hasMore = signal(false);
  skeletonPosts = [1, 2, 3];

  private page = 1;
  private readonly limit = 10;

  ngOnInit(): void {
    this.load();

    this.postsService.postCreated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }

  load(): void {
    this.page = 1;

    this.postsService.getCommunityPosts(1, this.limit).subscribe({
      next: (res) => {
        this.posts.set(res.data.posts);
        this.hasMore.set(this.checkHasMore(res));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  loadMore(): void {
    if (this.isLoadingMore() || !this.hasMore()) return;

    this.isLoadingMore.set(true);
    this.page++;

    this.postsService.getCommunityPosts(this.page, this.limit).subscribe({
      next: (res) => {
        this.posts.update((list) => [...list, ...res.data.posts]);
        this.hasMore.set(this.checkHasMore(res));
        this.isLoadingMore.set(false);
      },
      error: (err) => {
        console.log(err);
        this.page--;
        this.isLoadingMore.set(false);
      },
    });
  }

  private checkHasMore(res: any): boolean {
    const p = res.meta?.pagination;
    return !!p && p.currentPage < p.numberOfPages;
  }
}