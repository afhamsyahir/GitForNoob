import { Directive, output, OnDestroy, input, effect } from '@angular/core';

/**
 * SectionObserverDirective
 *
 * A lightweight, performant directive that uses IntersectionObserver API to detect
 * which section is currently visible in the viewport and emit its ID. Perfect for
 * implementing scroll-based navigation highlighting.
 *
 * Uses a visual reference line approach: detects which section crosses the reference
 * line positioned at header height + first margin level.
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
 * Detection Strategy:
 * - Reference line is positioned at: 120px from viewport top
 * - A section becomes "active" when its top edge is closest to this reference line
 * - This visual approach naturally handles all margin levels (mb-20, my-12, my-8)
 *
 * Configuration:
 * - rootMargin: '-56px 0px -200px 0px' - IntersectionObserver detection zone
 *   - Top: -56px accounts for fixed header height
 *   - Bottom: -200px to catch sections as they come into view
 * - threshold: 0 - Triggers on any intersection change
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

  /** Enable debug mode to show visual reference line and console logs */
  debugMode = input<boolean>(false);

  private readonly observer?: IntersectionObserver;
  private readonly visibleSections = new Set<string>();
  private debugLine: HTMLElement | null = null;
  private scrollTimerId: number | null = null;

  constructor() {
    // Create observer with rootMargin to account for fixed header
    // rootMargin: '-56px 0px -200px 0px'
    //   - Top: -56px accounts for fixed header (h-14)
    //   - Bottom: -200px to catch sections as they come into view
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;

          if (entry.isIntersecting) {
            this.visibleSections.add(id);
          } else {
            this.visibleSections.delete(id);
          }
        }

        // Emit the active section
        this.emitActiveSection();
      },
      {
        rootMargin: '-56px 0px -200px 0px',
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
    this.debugLine?.remove();
    if (this.scrollTimerId !== null) {
      clearTimeout(this.scrollTimerId);
    }
  }

  /**
   * Observes all sections with the provided IDs
   * @param ids - Array of section IDs to observe
   */
  private observeSections(ids: string[]) {
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) {
        this.observer?.observe(element);
      }
    }

    // Create debug visual line
    this.createDebugLine();

    // Add scroll event listener for continuous detection
    globalThis.addEventListener('scroll', () => {
      if (this.scrollTimerId !== null) {
        clearTimeout(this.scrollTimerId);
      }
      this.scrollTimerId = globalThis.setTimeout(() => {
        this.emitActiveSection();
      }, 50); // Throttle to 50ms
    });
  }

  /**
   * Creates a visual debug line showing the reference line position
   */
  private createDebugLine() {
    if (!this.debugMode()) {
      return;
    }

    const referenceLineY = 120;

    // Remove existing debug line
    this.debugLine?.remove();

    // Create new debug line element
    this.debugLine = document.createElement('div');
    this.debugLine.style.cssText = `
      position: fixed;
      top: ${referenceLineY}px;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #ff0000, #ff0000 50%, transparent 50%, transparent);
      background-size: 10px 100%;
      z-index: 9999;
      pointer-events: none;
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
    `;

    // Add label
    const label = document.createElement('div');
    label.style.cssText = `
      position: fixed;
      top: ${referenceLineY - 20}px;
      left: 10px;
      background: rgba(255, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      z-index: 10000;
      pointer-events: none;
    `;
    label.textContent = `Reference Line: ${referenceLineY}px`;

    document.body.appendChild(this.debugLine);
    document.body.appendChild(label);
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

  private findClosestSection(): string | null {
    const ids = this.sectionIds();

    // Reference line position: just below the header (56px) + small buffer for comfort
    // We detect which section's top edge is closest to this reference line
    // Lowered to 120px to catch sections earlier as they enter the viewport
    const referenceLineY = 148; // 120px

    // Get all visible sections with their positions
    const sectionsInView = ids
      .filter((id) => this.visibleSections.has(id))
      .map((id) => {
        const element = document.getElementById(id);
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        return {
          id,
          top: rect.top,
        };
      })
      .filter((item): item is { id: string; top: number } => item !== null);

    if (sectionsInView.length === 0) {
      return null;
    }

    // Find the section whose top is closest to the reference line
    // This naturally prefers visible sections that are actually in the reading area
    const closest = sectionsInView.reduce((closest, current) => {
      const closestDistance = Math.abs(closest.top - referenceLineY);
      const currentDistance = Math.abs(current.top - referenceLineY);
      return currentDistance < closestDistance ? current : closest;
    }, sectionsInView[0]);

    // DEBUG: Log all visible sections and their distances
    if (this.debugMode()) {
      console.log('=== Scroll Detection ===');
      for (const section of sectionsInView) {
        const distance = Math.abs(section.top - referenceLineY);
        const isClosest = section.id === closest.id ? ' ✓ CLOSEST' : '';
        console.log(
          `ID: ${section.id}, Top: ${section.top.toFixed(1)}px, Distance: ${distance.toFixed(
            1
          )}px${isClosest}`
        );
      }
      console.log(`Active Section: ${closest.id}`);
      console.log('========================');
    }

    return closest.id;
  }
}
