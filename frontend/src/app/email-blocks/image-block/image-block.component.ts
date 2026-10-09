import { Component, Input } from '@angular/core';
import { isSafeHttpUrl } from '../email-block.serialize';

@Component({
  selector: 'app-image-block',
  standalone: true,
  template: `
    @if (safeSrc) {
      <img class="email-image-block img-fluid" [src]="safeSrc" [alt]="alt" />
    } @else {
      <p class="text-secondary mb-0">Image URL missing or not http(s).</p>
    }
  `,
  styles: [
    `
      .email-image-block {
        display: block;
        max-width: 100%;
        height: auto;
      }
    `,
  ],
})
export class ImageBlockComponent {
  @Input() alt = '';

  private _src = '';
  safeSrc = '';

  @Input({ required: true })
  set src(value: string) {
    this._src = value;
    this.safeSrc = isSafeHttpUrl(value) ? value : '';
  }

  get src(): string {
    return this._src;
  }
}
