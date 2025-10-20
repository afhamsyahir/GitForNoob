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

    // Scroll to position the element so its top aligns with the reference line
    // Reference line: header (56px) + first margin (mb-20 = 80px) = 136px
    // We scroll to position the section's top just above this line
    const referenceLineY = 56 + 48; // 136px

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    // Position section so its top is about 20px above the reference line
    const offsetPosition = elementPosition - (referenceLineY - 20);

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth',
    });

    // Emit navigation event to close mobile menu
    this.navigate.emit();
  }
}
