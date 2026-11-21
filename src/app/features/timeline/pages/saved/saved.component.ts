import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { UsersService } from '../../../profile/services/users.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { Post } from '../../components/post-card/models/post.interface';
import { PostsService } from '../../components/post-card/services/posts.service';

@Component({
  selector: 'app-saved',
  imports: [PostCardComponent, NgxSkeletonLoaderComponent],
  templateUrl: './saved.component.html',
  styleUrl: './saved.component.css',
})
export class SavedComponent implements OnInit {
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
    this.usersService.getBookmarks().subscribe({
      next: (res) => {
        this.posts.set(res.data.bookmarks ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }
}
