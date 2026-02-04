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

    getAllUsers(type: any, params?: any): Observable<any> {
        return this.get(`admin/users/${type}` + params);
    }

    getUserById(type: any, id: any): Observable<any> {
        return this.get(`admin/users/${type}/${id}`);
    }

    createUser(type: any, params: any): Observable<any> {
        return this.post(`admin/users/${type}`, params);
    }

    updateUser(type: any, id: any, params?: any): Observable<any> {
        return this.put(`admin/users/${type}/${id}`, params);
    }

    deleteUser(type: any, id: any): Observable<any> {
        return this.delete(`admin/users/${type}/${id}`);
    }

    // ----------------------------
    // Roles CRUD
    // ----------------------------

    getAllRoles( params?: any): Observable<any> {
        return this.get(`admin/roles` + params);
    }

    getRoleById( id: any): Observable<any> {
        return this.get(`admin/roles/${id}`);
    }

    createRole( params: any): Observable<any> {
        return this.post(`admin/roles`, params);
    }

    updateRole( id: any, params?: any): Observable<any> {
        return this.put(`admin/roles/${id}`, params);
    }

    deleteRole( id: any): Observable<any> {
        return this.delete(`admin/roles/${id}`);
    }

    getRoleByType( type: any): Observable<any> {
        return this.get(`admin/roles-by-type/${type}`);
    }

}
