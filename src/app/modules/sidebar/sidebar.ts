import { Component, input, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentItem } from '../home/home';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit, OnDestroy {
  items = input<ContentItem[]>([]);
  activeSection = signal<string>('');
  private scrollListener?: () => void;
  private rafId?: number;
  private lastKnownScrollPosition = 0;
  private ticking = false;

  ngOnInit() {
    // Set up optimized scroll listener
    this.scrollListener = () => {
      this.lastKnownScrollPosition = window.scrollY;

      if (!this.ticking) {
        this.rafId = window.requestAnimationFrame(() => {
          this.handleScroll(this.lastKnownScrollPosition);
          this.ticking = false;
        });
        this.ticking = true;
      }
    };
    
    window.addEventListener('scroll', this.scrollListener, { passive: true });
    
    // Initial check
    this.handleScroll(window.scrollY);
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
    }
  }

  handleScroll(scrollY: number) {
    const sections = document.querySelectorAll('[id]');
    const scrollPosition = scrollY + 100; // Offset for header

    let currentSection = '';
    
    sections.forEach((section) => {
      const element = section as HTMLElement;
      const sectionTop = element.offsetTop;
      const sectionHeight = element.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = element.id;
      }
    });

    if (currentSection && this.activeSection() !== currentSection) {
      this.activeSection.set(currentSection);
    }
  }

  isActive(id: number): boolean {
    return this.activeSection() === id.toString();
  }

  scrollToSection(id: number) {
    const idString = id.toString();
    const element = document.getElementById(idString);
    
    if (!element) {
      console.error(`Element with id "${idString}" not found`);
      return;
    }
    
    // Check if it's the first element in the content
    const firstContentElement = document.querySelector('[id]');
    const isFirst = element === firstContentElement;
    
    // If it's the first element, scroll to top of page
    if (isFirst) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Check if it's near the bottom (last section)
      const documentHeight = document.documentElement.scrollHeight;
      const elementOffsetTop = element.offsetTop;
      
      // If element is in the last 20% of the page, scroll to bottom
      if (elementOffsetTop > documentHeight * 0.8) {
        window.scrollTo({ top: documentHeight, behavior: 'smooth' });
      } else {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
