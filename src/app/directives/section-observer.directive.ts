import { Directive, output, OnDestroy, input, effect } from '@angular/core';

/**
 * SectionObserverDirective
 *
 * A lightweight, performant directive that uses IntersectionObserver API to detect
 * which section is currently visible in the viewport and emit its ID. Perfect for
 * implementing scroll-based navigation highlighting.
 *
 * @example
 * ```html
 * <main
 *   appSectionObserver
 *   [sectionIds]="['section1', 'section2', 'section3']"
 *   (activeId)="onActiveSection($event)"
 * >
 *   <section id="section1">Content 1</section>
 *   <section id="section2">Content 2</section>
 *   <section id="section3">Content 3</section>
 * </main>
 * ```
 *
 * @usage
 * 1. Add the directive to a container element (usually <main> or a wrapper)
 * 2. Pass an array of section IDs via [sectionIds] input
 * 3. Listen to (activeId) output to receive the currently active section ID
 * 4. Use the active ID to highlight navigation items
 *
 * Configuration:
 * - rootMargin: '-100px 0px -50% 0px' - Adjusts when sections are considered "active"
 *   - Top: -100px accounts for fixed header height
 *   - Bottom: -50% provides better UX by activating sections earlier
 * - threshold: 0 - Sections are detected as soon as any part enters the viewport
 *
 * How it works:
 * - Observes all elements with IDs provided in sectionIds
 * - Tracks which sections are currently visible in the viewport
 * - Calculates which visible section is closest to the top (just below header)
 * - Emits that section's ID as the active section
 * - Automatically cleans up observers when destroyed
 *
 * @input sectionIds - Array of element IDs to observe (required)
 * @output activeId - Emits the ID of the currently active section
 */
@Directive({
  selector: '[appSectionObserver]',
  standalone: true,
})
export class SectionObserverDirective implements OnDestroy {
  /** Array of section IDs to observe for intersection */
  sectionIds = input.required<string[]>();

  /** Emits the ID of the currently active section */
  activeId = output<string>();

  private readonly observer?: IntersectionObserver;
  private readonly visibleSections = new Set<string>();

  constructor() {
    // Create observer with rootMargin to account for header height
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;

          if (entry.isIntersecting) {
            this.visibleSections.add(id);
          } else {
            this.visibleSections.delete(id);
          }
        });

        // Emit the topmost visible section
        this.emitActiveSection();
      },
      {
        // Adjust rootMargin: smaller bottom margin to catch child sections better
        rootMargin: '-100px 0px -50% 0px',
        // Lower threshold to trigger on even small intersections
        threshold: 0,
      }
    );

    // Watch for section IDs changes and observe elements
    effect(() => {
      const ids = this.sectionIds();

      if (ids.length === 0) {
        return;
      }

      // Disconnect previous observations
      this.observer?.disconnect();
      this.visibleSections.clear();

      // Wait for DOM to be ready, then observe
      // Use timeout to ensure content is fully rendered
      setTimeout(() => {
        this.observeSections(ids);
      }, 500);
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  /**
   * Observes all sections with the provided IDs
   * @param ids - Array of section IDs to observe
   */
  private observeSections(ids: string[]) {
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        this.observer?.observe(element);
      }
    });
  }

  /**
   * Emits the ID of the section that should be considered "active"
   * based on which sections are currently visible
   */
  private emitActiveSection() {
    if (this.visibleSections.size === 0) {
      return;
    }

    const activeId = this.findClosestSection();
    if (activeId) {
      this.activeId.emit(activeId);
    }
  }

  /**
   * Finds the section that should be considered "active" based on scroll position
   * @returns The ID of the section closest to the top of the viewport (after header)
   *
   * Algorithm:
   * 1. Get all visible sections with their positions relative to viewport
   * 2. Filter sections that are near the top (within headerOffset + 50px)
   * 3. Return the one closest to the header offset position
   * 4. If none are near the top, return the first visible section
   */
  private findClosestSection(): string | null {
    const ids = this.sectionIds();
    const headerOffset = 100; // Adjust this to match your header height

    // Find all visible sections with their positions
    const visibleWithPositions = ids
      .filter((id) => this.visibleSections.has(id))
      .map((id) => {
        const element = document.getElementById(id);
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        return {
          id,
          top: rect.top,
          distanceFromHeader: Math.abs(rect.top - headerOffset),
        };
      })
      .filter(
        (item): item is { id: string; top: number; distanceFromHeader: number } => item !== null
      );

    if (visibleWithPositions.length === 0) {
      return null;
    }

    // Find the section closest to just below the header
    const sectionsNearTop = visibleWithPositions.filter((item) => item.top <= headerOffset + 50);

    if (sectionsNearTop.length > 0) {
      // Return the one closest to the header
      const closest = sectionsNearTop.reduce(
        (closest, current) =>
          current.distanceFromHeader < closest.distanceFromHeader ? current : closest,
        sectionsNearTop[0]
      );
      return closest.id;
    }

    // If no section is near the top, return the first visible one
    return visibleWithPositions[0].id;
  }
}
