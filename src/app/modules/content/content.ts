import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, input, signal, effect, inject } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContentItem, MediaItem } from '../home/home';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet, MatTooltipModule],
  templateUrl: './content.html',
  styleUrl: './content.scss',
})
export class Content {
  items = input<ContentItem[]>([]);
  copiedCommand = signal<string | null>(null);
  copiedFileContent = signal<string | null>(null);
  fileContent = signal<Map<string, string>>(new Map());
  zoomedImage = signal<string | null>(null);
  isClosingZoom = signal<boolean>(false);

  private readonly themeService = inject(ThemeService);
  isDarkMode = this.themeService.isDarkMode;

  constructor(private readonly sanitizer: DomSanitizer, private readonly http: HttpClient) {
    // Load text/markdown files when items change
    effect(() => {
      const currentItems = this.items();
      this.loadAllTextFiles(currentItems);
    });
  }

  private loadAllTextFiles(items: ContentItem[]) {
    items.forEach((item) => {
      if (item.media && item.media.length > 0) {
        item.media.forEach((mediaItem) => {
          if (mediaItem.path && this.isTextFile(mediaItem.path)) {
            this.loadTextFile(mediaItem.path);
          }
        });
      }
      if (item.items && item.items.length > 0) {
        this.loadAllTextFiles(item.items);
      }
    });
  }

  private loadTextFile(filePath: string) {
    // Only load if not already loaded
    if (!this.fileContent().has(filePath)) {
      this.http.get(filePath, { responseType: 'text' }).subscribe({
        next: (content) => {
          const currentMap = new Map(this.fileContent());
          currentMap.set(filePath, content);
          this.fileContent.set(currentMap);
        },
        error: (error) => {
          console.error(`Failed to load file: ${filePath}`, error);
          const currentMap = new Map(this.fileContent());
          currentMap.set(filePath, `Error loading file: ${filePath}`);
          this.fileContent.set(currentMap);
        },
      });
    }
  }

  getFileContent(filePath: string): string {
    return this.fileContent().get(filePath) || 'Loading...';
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedCommand.set(text);
      setTimeout(() => this.copiedCommand.set(null), 5000);
    });
  }

  copyFileContentToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedFileContent.set(text);
      setTimeout(() => this.copiedFileContent.set(null), 5000);
    });
  }

  isImageFile(media: string): boolean {
    if (!media || typeof media !== 'string') return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    return imageExtensions.some((ext) => media.toLowerCase().endsWith(ext));
  }

  isTextFile(media: string): boolean {
    if (!media || typeof media !== 'string') return false;
    // Text files include markdown and other plain text files
    return !this.isImageFile(media);
  }

  isMarkdownFile(media: string): boolean {
    if (!media || typeof media !== 'string') return false;
    return media.toLowerCase().endsWith('.md');
  }

  renderDescription(text: string): SafeHtml {
    if (!text) return '';
    const htmlOrPromise = marked.parse(text);
    if (typeof htmlOrPromise === 'string') {
      return this.sanitizer.bypassSecurityTrustHtml(htmlOrPromise);
    }

    // If an async parse ever occurs (rare):
    htmlOrPromise.then(() => {}); // do nothing or handle asynchronously
    return this.sanitizer.bypassSecurityTrustHtml('');
  }

  filterMediaByTheme(mediaItems: MediaItem[]): MediaItem[] {
    if (!mediaItems || mediaItems.length === 0) return [];

    const currentTheme = this.isDarkMode() ? 'dark' : 'light';

    // Filter media items that match the current theme or are markdown (always shown)
    return mediaItems.filter(
      (item) =>
        item.variant === currentTheme || item.variant === 'markdown' || item.variant === 'common'
    );
  }

  openImageZoom(imagePath: string) {
    this.isClosingZoom.set(false);
    this.zoomedImage.set(imagePath);
  }

  closeImageZoom() {
    this.isClosingZoom.set(true);
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      this.zoomedImage.set(null);
      this.isClosingZoom.set(false);
    }, 200); // Match the longest animation duration (0.2s)
  }
}
