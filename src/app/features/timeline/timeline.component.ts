import { Component } from '@angular/core';
import { LeftSidebarComponent } from "./components/left-sidebar/left-sidebar.component";
import { SuggestedFriendsComponent } from "./components/suggested-friends/suggested-friends.component";
import { CreatePostComponent } from "./components/create-post/create-post.component";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-timeline',
  imports: [LeftSidebarComponent, SuggestedFriendsComponent, CreatePostComponent, RouterOutlet],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.css',
})
export class TimelineComponent {}
