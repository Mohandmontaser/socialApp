import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth-guard';
import { gustGuard } from './core/auth/guards/gust-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    canActivate: [gustGuard],
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(
        (m) => m.AuthLayoutComponent
      ),
    children: [
      {
        path: 'login',
        title: 'Login',
        loadComponent: () =>
          import('./features/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        title: 'Register',
        loadComponent: () =>
          import('./features/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: 'forget-password',
        title: 'Forgot Password',
        loadComponent: () =>
          import('./features/forget-password/forget-password.component').then(
            (m) => m.ForgetPasswordComponent
          ),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'profile',
        title: 'Profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'profile/:id',
        title: 'Profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'timeline',
        title: 'Timeline',
        loadComponent: () =>
          import('./features/timeline/timeline.component').then(
            (m) => m.TimelineComponent
          ),
        children: [
          {
            path: '',
            redirectTo: 'feed',
            pathMatch: 'full',
          },
          {
            path: 'feed',
            title: 'Feed',
            loadComponent: () =>
              import('./features/timeline/pages/feed/feed.component').then(
                (m) => m.FeedComponent
              ),
          },
          {
            path: 'my-posts',
            title: 'My Posts',
            loadComponent: () =>
              import('./features/timeline/pages/my-posts/my-posts.component').then(
                (m) => m.MyPostsComponent
              ),
          },
          {
            path: 'community',
            title: 'Community',
            loadComponent: () =>
              import('./features/timeline/pages/community/community.component').then(
                (m) => m.CommunityComponent
              ),
          },
          {
            path: 'saved',
            title: 'Saved Posts',
            loadComponent: () =>
              import('./features/timeline/pages/saved/saved.component').then(
                (m) => m.SavedComponent
              ),
          },
        ],
      },
      {
        path: 'suggestions',
        title: 'Suggestions',
        loadComponent: () =>
          import(
            './features/timeline/components/suggested-friends/components/suggestions-page/suggestions-page.component'
          ).then((m) => m.SuggestionsPageComponent),
      },
      {
        path: 'postDetails/:id',
        title: 'Post Details',
        loadComponent: () =>
          import('./features/post-details/post-details.component').then(
            (m) => m.PostDetailsComponent
          ),
      },
      {
        path: 'notification',
        title: 'Notifications',
        loadComponent: () =>
          import('./features/notification/notification.component').then(
            (m) => m.NotificationsComponent
          ),
      },
      {
        path: 'change',
        title: 'Change Password',
        loadComponent: () =>
          import('./features/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent
          ),
      },
    ],
  },
  {
    path: 'notFound',
    title: 'Page Not Found',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'notFound',
  },
];