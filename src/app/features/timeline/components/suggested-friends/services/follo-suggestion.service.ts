import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FolloSuggestionService {
 private readonly httpClient = inject(HttpClient)
    getFollowSuggestions(limit: number = 10, page: number = 1): Observable<any> {
      return this.httpClient.get(`${environment.baseURL}users/suggestions`, {
        params: { limit, page },
      });
    }
  
    followUnfollowUser(userId: string): Observable<any> {
      return this.httpClient.put(`${environment.baseURL}users/${userId}/follow`, {});
    }
}
