/**
 * Centralized AdInjector utility
 * Safely handles dynamic injection, deduplication, delay scheduling,
 * viewport intersection observing, and cleanup of third-party ad network scripts
 * (Adsterra Social Bar, Popunder, Banner widgets, Native ads).
 *
 * Prevents memory leaks, duplicate script executions, and main-thread blocking,
 * significantly boosting initial page load performance (FCP, LCP).
 */

export type AdPlacementType = 
  | 'socialbar' 
  | 'popunder' 
  | 'topBanner' 
  | 'betweenSections' 
  | 'articleTop' 
  | 'articleMiddle' 
  | 'articleBottom' 
  | 'sidebar' 
  | string;

export interface AdInjectionOptions {
  /**
   * Delay in milliseconds before injecting the script.
   * Allows high-priority page content and images to render first.
   */
  delayMs?: number;

  /**
   * DOM element to observe via IntersectionObserver.
   * Script is only injected when this element comes near the viewport.
   */
  targetElement?: HTMLElement | null;

  /**
   * Target container DOM element where scripts/elements should be mounted.
   * Defaults to targetElement if provided, otherwise document.head.
   */
  targetContainer?: HTMLElement | null;

  /**
   * Viewport margin for IntersectionObserver before triggering injection.
   * Default: '250px 0px' (begins fetching smoothly before entering reader's view)
   */
  rootMargin?: string;

  /**
   * Intersection threshold (default: 0)
   */
  threshold?: number | number[];

  /**
   * Wait until the browser main thread is idle via requestIdleCallback.
   */
  idle?: boolean;

  /**
   * Callback fired once script injection is complete
   */
  onInjected?: () => void;
}

interface InjectedScriptEntry {
  elements: (HTMLScriptElement | HTMLElement)[];
  rawCode: string;
  injectedAt?: number;
  options?: AdInjectionOptions;
  observer?: IntersectionObserver | null;
  timerId?: ReturnType<typeof setTimeout> | null;
  idleId?: number | null;
  status: 'pending' | 'injected' | 'removed';
}

class AdInjectorService {
  private registry = new Map<AdPlacementType, InjectedScriptEntry>();

  /**
   * Cleans code by stripping HTML comments and surrounding whitespace
   */
  private sanitizeCode(code: string): string {
    if (!code) return '';
    return code.replace(/<!--[\s\S]*?-->/g, '').trim();
  }

  /**
   * Injects ad code into the DOM with support for:
   * 1. Viewport IntersectionObserver (lazy load ads only when near screen)
   * 2. Delay mechanism (postpone script loading to improve initial page load)
   * 3. Idle callback prioritization (requestIdleCallback)
   * 4. Deduplication and memory leak prevention
   *
   * @param placement - unique placement identifier ('socialbar', 'popunder', 'articleTop', etc.)
   * @param rawCode - script snippet, HTML containing <script>, or direct URL
   * @param options - optional scheduling and viewport observation parameters
   * @returns cleanup function to cancel pending tasks and remove injected scripts
   */
  public inject(
    placement: AdPlacementType,
    rawCode: string,
    options: AdInjectionOptions = {}
  ): () => void {
    const cleanCode = this.sanitizeCode(rawCode);

    // If empty or turned off, clean up existing instance for this placement
    if (!cleanCode) {
      this.remove(placement);
      return () => {};
    }

    // Check if identical code is already loaded or active
    const existing = this.registry.get(placement);
    if (existing && existing.rawCode === cleanCode && existing.status !== 'removed') {
      // Already actively tracked without changes
      return () => this.remove(placement);
    }

    // Remove any previously running script/timer for this placement
    this.remove(placement);

    // Create registry record with pending status
    const entry: InjectedScriptEntry = {
      elements: [],
      rawCode: cleanCode,
      options,
      status: 'pending',
      observer: null,
      timerId: null,
      idleId: null,
    };
    this.registry.set(placement, entry);

    // Pipeline to execute injection after delay/idle
    const scheduleExecution = () => {
      const executeInjection = () => {
        // Ensure this entry is still active in the registry
        if (this.registry.get(placement) !== entry || entry.status === 'removed') {
          return;
        }

        this.performDOMInjection(placement, cleanCode, options, entry);
      };

      const delay = options.delayMs ?? 0;

      if (delay > 0) {
        entry.timerId = setTimeout(() => {
          entry.timerId = null;
          if (options.idle && typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            entry.idleId = (window as any).requestIdleCallback(
              () => {
                entry.idleId = null;
                executeInjection();
              },
              { timeout: 2000 }
            );
          } else {
            executeInjection();
          }
        }, delay);
      } else if (options.idle && typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        entry.idleId = (window as any).requestIdleCallback(
          () => {
            entry.idleId = null;
            executeInjection();
          },
          { timeout: 2000 }
        );
      } else {
        // Immediate execution
        executeInjection();
      }
    };

    // Viewport IntersectionObserver Check
    if (options.targetElement && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      try {
        const observer = new IntersectionObserver(
          (entries) => {
            const isIntersecting = entries.some(
              (e) => e.isIntersecting || e.intersectionRatio > 0
            );

            if (isIntersecting) {
              // Target is near or within the viewport; trigger load and disconnect observer
              observer.disconnect();
              entry.observer = null;
              scheduleExecution();
            }
          },
          {
            rootMargin: options.rootMargin || '250px 0px',
            threshold: options.threshold ?? 0,
          }
        );

        entry.observer = observer;
        observer.observe(options.targetElement);
      } catch (err) {
        console.warn(`[AdInjector] IntersectionObserver initialization note for '${placement}':`, err);
        // Fallback: execute with standard scheduling if observer fails
        scheduleExecution();
      }
    } else {
      // No target element or IntersectionObserver unavailable: proceed with delay/idle scheduling
      scheduleExecution();
    }

    return () => this.remove(placement);
  }

