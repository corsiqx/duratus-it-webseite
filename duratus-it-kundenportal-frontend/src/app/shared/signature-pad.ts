import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';

/** Canvas for a handwritten signature (mouse, finger or pen via Pointer Events). */
@Component({
  selector: 'app-signature-pad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block' },
  template: `
    <canvas
      #canvas
      class="block h-40 w-full cursor-crosshair touch-none rounded-lg border-2 border-dashed bg-canvas transition-colors sm:h-44"
      [class]="hasSignature() ? 'border-primary' : 'border-slate-300 hover:border-slate-400'"
      role="img"
      aria-label="Unterschriftenfeld"
      (pointerdown)="start($event)"
      (pointermove)="move($event)"
      (pointerup)="end()"
      (pointercancel)="end()"
    ></canvas>
    <!-- Signature line with hint, purely decorative. -->
    <div class="pointer-events-none absolute inset-x-6 bottom-9 flex items-end gap-2 text-slate-300" aria-hidden="true">
      <span class="text-lg leading-none font-semibold">×</span>
      <span class="mb-1 h-px flex-1 bg-slate-300"></span>
    </div>
    @if (!hasSignature()) {
      <p class="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-6 text-center text-sm text-slate-400" aria-hidden="true">
        Hier unterschreiben
      </p>
    }
  `,
})
export class SignaturePad {
  readonly changed = output<boolean>();
  readonly hasSignature = signal(false);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private context: CanvasRenderingContext2D | null = null;
  private drawing = false;
  private last = { x: 0, y: 0 };

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const canvas = this.canvas().nativeElement;
      // Match the backing store to the rendered size (and pixel density) so strokes stay sharp.
      const observer = new ResizeObserver(() => this.resize());
      observer.observe(canvas);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  clear(): void {
    const canvas = this.canvas().nativeElement;
    this.context?.clearRect(0, 0, canvas.width, canvas.height);
    this.setHasSignature(false);
  }

  toDataUrl(): string {
    return this.canvas().nativeElement.toDataURL('image/png');
  }

  protected start(event: PointerEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    this.canvas().nativeElement.setPointerCapture(event.pointerId);
    this.drawing = true;
    this.last = this.point(event);
  }

  protected move(event: PointerEvent): void {
    if (!this.drawing || !this.context) return;
    // Coalesced events keep fast pen strokes smooth.
    const events = event.getCoalescedEvents?.() ?? [event];
    for (const item of events.length ? events : [event]) {
      const point = this.point(item);
      this.context.beginPath();
      this.context.moveTo(this.last.x, this.last.y);
      this.context.lineTo(point.x, point.y);
      this.context.stroke();
      this.last = point;
    }
    if (!this.hasSignature()) this.setHasSignature(true);
  }

  protected end(): void {
    this.drawing = false;
  }

  private point(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvas().nativeElement.getBoundingClientRect();
    const canvas = this.canvas().nativeElement;
    // Drawing coordinates start inside the border.
    return { x: event.clientX - rect.left - canvas.clientLeft, y: event.clientY - rect.top - canvas.clientTop };
  }

  private resize(): void {
    const canvas = this.canvas().nativeElement;
    const { clientWidth, clientHeight } = canvas;
    if (!clientWidth || !clientHeight) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(clientWidth * ratio);
    canvas.height = Math.round(clientHeight * ratio);
    this.context = canvas.getContext('2d');
    if (!this.context) return;
    this.context.scale(ratio, ratio);
    this.context.lineWidth = 2.2;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.strokeStyle = '#0d1f3c';
    // Resizing wipes the bitmap, so the signature has to be drawn again.
    this.setHasSignature(false);
  }

  private setHasSignature(value: boolean): void {
    this.hasSignature.set(value);
    this.changed.emit(value);
  }
}
