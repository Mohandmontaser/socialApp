import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FolloSuggestionService } from '../../services/follo-suggestion.service';
import { SuggestedUser } from '../../models/suggested-user.interface';

@Component({
  selector: 'app-suggestions-page',
  imports: [RouterLink],
  templateUrl: './suggestions-page.component.html',
  styleUrl: './suggestions-page.component.css',
})
export class SuggestionsPageComponent implements OnInit {
  private readonly folloSuggestionService = inject(FolloSuggestionService);

  friends = signal<SuggestedUser[]>([]);
  searchTerm = signal('');
  isLoading = signal(true);
  isLoadingMore = signal(false);
  hasMore = signal(false);
  followingId = signal<string | null>(null);
  skeletonItems = [1, 2, 3, 4, 5, 6];

  private page = 1;
  private readonly limit = 10;

  filteredFriends = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.friends();
    return this.friends().filter(
      (f) => f.name.toLowerCase().includes(term) || f.username.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.folloSuggestionService.getFollowSuggestions(this.limit, 1).subscribe({
      next: (res) => {
        this.friends.set(res.data.suggestions);
        this.hasMore.set(!!res.meta?.pagination?.nextPage);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
  }

  loadMore(): void {
    if (this.isLoadingMore()) return;

    this.isLoadingMore.set(true);
    this.page++;

    this.folloSuggestionService.getFollowSuggestions(this.limit, this.page).subscribe({
      next: (res) => {
        this.friends.update((list) => [...list, ...res.data.suggestions]);
        this.hasMore.set(!!res.meta?.pagination?.nextPage);
        this.isLoadingMore.set(false);
      },
      error: (err) => {
        console.log(err);
        this.page--;
        this.isLoadingMore.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  follow(friend: SuggestedUser): void {
    if (this.followingId()) return;

    this.followingId.set(friend._id);
    this.folloSuggestionService.followUnfollowUser(friend._id).subscribe({
      next: () => {
        this.friends.update((list) => list.filter((f) => f._id !== friend._id));
        this.followingId.set(null);
      },
      error: (err) => {
        console.log(err);
        this.followingId.set(null);
      },
    });
  }
}