  /**
   * Helper method to observe an element and inject ad code when visible
   */
  public observe(
    targetElement: HTMLElement,
    placement: AdPlacementType,
    rawCode: string,
    options: Omit<AdInjectionOptions, 'targetElement'> = {}
  ): () => void {
    return this.inject(placement, rawCode, {
      ...options,
      targetElement,
    });
  }

  /**
   * Performs the actual dynamic DOM injection of third-party ad scripts and elements
   */
  private performDOMInjection(
    placement: AdPlacementType,
    cleanCode: string,
    options: AdInjectionOptions,
    entry: InjectedScriptEntry
  ): void {
    const createdElements: (HTMLScriptElement | HTMLElement)[] = [];
    const container = options.targetContainer || options.targetElement || null;

    try {
      if (cleanCode.includes('<script')) {
        // HTML snippet with script tag(s) and possible HTML wrappers
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanCode, 'text/html');

        // Append non-script nodes if a container is specified
        if (container) {
          Array.from(doc.body.childNodes).forEach((node) => {
            if (node.nodeName !== 'SCRIPT') {
              const clone = node.cloneNode(true) as HTMLElement;
              clone.setAttribute('data-adinjector-placement', placement);
              container.appendChild(clone);
              createdElements.push(clone);
            }
          });
        }

        const parsedScripts = doc.querySelectorAll('script');
        parsedScripts.forEach((parsed, index) => {
          const s = document.createElement('script');
          s.setAttribute('data-adinjector-placement', placement);
          s.setAttribute('data-adinjector-index', index.toString());
          s.type = parsed.type || 'text/javascript';
          s.async = true;

          // Copy all custom attributes (e.g., data-*, id, etc.)
          Array.from(parsed.attributes).forEach((attr) => {
            if (attr.name !== 'src' && attr.name !== 'type') {
              s.setAttribute(attr.name, attr.value);
            }
          });

          if (parsed.src) {
            let src = parsed.getAttribute('src') || parsed.src;
            if (src.startsWith('//')) {
              src = window.location.protocol + src;
            }
            s.src = src;
          } else if (parsed.textContent) {
            s.textContent = parsed.textContent;
          }

          if (container) {
            container.appendChild(s);
          } else {
            document.head.appendChild(s);
          }
          createdElements.push(s);
        });
      } else if (
        cleanCode.startsWith('//') ||
        cleanCode.startsWith('http://') ||
        cleanCode.startsWith('https://')
      ) {
        // Direct script URL provided
        let src = cleanCode;
        if (src.startsWith('//')) {
          src = window.location.protocol + src;
        }

        const s = document.createElement('script');
        s.setAttribute('data-adinjector-placement', placement);
        s.type = 'text/javascript';
        s.async = true;
        s.src = src;

        if (container) {
          container.appendChild(s);
        } else {
          document.head.appendChild(s);
        }
        createdElements.push(s);
      } else {
        // Raw inline JavaScript code without <script> wrapper
        const s = document.createElement('script');
        s.setAttribute('data-adinjector-placement', placement);
        s.type = 'text/javascript';
        s.textContent = cleanCode;

        if (container) {
          container.appendChild(s);
        } else {
          document.head.appendChild(s);
        }
        createdElements.push(s);
      }

      entry.elements = createdElements;
      entry.status = 'injected';
      entry.injectedAt = Date.now();

      options.onInjected?.();
    } catch (err) {
      console.warn(`[AdInjector] Error mounting script for placement '${placement}':`, err);
    }
  }

  /**
   * Safely cancels pending timers/observers and removes all elements associated with a placement
   */
  public remove(placement: AdPlacementType): void {
    const entry = this.registry.get(placement);
    if (entry) {
      entry.status = 'removed';

      // Cancel pending timer
      if (entry.timerId) {
        clearTimeout(entry.timerId);
        entry.timerId = null;
      }

      // Cancel pending idle callback
      if (entry.idleId && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(entry.idleId);
        entry.idleId = null;
      }

      // Disconnect active IntersectionObserver
      if (entry.observer) {
        entry.observer.disconnect();
        entry.observer = null;
      }

      // Remove created DOM elements
      entry.elements.forEach((el) => {
        try {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        } catch (e) {
          // Ignore if node was already detached
        }
      });

      this.registry.delete(placement);
    }

    // Extra safeguard: remove any orphan nodes matching data attribute
    try {
      const orphans = document.querySelectorAll(`[data-adinjector-placement="${placement}"]`);
      orphans.forEach((el) => el.remove());
    } catch (e) {}
  }

  /**
   * Removes all registered injected scripts across all placements
   */
  public removeAll(): void {
    const placements = Array.from(this.registry.keys());
    placements.forEach((p) => this.remove(p));
  }

  /**
   * Checks if an ad placement currently has an active script injected into DOM
   */
  public isLoaded(placement: AdPlacementType): boolean {
    const entry = this.registry.get(placement);
    return entry?.status === 'injected';
  }

  /**
   * Checks if an ad placement is scheduled or awaiting viewport visibility
   */
  public isPending(placement: AdPlacementType): boolean {
    const entry = this.registry.get(placement);
    return entry?.status === 'pending';
  }

  /**
   * Returns current status of a placement ('idle', 'pending', 'injected')
   */
  public getStatus(placement: AdPlacementType): 'idle' | 'pending' | 'injected' {
    const entry = this.registry.get(placement);
    if (!entry) return 'idle';
    return entry.status === 'injected' ? 'injected' : 'pending';
  }
}

export const AdInjector = new AdInjectorService();
