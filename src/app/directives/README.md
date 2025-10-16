# SectionObserverDirective

A lightweight, performant Angular directive that uses the IntersectionObserver API to detect which section is currently visible in the viewport and emit its ID. Perfect for implementing scroll-based navigation highlighting.

## Features

- ✅ **Performant**: Uses native IntersectionObserver API (no scroll event listeners)
- ✅ **Lightweight**: No external dependencies
- ✅ **Bug-free**: Well-tested intersection logic
- ✅ **Flexible**: Configurable root margins and thresholds
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Standalone**: Can be imported directly without NgModule

## Installation

Simply copy the `section-observer.directive.ts` file to your project's directives folder.

## Basic Usage

### 1. Import the directive

```typescript
import { SectionObserverDirective } from './directives/section-observer.directive';

@Component({
  // ...
  imports: [SectionObserverDirective /* other imports */],
})
export class MyComponent {
  sectionIds = ['intro', 'features', 'pricing', 'contact'];
  activeSection = '';

  onActiveSection(id: string) {
    this.activeSection = id;
  }
}
```

### 2. Add to your template

```html
<main appSectionObserver [sectionIds]="sectionIds" (activeId)="onActiveSection($event)">
  <section id="intro">...</section>
  <section id="features">...</section>
  <section id="pricing">...</section>
  <section id="contact">...</section>
</main>
```

### 3. Use in navigation

```html
<nav>
  <a [class.active]="activeSection === 'intro'" href="#intro"> Intro </a>
  <a [class.active]="activeSection === 'features'" href="#features"> Features </a>
  <!-- ... -->
</nav>
```

## Advanced Example

### With Dynamic Content

```typescript
@Component({
  // ...
})
export class MyComponent implements OnInit {
  contentData = signal<ContentItem[]>([]);
  sectionIds = signal<string[]>([]);
  activeId = signal<string>('');

  ngOnInit() {
    // Load content from API
    this.loadContent().subscribe((data) => {
      this.contentData.set(data);

      // Extract all section IDs (including nested)
      const ids = this.extractAllIds(data);
      this.sectionIds.set(ids);
    });
  }

  onActiveId(id: string) {
    this.activeId.set(id);
  }

  private extractAllIds(items: ContentItem[]): string[] {
    const ids: string[] = [];
    const traverse = (items: ContentItem[]) => {
      items.forEach((item) => {
        ids.push(item.id.toString());
        if (item.items?.length) {
          traverse(item.items);
        }
      });
    };
    traverse(items);
    return ids;
  }
}
```

## Configuration

### Root Margin

The directive uses `rootMargin: '-100px 0px -50% 0px'` by default:

- **Top (-100px)**: Accounts for fixed header height
- **Bottom (-50%)**: Activates sections earlier for better UX

To adjust for a different header height, modify the `headerOffset` constant in the `findClosestSection()` method:

```typescript
const headerOffset = 80; // Change to your header height
```

### Threshold

The directive uses `threshold: 0` to detect sections as soon as any part enters the viewport. This ensures even small sections are detected.

## How It Works

1. **Observation**: The directive observes all elements with IDs provided in `sectionIds`
2. **Tracking**: Tracks which sections are currently visible in the viewport
3. **Calculation**: Calculates which visible section is closest to the top (just below header)
4. **Emission**: Emits that section's ID as the active section
5. **Cleanup**: Automatically disconnects observers when destroyed

## API

### Inputs

| Input        | Type       | Required | Description                     |
| ------------ | ---------- | -------- | ------------------------------- |
| `sectionIds` | `string[]` | Yes      | Array of element IDs to observe |

### Outputs

| Output     | Type     | Description                                  |
| ---------- | -------- | -------------------------------------------- |
| `activeId` | `string` | Emits the ID of the currently active section |

## Browser Support

IntersectionObserver is supported in all modern browsers:

- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

For older browsers, consider using a polyfill: [intersection-observer](https://www.npmjs.com/package/intersection-observer)

## Common Patterns

### Sidebar Navigation

```html
<aside>
  <nav>
    <a
      *ngFor="let item of navItems"
      [class.active]="activeId() === item.id"
      (click)="scrollToSection(item.id)"
    >
      {{ item.title }}
    </a>
  </nav>
</aside>

<main appSectionObserver [sectionIds]="sectionIds()" (activeId)="onActiveId($event)">
  <!-- sections -->
</main>
```

### Smooth Scroll

```typescript
scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  const headerOffset = 80;
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}
```

## License

MIT - Feel free to use in any project!
