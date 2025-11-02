import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { LanguageService } from '../services/language.service';

@Injectable({ providedIn: 'root' })
export class LanguageGuard implements CanActivate {
  constructor(private langService: LanguageService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const lang = (route.params['lang'] || '').toLowerCase();
    if (lang === 'en' || lang === 'ar') {
      this.langService.apply(lang);
      return true;
    }
    return this.router.parseUrl('/');
  }
}
