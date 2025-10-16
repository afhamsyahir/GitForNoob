import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentItem } from '../home/home';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  items = input<ContentItem[]>([]);
  activeId = input<string>('');
  navigate = output<void>();

  isActive(id: number): boolean {
    return this.activeId() === id.toString();
  }

  scrollToSection(id: number) {
    const idString = id.toString();
    const element = document.getElementById(idString);

    if (!element) {
      console.error(`Element with id "${idString}" not found`);
      return;
    }

    // Calculate position with offset for fixed header (80px)
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });

    // Emit navigation event to close mobile menu
    this.navigate.emit();
  }
}
