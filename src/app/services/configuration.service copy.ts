import { Injectable } from '@angular/core';
import { CoreService } from './http/core.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AdministrationService extends CoreService {
    constructor(http: HttpClient) {
        super(http);
    }

    // ----------------------------
    // Users CRUD
    // ----------------------------

    getAllUsers(params?: any): Observable<any> {
        return this.get('admin/users' + params);
    }

    getUserById(id: any): Observable<any> {
        return this.get(`admin/users/${id}`);
    }

    createUser(params: any): Observable<any> {
        return this.post('admin/users', params);
    }

    updateUser(id: any, params: any): Observable<any> {
        return this.put(`admin/users/${id}`, params);
    }

    deleteUser(id: any): Observable<any> {
        return this.delete(`admin/users/${id}`);
    }

}
