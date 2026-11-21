import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { PostsService } from '../timeline/components/post-card/services/posts.service';
import { Post } from '../timeline/components/post-card/models/post.interface';
import { PostCardComponent } from '../timeline/components/post-card/post-card.component';

@Component({
  selector: 'app-post-details',
  imports: [PostCardComponent, NgxSkeletonLoaderComponent],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css',
})
export class PostDetailsComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly postsService = inject(PostsService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  postId = signal('');
  postData = signal<Post | null>(null);
  isLoading = signal(true);
  notFound = signal(false);

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.postId.set(params.get('id')!);
      this.isLoading.set(true);
      this.load();
    });

    this.postsService.postCreated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load());
  }

  load(): void {
    this.postsService.getSinglePost(this.postId()).subscribe({
      next: (res) => {
        this.postData.set(res.data.post);
        this.notFound.set(false);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.notFound.set(true);
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/timeline']);
    }
  }

  onDeleted(): void {
    this.router.navigate(['/timeline']);
  }
}
