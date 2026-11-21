import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FolloSuggestionService } from './services/follo-suggestion.service';
import { SuggestedUser } from './models/suggested-user.interface';

@Component({
  selector: 'app-suggested-friends',
  imports: [RouterLink],
  templateUrl: './suggested-friends.component.html',
  styleUrl: './suggested-friends.component.css',
})
export class SuggestedFriendsComponent implements OnInit {
  private readonly folloSuggestionService = inject(FolloSuggestionService);
  friends = signal<SuggestedUser[]>([]);
  isLoading = signal(true);
  followingId = signal<string | null>(null);
  skeletonItems = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.folloSuggestionService.getFollowSuggestions(5, 1).subscribe({
      next: (res) => {
        this.friends.set(res.data.suggestions);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      },
    });
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
