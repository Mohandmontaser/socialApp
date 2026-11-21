import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly httpClient = inject(HttpClient);

  postCreated$ = new Subject<void>();


  getCommunityPosts(page: number = 1, limit: number = 10): Observable<any> {
    return this.httpClient.get(environment.baseURL + 'posts', { params: { page, limit } });
  }

  getFeedPosts(page: number = 1, limit: number = 10): Observable<any> {
    return this.httpClient.get(environment.baseURL + 'posts/feed', { params: { page, limit } });
  }

  getAllPosts(): Observable<any> {
    return this.getCommunityPosts();
  }


  getSinglePost(postId: string): Observable<any> {
    return this.httpClient.get(environment.baseURL + `posts/${postId}`);
  }

  createPost(data: object): Observable<any> {
    return this.httpClient.post(environment.baseURL + 'posts', data);
  }

  updatePost(postId: string, data: FormData): Observable<any> {
    return this.httpClient.put(environment.baseURL + `posts/${postId}`, data);
  }

  deletePost(postId: string): Observable<any> {
    return this.httpClient.delete(environment.baseURL + `posts/${postId}`);
  }

  likePost(postId: string): Observable<any> {
    return this.httpClient.put(environment.baseURL + `posts/${postId}/like`, {});
  }

  bookmarkPost(postId: string): Observable<any> {
    return this.httpClient.put(environment.baseURL + `posts/${postId}/bookmark`, {});
  }



  sharePost(postId: string, body: string): Observable<any> {
    return this.httpClient.post(environment.baseURL + `posts/${postId}/share`, { body });
  }
}