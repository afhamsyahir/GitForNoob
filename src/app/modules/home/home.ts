import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Sidebar } from '../sidebar/sidebar';
import { Content } from '../content/content';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

export interface MediaItem {
  path: string;
  variant: 'light' | 'dark' | 'markdown' | 'common';
  ratio?: string; // Optional aspect ratio in CSS format like "3/2", "16/9", "4/3", "1/1"
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
})
export class Home implements OnInit {
  contentData = signal<ContentItem[]>([]);

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    this.http.get<ContentItem[]>('json/new-content.json').subscribe((data) => {
      this.contentData.set(data);
    });
  }
}
