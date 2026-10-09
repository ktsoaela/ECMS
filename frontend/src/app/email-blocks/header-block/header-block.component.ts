import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-block',
  standalone: true,
  template: `<h1 class="email-header-block mb-0">{{ text }}</h1>`,
  styles: [
    `
      .email-header-block {
        font-size: 1.75rem;
        font-weight: 700;
        line-height: 1.25;
      }
    `,
  ],
})
export class HeaderBlockComponent {
  @Input({ required: true }) text = '';
}
