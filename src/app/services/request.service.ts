import { Injectable } from '@angular/core';
import { CoreService } from './http/core.service';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Request {
  id: number;
  statuses?: {
    application?:
      | {
          status?: string;
        }[]
      | { status?: string };
  };
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class RequestService extends CoreService {
  private requestsSource = new BehaviorSubject<Request[]>([]);
  requests$ = this.requestsSource.asObservable();

  constructor(http: HttpClient) {
    super(http);
  }

  setRequests(requests: Request[]) {
    this.requestsSource.next(Array.isArray(requests) ? requests : []);
  }

  getRequests(): Request[] {
    return this.requestsSource.getValue() || [];
  }

  // --- API calls ---
  getCategories(): Observable<any> {
    return this.get('user/classifications/categories');
  }

  getSubCateogries_Sectors_Incubator(slug: any): Observable<any> {
    return this.get('user/classifications/sectors-sub-categories-incubators/' + slug);
  }

  getActivitiesOfSectors(slug: any): Observable<any> {
    return this.get('user/classifications/activities/' + slug);
  }

  getSubActivities_Entities(slug: any): Observable<any> {
    return this.get('user/classifications/entities-sub-activities/' + slug);
  }

  getNationalities(): Observable<any> {
    return this.get('user/classifications/nationalities');
  }

  createRequest(params: any): Observable<any> {
    return this.post('user/requests', params).pipe(
      tap((res: any) => {
        const current = this.getRequests();
        this.setRequests([...current, res.data.request.data].filter((r: Request) => r && r.id));
      })
    );
  }

  partialRequest(params: any): Observable<any> {
    return this.post('user/requests/partial', params).pipe(
      tap((res: any) => {
        const current = this.getRequests().filter((r: Request) => r && r.id);
        const updatedRequests = [...current];

        const index = updatedRequests.findIndex((r) => r.id === res.data.id);
        if (index > -1) {
          updatedRequests[index] = res.data; // update existing
        } else {
          updatedRequests.push(res.data.request.data); // add new draft
        }

        this.setRequests(updatedRequests.filter((r: Request) => r && r.id));

        // Optional: fetch fresh requests in background
        this.getAllRequests().subscribe();
      })
    );
  }

  getAllRequests(params?: any): Observable<any> {
    return this.get('user/requests' + (params || '')).pipe(
      tap((res: any) => {
        const data = res?.data?.request?.data?.filter((r: Request) => r && r.id) || [];
        this.setRequests(data);
      })
    );
  }

  getSingleRequest(id: number): Observable<any> {
    return this.get('user/requests/' + id);
  }

  searchRequests(params?: any): Observable<any> {
    return this.get('user/requests' + (params || ''));
  }

  getAllFormFields(params: any): Observable<any> {
    return this.get('user/classifications/form-fields' + params);
  }

  submitDocument(document: File, id: string, key: string): Observable<any> {
    const additionalData = { id, key };
    return this.filePost('user/requests/document', document, additionalData);
  }
}
