import { CommonModule, DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { Component, inject, OnInit, input, output } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly themeService = inject(ThemeService);

  isDarkMode = this.themeService.isDarkMode;
  isMobileMenuOpen = input<boolean>(false);
  toggleMenu = output<void>();

  ngOnInit() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.themeService.setDarkMode(isDark);
    this.applyTheme(isDark);
  }

  toggleDarkMode() {
    const newValue = !this.isDarkMode();
    this.themeService.setDarkMode(newValue);
    this.applyTheme(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean) {
    this.document.documentElement.classList.toggle('dark', isDark);
    this.document.body.classList.toggle('dark', isDark);

    // Update theme-color meta tag
    const themeColorMeta = this.document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isDark ? '#09090b' : '#ffffff');
    }
  }
}
