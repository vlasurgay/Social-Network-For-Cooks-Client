import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SearchParams} from "../_models/search-params";
import {Observable} from "rxjs";
import {AccountInList} from "../_models/account-in-list";
import {Page} from "../_models/page";

const baseUrl = `${environment.serverUrl}/friends`;

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  searchParams: SearchParams;

  constructor(private http: HttpClient) {
  }

  private getAllFriends(currentPage: number, pageSize: number, searchParams: SearchParams): Observable<Page<AccountInList>> {
    return this.http.get<Page<AccountInList>>(
      baseUrl,
      {
        params: new HttpParams()
          .set('size', pageSize)
          .set('pageNum', currentPage)
          .set('search', searchParams.search)
          .set('order', searchParams.order == 'asc')
          .set('gender', searchParams.gender)
      }
    );
  }

  private getAccount(currentPage: number, pageSize: number, searchParams: SearchParams): Observable<Page<AccountInList>> {
    return this.http.get<Page<AccountInList>>(
      `${baseUrl}/new`,
      {
        params: new HttpParams()
          .set('size', pageSize)
          .set('pageNum', currentPage)
          .set('search', searchParams.search)
          .set('order', searchParams.order == 'asc')
          .set('gender', searchParams.gender)
      }
    );
  }

  getFriendsBySearch(search: SearchParams, pageSize: number): Observable<Page<AccountInList>> {
    this.searchParams = search;
    return this.getAllFriends(0, pageSize, search);
  }

  getFriendsByPageNum(currentPage: number, pageSize: number) {
    return this.getAllFriends(currentPage, pageSize, this.searchParams);
  }

  getAccountsByPageNum(currentPage: number, pageSize: number) {
    return this.getAccount(currentPage, pageSize, this.searchParams);
  }

  getAccountBySearch(search: SearchParams, pageSize: number) {
    this.searchParams = search;
    return this.getAccount(0, pageSize, this.searchParams);
  }

  getInvitesBySearch(search: SearchParams, pageSize: number) {
    this.searchParams = search;
    return this.getInvites(0, pageSize, this.searchParams);
  }

  createInvite(id: number) {
    return this.http.post(baseUrl, {}, {
      params: new HttpParams()
        .set('friendId', id)
    });
  }

  getInvitesByPageNum(currentPage: number, pageSize: number) {
    return this.getInvites(currentPage, pageSize, this.searchParams);
  }

  getInvites(currentPage: number, pageSize: number, searchParams: SearchParams): Observable<Page<AccountInList>> {
    return this.http.get<Page<AccountInList>>(`${baseUrl}/invites`, {
      params: new HttpParams()
        .set('size', pageSize)
        .set('pageNum', currentPage)
        .set('search', searchParams.search)
        .set('order', searchParams.order == 'asc')
        .set('gender', searchParams.gender)
    });
  }

  removeFried(id: number) {
    return this.http.delete(`${baseUrl}/` + id);
  }

  acceptInvite(id: number) {
    return this.http.patch(`${baseUrl}/invites/` + id, {});
  }

  declineInvite(id: number) {
    return this.http.delete(`${baseUrl}/invites/` + id);
  }
}