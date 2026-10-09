import { Component, Input } from '@angular/core';
import { isSafeHttpUrl } from '../email-block.serialize';

@Component({
  selector: 'app-button-block',
  standalone: true,
  template: `
    @if (safeHref) {
      <a class="btn btn-primary email-button-block" [href]="safeHref" rel="noopener noreferrer">
        {{ label }}
      </a>
    } @else {
      <span class="btn btn-secondary disabled">{{ label || 'Button' }}</span>
    }
  `,
})
export class ButtonBlockComponent {
  @Input({ required: true }) label = '';

  private _href = '';
  safeHref = '';

  @Input({ required: true })
  set href(value: string) {
    this._href = value;
    this.safeHref = isSafeHttpUrl(value) ? value : '';
  }

  get href(): string {
    return this._href;
  }
}
