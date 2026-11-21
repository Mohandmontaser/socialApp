import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly httpClient = inject(HttpClient);

  getAllComments(postId: string, limit = 10): Observable<any> {
    return this.httpClient.get(`${environment.baseURL}posts/${postId}/comments`, {
      params: { limit },
    });
  }

  createComment(postId: string, data: FormData): Observable<any> {
    return this.httpClient.post(`${environment.baseURL}posts/${postId}/comments`, data);
  }

  updateComment(postId: string, commentId: string, data: FormData): Observable<any> {
    return this.httpClient.put(`${environment.baseURL}posts/${postId}/comments/${commentId}`, data);
  }

  deleteComment(postId: string, commentId: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseURL}posts/${postId}/comments/${commentId}`);
  }

  likeComment(postId: string, commentId: string): Observable<any> {
    return this.httpClient.put(`${environment.baseURL}posts/${postId}/comments/${commentId}/like`, {});
  }

  getReplies(postId: string, commentId: string): Observable<any> {
    return this.httpClient.get(`${environment.baseURL}posts/${postId}/comments/${commentId}/replies`);
  }

  createReply(postId: string, commentId: string, data: FormData): Observable<any> {
    return this.httpClient.post(
      `${environment.baseURL}posts/${postId}/comments/${commentId}/replies`,
      data
    );
  }
}