import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, input, signal, effect } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContentItem } from '../home/home';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

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
  copiedMarkdown = signal<string | null>(null);
  markdownContent = signal<Map<string, string>>(new Map());

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly http: HttpClient
  ) {
    // Load markdown files when items change
    effect(() => {
      const currentItems = this.items();
      this.loadAllMarkdownFiles(currentItems);
    });
  }

  private loadAllMarkdownFiles(items: ContentItem[]) {
    items.forEach(item => {
      if (item.media && item.media.length > 0) {
        item.media.forEach(mediaItem => {
          if (mediaItem.path && this.isMarkdownFile(mediaItem.path)) {
            this.loadMarkdownFile(mediaItem.path);
          }
        });
      }
      if (item.items && item.items.length > 0) {
        this.loadAllMarkdownFiles(item.items);
      }
    });
  }

  private loadMarkdownFile(filePath: string) {
    // Only load if not already loaded
    if (!this.markdownContent().has(filePath)) {
      this.http.get(filePath, { responseType: 'text' }).subscribe({
        next: (content) => {
          const currentMap = new Map(this.markdownContent());
          currentMap.set(filePath, content);
          this.markdownContent.set(currentMap);
        },
        error: (error) => {
          console.error(`Failed to load markdown file: ${filePath}`, error);
          const currentMap = new Map(this.markdownContent());
          currentMap.set(filePath, `Error loading file: ${filePath}`);
          this.markdownContent.set(currentMap);
        }
      });
    }
  }

  getMarkdownContent(filePath: string): string {
    return this.markdownContent().get(filePath) || 'Loading...';
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedCommand.set(text);
      setTimeout(() => this.copiedCommand.set(null), 5000);
    });
  }

  copyMarkdownToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedMarkdown.set(text);
      setTimeout(() => this.copiedMarkdown.set(null), 5000);
    });
  }

  isImageFile(media: string): boolean {
    if (!media || typeof media !== 'string') return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    return imageExtensions.some(ext => media.toLowerCase().endsWith(ext));
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


}
