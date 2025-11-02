import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

const RTL_LANGS = new Set(['ar']);

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private lang$ = new BehaviorSubject<'en' | 'ar'>('en');
  private dir$  = new BehaviorSubject<'ltr' | 'rtl'>('ltr');

  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'ar']);
    translate.setDefaultLang('en');
    this.apply('en'); // default
  }

  get currentLang$() { return this.lang$.asObservable(); }
  get dirObservable$() { return this.dir$.asObservable(); }
  get currentLang() { return this.lang$.value; }
  get currentDir() { return this.dir$.value; }

  apply(lang: 'en' | 'ar') {
    this.lang$.next(lang);
    this.translate.use(lang);
    const dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
    this.dir$.next(dir);

    // reflect on <html> for accessibility & CSS
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);
  }
}
