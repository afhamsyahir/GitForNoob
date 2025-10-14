import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private readonly document = inject(DOCUMENT);
  isDarkMode = signal(false);

  ngOnInit() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.isDarkMode.set(isDark);
    this.applyTheme(isDark);
  }

  toggleDarkMode() {
    const newValue = !this.isDarkMode();
    this.isDarkMode.set(newValue);
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
