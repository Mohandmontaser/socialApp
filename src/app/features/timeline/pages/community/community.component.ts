import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { Post } from '../../components/post-card/models/post.interface';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { PostsService } from '../../components/post-card/services/posts.service';


@Component({
  selector: 'app-community',
  imports: [PostCardComponent, NgxSkeletonLoaderComponent],
  templateUrl: './community.component.html',
  styleUrl: './community.component.css',
})
export class CommunityComponent implements OnInit {
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
    this.postsService.getCommunityPosts().subscribe({
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
