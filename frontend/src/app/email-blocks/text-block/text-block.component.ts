import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-text-block',
  standalone: true,
  template: `<p class="email-text-block mb-0" [innerText]="text"></p>`,
  styles: [
    `
      .email-text-block {
        white-space: pre-wrap;
        line-height: 1.5;
      }
    `,
  ],
})
export class TextBlockComponent {
  @Input({ required: true }) text = '';
}
