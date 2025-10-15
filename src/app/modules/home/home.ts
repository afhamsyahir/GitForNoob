import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Sidebar } from '../sidebar/sidebar';
import { Content } from '../content/content';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

export interface MediaItem {
  path: string;
  variant: 'light' | 'dark' | 'markdown' | 'common';
  title?: string; // Optional display title (if different from path)
}

export interface CommandItem {
  name: string;
  action: string;
  description?: string; // Optional comment/description for the command
}

export interface ContentItem {
  id: number;
  title: string;
  description: string;
  commands: CommandItem[];
  media: MediaItem[];
  items: ContentItem[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Sidebar, Content, Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  animations: [
    trigger('slideInOut', [
      state(
        'closed',
        style({
          transform: 'translateX(-100%)',
        })
      ),
      state(
        'open',
        style({
          transform: 'translateX(0)',
        })
      ),
      transition('closed <=> open', animate('300ms ease-in-out')),
    ]),
    trigger('fadeInOut', [
      state(
        'hidden',
        style({
          opacity: 0,
          pointerEvents: 'none',
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
          pointerEvents: 'auto',
        })
      ),
      transition('hidden <=> visible', animate('300ms ease-in-out')),
    ]),
  ],
})
export class Home implements OnInit {
  contentData = signal<ContentItem[]>([]);
  isMobileMenuOpen = signal<boolean>(false);

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    this.http.get<ContentItem[]>('json/new-content.json').subscribe((data) => {
      this.contentData.set(data);
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
