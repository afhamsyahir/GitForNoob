import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  isDarkMode = signal(false);

  setDarkMode(isDark: boolean) {
    this.isDarkMode.set(isDark);
  }
}
