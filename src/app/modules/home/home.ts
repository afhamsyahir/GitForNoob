import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Sidebar } from '../sidebar/sidebar';
import { Content } from '../content/content';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

export interface MediaItem {
  path: string;
}

export interface ContentItem {
  id: number;
  title: string;
  description: string;
  command: string;
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
    this.http.get<ContentItem[]>('/json/content.json').subscribe((data) => {
      this.contentData.set(data);
    });
  }
}
