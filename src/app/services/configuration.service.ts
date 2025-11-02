import { Injectable } from '@angular/core';
import { CoreService } from './http/core.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService extends CoreService {
    constructor(http: HttpClient) {
        super(http);
    }

    // ----------------------------
    // Categories CRUD
    // ----------------------------

    getCategories(params?: any): Observable<any> {
        return this.get('admin/categories'+params);
    }

    getCategoryById(id: any): Observable<any> {
        return this.get(`admin/categories/${id}`);
    }

    createCategory(params: any): Observable<any> {
        return this.post('admin/categories', params);
    }

    updateCategory(id: any, params: any): Observable<any> {
        return this.put(`admin/categories/${id}`, params);
    }

    deleteCategory(id: any): Observable<any> {
        return this.delete(`admin/categories/${id}`);
    }

    // ----------------------------
    // Sub Categories CRUD
    // ----------------------------

    getSubCategories(params?: any): Observable<any> {
        return this.get('admin/sub-categories'+params);
    }

    getSubCategoryById(id: any): Observable<any> {
        return this.get(`admin/sub-categories/${id}`);
    }

    createSubCategory(params: any): Observable<any> {
        return this.post('admin/sub-categories', params);
    }

    updateSubCategory(id: any, params: any): Observable<any> {
        return this.put(`admin/sub-categories/${id}`, params);
    }

    deleteSubCategory(id: any): Observable<any> {
        return this.delete(`admin/sub-categories/${id}`);
    }

    // ----------------------------
    // Sectors CRUD
    // ----------------------------

    getSectors(params?: any): Observable<any> {
        return this.get('admin/sectors'+params);
    }

    getSectorById(id: any): Observable<any> {
        return this.get(`admin/sectors/${id}`);
    }

    createSector(params: any): Observable<any> {
        return this.post('admin/sectors', params);
    }

    updateSector(id: any, params: any): Observable<any> {
        return this.put(`admin/sectors/${id}`, params);
    }

    deleteSector(id: any): Observable<any> {
        return this.delete(`admin/sectors/${id}`);
    }

    // ----------------------------
    // Activities CRUD
    // ----------------------------

    getActivities(params?: any): Observable<any> {
        return this.get('admin/activities'+params);
    }

    getActivityById(id: any): Observable<any> {
        return this.get(`admin/activities/${id}`);
    }

    createActivity(params: any): Observable<any> {
        return this.post('admin/activities', params);
    }

    updateActivity(id: any, params: any): Observable<any> {
        return this.put(`admin/activities/${id}`, params);
    }

    deleteActivity(id: any): Observable<any> {
        return this.delete(`admin/activities/${id}`);
    }

    // ----------------------------
    // Sub Activities CRUD
    // ----------------------------

    getSubActivities(params?: any): Observable<any> {
        return this.get('admin/sub-activities'+params);
    }

    getSubActivityById(id: any): Observable<any> {
        return this.get(`admin/sub-activities/${id}`);
    }

    createSubActivity(params: any): Observable<any> {
        return this.post('admin/sub-activities', params);
    }

    updateSubActivity(id: any, params: any): Observable<any> {
        return this.put(`admin/sub-activities/${id}`, params);
    }

    deleteSubActivity(id: any): Observable<any> {
        return this.delete(`admin/sub-activities/${id}`);
    }

    // ----------------------------
    // Entities CRUD
    // ----------------------------

    getEntities(params?: any): Observable<any> {
        return this.get('admin/entities'+params);
    }

    getEntityById(id: any): Observable<any> {
        return this.get(`admin/entities/${id}`);
    }

    createEntity(params: any): Observable<any> {
        return this.post('admin/entities', params);
    }

    updateEntity(id: any, params: any): Observable<any> {
        return this.put(`admin/entities/${id}`, params);
    }

    deleteEntity(id: any): Observable<any> {
        return this.delete(`admin/entities/${id}`);
    }

    // ----------------------------
    // Incubators CRUD
    // ----------------------------

    getIncubators(params?: any): Observable<any> {
        return this.get('admin/incubators'+params);
    }

    getIncubatorById(id: any): Observable<any> {
        return this.get(`admin/incubators/${id}`);
    }

    createIncubator(params: any): Observable<any> {
        return this.post('admin/incubators', params);
    }

    updateIncubator(id: any, params: any): Observable<any> {
        return this.put(`admin/incubators/${id}`, params);
    }

    deleteIncubator(id: any): Observable<any> {
        return this.delete(`admin/incubators/${id}`);
    }

    // ----------------------------
    // Incubators CRUD
    // ----------------------------

    getFormFields(params?: any): Observable<any> {
        return this.get('admin/form-fields'+params);
    }

    getFormFieldId(id: any): Observable<any> {
        return this.get(`admin/form-fields/${id}`);
    }

    createFormField(params: any): Observable<any> {
        return this.post('admin/form-fields', params);
    }

    updateFormField(id: any, params: any): Observable<any> {
        return this.put(`admin/form-fields/${id}`, params);
    }

    deleteFormField(id: any): Observable<any> {
        return this.delete(`admin/form-fields/${id}`);
    }

    // ----------------------------
    // Globle Services
    // ----------------------------

    getSubCateogries_Sectors_Incubator(slug: any): Observable<any> {
        return this.get('user/classifications/sectors-sub-categories-incubators/'+ slug);
    }

    getActivitiesOfSectors(slug: any): Observable<any> {
        return this.get('user/classifications/activities/'+ slug);
    }

    getSubActivities_Entities(slug: any): Observable<any> {
        return this.get('user/classifications/entities-sub-activities/'+ slug);
    }
}
