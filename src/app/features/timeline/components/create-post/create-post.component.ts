import { PostsService } from '../post-card/services/posts.service';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import 'emoji-picker-element';
import { CurrentUserService } from '../../../../core/services/current-user.service';
@Component({
  selector: 'app-create-post',
  imports: [ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css',
})
export class CreatePostComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  readonly currentUser = inject(CurrentUserService);

  content = new FormControl('');
  privacy = new FormControl('public');
  file = signal<File | null>(null);
  fileSrc = signal('');
  isLoading = signal(false);

  privacyOpen = false;
  emojiOpen = false;

  ngOnInit(): void {
    if (!this.currentUser.user()) {
      this.currentUser.load();
    }
  }

  get privacyLabel(): string {
    switch (this.privacy.value) {
      case 'following':
        return 'Followers';
      case 'only_me':
        return 'Only me';
      default:
        return 'Public';
    }
  }

  selectPrivacy(value: string): void {
    this.privacy.setValue(value);
    this.privacyOpen = false;
  }

  changeFile(e: Event): void {
    const selectedFile = (e.target as HTMLInputElement).files?.[0];
    if (selectedFile) {
      this.file.set(selectedFile);
      this.fileSrc.set(URL.createObjectURL(selectedFile));
    }
  }

  removeFile(input: HTMLInputElement): void {
    this.file.set(null);
    this.fileSrc.set('');
    input.value = '';
  }

  onEmojiClick(event: any, textarea: HTMLTextAreaElement): void {
    const emoji = event.detail.unicode;
    const text = this.content.value ?? '';
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    this.content.setValue(text.slice(0, start) + emoji + text.slice(end));
    this.emojiOpen = false;

    requestAnimationFrame(() => {
      const caret = start + emoji.length;
      textarea.focus();
      textarea.setSelectionRange(caret, caret);
    });
  }

  submitForm(e: Event, fileInput: HTMLInputElement): void {
    e.preventDefault();

    if (!this.content.value?.trim() && !this.file()) return;

    const formData = new FormData();
    if (this.content.value) formData.append('body', this.content.value);
    if (this.file()) formData.append('image', this.file()!);
    if (this.privacy.value) formData.append('privacy', this.privacy.value);

    this.isLoading.set(true);
    this.postsService.createPost(formData).subscribe({
      next: () => {
        this.content.reset('');
        this.privacy.reset('public');
        this.removeFile(fileInput);
        this.isLoading.set(false);
        this.postsService.postCreated$.next();
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }
}
