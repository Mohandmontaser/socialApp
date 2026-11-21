import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommentsService } from '../../services/comments.service';
import { Comment } from '../../models/comment.interface';
import { UsersService } from '../../../../../profile/services/users.service';
import { ProfileUser } from '../../../../../profile/models/profile-user.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comments',
  imports: [DatePipe],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css',
})
export class CommentsComponent implements OnInit {
  private readonly commentsService = inject(CommentsService);
  private readonly usersService = inject(UsersService);

  postId = input.required<string>();

  allComments = signal<Comment[]>([]);
  currentUser = signal<ProfileUser>({} as ProfileUser);

 
  commentText = signal('');
  commentImage = signal<File | null>(null);
  isSending = signal(false);

  editingId = signal<string | null>(null);
  editText = signal('');

  replyingId = signal<string | null>(null);
  replyText = signal('');
  repliesMap = signal<Record<string, Comment[]>>({});

  ngOnInit(): void {
    this.getCurrentUser();
    this.getComments();
  }

  getCurrentUser(): void {
    this.usersService.getMyProfile().subscribe({
      next: (res) => this.currentUser.set(res.data.user),
      error: (err) => console.log(err),
    });
  }

  getComments(): void {
    this.commentsService.getAllComments(this.postId(), 10).subscribe({
      next: (res) => this.allComments.set(res.data.comments),
      error: (err) => console.log(err),
    });
  }

  onCommentInput(event: Event): void {
    this.commentText.set((event.target as HTMLTextAreaElement).value);
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.commentImage.set(file);
  }

  canSend(): boolean {
    return (this.commentText().trim().length > 0 || !!this.commentImage()) && !this.isSending();
  }

  sendComment(): void {
    if (!this.canSend()) return;

    const formData = new FormData();
    if (this.commentText().trim()) formData.append('content', this.commentText().trim());
    if (this.commentImage()) formData.append('image', this.commentImage()!);

    this.isSending.set(true);
    this.commentsService.createComment(this.postId(), formData).subscribe({
      next: () => {
        this.commentText.set('');
        this.commentImage.set(null);
        this.isSending.set(false);
        this.getComments();
      },
      error: (err) => {
        console.log(err);
        this.isSending.set(false);
      },
    });
  }

  //  Like 
  isLiked(comment: Comment): boolean {
    return comment.likes.includes(this.currentUser()._id);
  }

  toggleLike(comment: Comment, parentId?: string): void {
    this.commentsService.likeComment(this.postId(), comment._id).subscribe({
      next: () => {
        const myId = this.currentUser()._id;
        const liked = comment.likes.includes(myId);
        comment.likes = liked
          ? comment.likes.filter((id) => id !== myId)
          : [...comment.likes, myId];

        if (parentId) {
          this.repliesMap.update((m) => ({ ...m, [parentId]: [...m[parentId]] }));
        } else {
          this.allComments.update((list) => [...list]);
        }
      },
      error: (err) => console.log(err),
    });
  }

  //  Edit 
  isMine(comment: Comment): boolean {
    return comment.commentCreator._id === this.currentUser()._id;
  }

  startEdit(comment: Comment): void {
    this.editingId.set(comment._id);
    this.editText.set(comment.content);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editText.set('');
  }

  onEditInput(event: Event): void {
    this.editText.set((event.target as HTMLTextAreaElement).value);
  }

  saveEdit(comment: Comment, parentId?: string): void {
    if (!this.editText().trim()) return;

    const formData = new FormData();
    formData.append('content', this.editText().trim());

    this.commentsService.updateComment(this.postId(), comment._id, formData).subscribe({
      next: () => {
        this.cancelEdit();
        parentId ? this.loadReplies(parentId) : this.getComments();
      },
      error: (err) => console.log(err),
    });
  }

  //  Delete 
  deleteComment(comment: Comment, parentId?: string): void {
    Swal.fire({
      title: 'Delete this comment?',
      text: "You won't be able to undo this.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.commentsService.deleteComment(this.postId(), comment._id).subscribe({
        next: () => {
          parentId ? this.loadReplies(parentId) : this.getComments();
          Swal.fire({
            title: 'Deleted!',
            icon: 'success',
            timer: 1200,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          console.log(err);
          Swal.fire({ title: 'Error', text: 'Could not delete the comment.', icon: 'error' });
        },
      });
    });
  }

  //  Replies 
  toggleReplies(comment: Comment): void {
    if (this.repliesMap()[comment._id]) {
      this.repliesMap.update((m) => {
        const copy = { ...m };
        delete copy[comment._id];
        return copy;
      });
    } else {
      this.loadReplies(comment._id);
    }
  }

  loadReplies(commentId: string): void {
    this.commentsService.getReplies(this.postId(), commentId).subscribe({
      next: (res) => this.repliesMap.update((m) => ({ ...m, [commentId]: res.data.replies })),
      error: (err) => console.log(err),
    });
  }

  startReply(commentId: string): void {
    this.replyingId.set(this.replyingId() === commentId ? null : commentId);
    this.replyText.set('');
  }

  onReplyInput(event: Event): void {
    this.replyText.set((event.target as HTMLTextAreaElement).value);
  }

  sendReply(comment: Comment): void {
    if (!this.replyText().trim()) return;

    const formData = new FormData();
    formData.append('content', this.replyText().trim());

    this.commentsService.createReply(this.postId(), comment._id, formData).subscribe({
      next: () => {
        this.replyingId.set(null);
        this.replyText.set('');
        this.loadReplies(comment._id);
        this.getComments(); 
      },
      error: (err) => console.log(err),
    });
  }
}
