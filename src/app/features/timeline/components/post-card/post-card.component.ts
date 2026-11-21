import { Post } from './models/post.interface';
import { CommentsComponent } from './components/comments/comments.component';
import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago-pipe';
import { CurrentUserService } from '../../../../core/services/current-user.service';
import { PostsService } from './services/posts.service';

@Component({
  selector: 'app-post-card',
  imports: [RouterLink, CommentsComponent, TimeAgoPipe],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css',
})
export class PostCardComponent {
  private readonly postsService = inject(PostsService);
  private readonly currentUser = inject(CurrentUserService);

  post = input.required<Post>();
  deleted = output<string>();
  bookmarkToggled = output<boolean>();

  isMine = computed(() => this.post().user._id === this.currentUser.user()?._id);

  menuOpen = signal(false);

  //  Privacy 
  privacy = linkedSignal(() => this.post().privacy);
  privacyOpen = signal(false);

  changePrivacy(value: string): void {
    const old = this.privacy();
    this.privacy.set(value);
    this.privacyOpen.set(false);

    const formData = new FormData();
    formData.append('privacy', value);

    this.postsService.updatePost(this.post().id, formData).subscribe({
      error: (err) => {
        console.log(err);
        this.privacy.set(old);
        Swal.fire({ title: 'Error', text: 'Could not change privacy.', icon: 'error' });
      },
    });
  }

  //  Like 
  isLiked = linkedSignal(() => !!this.post().likes?.includes(this.currentUser.user()?._id as any));
  likesCount = linkedSignal(() => this.post().likesCount);
  isLiking = signal(false);

  toggleLike(): void {
    if (this.isLiking()) return;

    const wasLiked = this.isLiked();
    this.isLiked.set(!wasLiked);
    this.likesCount.update((n) => n + (wasLiked ? -1 : 1));

    this.isLiking.set(true);
    this.postsService.likePost(this.post().id).subscribe({
      next: () => this.isLiking.set(false),
      error: (err) => {
        console.log(err);
        this.isLiked.set(wasLiked);
        this.likesCount.update((n) => n + (wasLiked ? 1 : -1));
        this.isLiking.set(false);
      },
    });
  }

  //  Bookmark 
  isBookmarked = linkedSignal(() => !!this.post().bookmarked);
  isBookmarking = signal(false);

  toggleBookmark(): void {
    if (this.isBookmarking()) return;

    const was = this.isBookmarked();
    this.isBookmarked.set(!was);
    this.menuOpen.set(false);

    this.isBookmarking.set(true);
    this.postsService.bookmarkPost(this.post().id).subscribe({
      next: () => {
        this.isBookmarking.set(false);
        this.bookmarkToggled.emit(!was);
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: was ? 'Removed from saved' : 'Post saved',
          showConfirmButton: false,
          timer: 1500,
        });
      },
      error: (err) => {
        console.log(err);
        this.isBookmarked.set(was);
        this.isBookmarking.set(false);
        Swal.fire({ title: 'Error', text: 'Could not update saved posts.', icon: 'error' });
      },
    });
  }

  //  Copy link 
  copyLink(): void {
    this.menuOpen.set(false);
    const url = `${location.origin}/postDetails/${this.post().id}`;

    navigator.clipboard.writeText(url).then(
      () =>
        Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success',
          title: 'Link copied',
          showConfirmButton: false,
          timer: 1500,
        }),
      () => Swal.fire({ title: 'Error', text: 'Could not copy the link.', icon: 'error' }),
    );
  }

  //  Delete 
  deletePost(): void {
    this.menuOpen.set(false);

    Swal.fire({
      title: 'Delete this post?',
      text: "You won't be able to undo this.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: () =>
        firstValueFrom(this.postsService.deletePost(this.post().id)).catch(() => {
          Swal.showValidationMessage('Could not delete the post. Try again.');
        }),
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleted.emit(this.post().id);
        Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1200, showConfirmButton: false });
      }
    });
  }

  //  Share 
  shareOpen = signal(false);
  shareText = signal('');
  isSharing = signal(false);

  openShare(): void {
    this.shareText.set('');
    this.shareOpen.set(true);
  }

  closeShare(): void {
    this.shareOpen.set(false);
  }

  onShareInput(event: Event): void {
    this.shareText.set((event.target as HTMLTextAreaElement).value);
  }

  sharePost(): void {
    if (this.isSharing() || !this.shareText().trim()) return;

    this.isSharing.set(true);
    this.postsService.sharePost(this.post().id, this.shareText().trim()).subscribe({
      next: () => {
        this.isSharing.set(false);
        this.shareOpen.set(false);
        this.postsService.postCreated$.next();
        Swal.fire({
          title: 'Post shared!',
          icon: 'success',
          timer: 1200,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        console.log(err);
        this.isSharing.set(false);
        Swal.fire({ title: 'Error', text: 'Could not share the post.', icon: 'error' });
      },
    });
  }

  //  Edit 
  editOpen = signal(false);
  editText = signal('');
  isEditing = signal(false);

  openEdit(): void {
    this.menuOpen.set(false);
    this.editText.set(this.post().body ?? '');
    this.editOpen.set(true);
  }

  closeEdit(): void {
    this.editOpen.set(false);
  }

  onEditInput(event: Event): void {
    this.editText.set((event.target as HTMLTextAreaElement).value);
  }

  saveEdit(): void {
    if (this.isEditing() || !this.editText().trim()) return;

    const formData = new FormData();
    formData.append('body', this.editText().trim());

    this.isEditing.set(true);
    this.postsService.updatePost(this.post().id, formData).subscribe({
      next: () => {
        this.isEditing.set(false);
        this.editOpen.set(false);
        this.postsService.postCreated$.next();
      },
      error: (err) => {
        console.log(err);
        this.isEditing.set(false);
        Swal.fire({ title: 'Error', text: 'Could not update the post.', icon: 'error' });
      },
    });
  }
}
