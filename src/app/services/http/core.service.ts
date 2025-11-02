import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppVars } from '../../vars/vars.const';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  readonly appVars = AppVars;
  protected __url: string = this.appVars.apiURL;
  constructor(protected http: HttpClient) {}

  get<T>(path: string, params?: any): Observable<T> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<T>(this.__url + path, { params: httpParams });
  }

  post<T>(path: string, payload: any): Observable<T> {
    return this.http.post<T>(this.__url + path, payload);
  }

  put<T>(path: string, payload: any): Observable<T> {
    return this.http.put<T>(this.__url + path, payload);
  }

  patch<T>(path: string, payload: any): Observable<T> {
    return this.http.patch<T>(this.__url + path, payload);
  }

  delete<T>(path: string, params?: any): Observable<T> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.delete<T>(this.__url + path, { params: httpParams });
  }

  filePost<T>(path: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    if (additionalData) {
      Object.keys(additionalData).forEach((key) => formData.append(key, additionalData[key]));
    }
    return this.http.post<T>(this.__url + path, formData);
  }

  fileDownload(path: string, filename: string): void {
    this.http.get(this.__url + path, { responseType: 'blob' }).subscribe((blob) => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    });
  }

  fileGet<T>(path: string, params?: any): Observable<T> {
    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<T>(this.__url + path, { params: httpParams });
  }

  search<T>(path: string, queryParams: any): Observable<T> {
    const httpParams = new HttpParams({ fromObject: queryParams });
    return this.http.get<T>(this.__url + path, { params: httpParams });
  }
}
