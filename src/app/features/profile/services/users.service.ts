import { environment } from '../../../../environments/environment';

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly httpClient = inject(HttpClient);

  uploadProfilePhoto(photo: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', photo);

    return this.httpClient.put(`${environment.baseURL}users/upload-photo`, formData);
  }

  getMyProfile(): Observable<any> {
    return this.httpClient.get(`${environment.baseURL}users/profile-data`);
  }

  getBookmarks(): Observable<any> {
    return this.httpClient.get(`${environment.baseURL}users/bookmarks`);
  }

  getFollowSuggestions(limit: number = 10): Observable<any> {
    return this.httpClient.get(`${environment.baseURL}users/suggestions?limit=${limit}`);
  }

  getUserProfile(userId: string): Observable<any> {
    return this.httpClient.get(`${environment.baseURL}users/${userId}/profile`);
  }

  followUnfollowUser(userId: string): Observable<any> {
    return this.httpClient.put(`${environment.baseURL}users/${userId}/follow`, {});
  }


 getUserPosts(userId: string): Observable<any> {
  return this.httpClient.get(
    `${environment.baseURL}users/${userId}/posts`
  );
}
}
