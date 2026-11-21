import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { UsersService } from '../../../profile/services/users.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { Post } from '../../components/post-card/models/post.interface';
import { PostsService } from '../../components/post-card/services/posts.service';

@Component({
  selector: 'app-my-posts',
  imports: [PostCardComponent, NgxSkeletonLoaderComponent],
  templateUrl: './my-posts.component.html',
  styleUrl: './my-posts.component.css',
})
export class MyPostsComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly usersService = inject(UsersService);
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
    this.usersService
      .getMyProfile()
      .pipe(switchMap((res) => this.usersService.getUserPosts(res.data.user._id)))
      .subscribe({
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
