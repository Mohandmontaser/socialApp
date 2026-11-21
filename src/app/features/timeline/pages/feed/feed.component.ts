import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { Post } from '../../components/post-card/models/post.interface';
import { PostsService } from '../../components/post-card/services/posts.service';

@Component({
  selector: 'app-feed',
  imports: [PostCardComponent, NgxSkeletonLoaderComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly destroyRef = inject(DestroyRef);

  posts = signal<Post[]>([]);
  isLoading = signal(true);
  skeletonPosts = [1, 2, 3];

  ngOnInit(): void {
    this.load();

    this.postsService.postCreated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }

  load(): void {
    this.postsService.getFeedPosts().subscribe({
      next: (res) => {
        this.posts.set(res.data.posts);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }
}
