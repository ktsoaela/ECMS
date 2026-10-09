import { Component, Input } from '@angular/core';
import { EmailBlock } from '../email-block.models';
import { ButtonBlockComponent } from '../button-block/button-block.component';
import { HeaderBlockComponent } from '../header-block/header-block.component';
import { ImageBlockComponent } from '../image-block/image-block.component';
import { TextBlockComponent } from '../text-block/text-block.component';

@Component({
  selector: 'app-email-block-preview',
  standalone: true,
  imports: [
    HeaderBlockComponent,
    TextBlockComponent,
    ImageBlockComponent,
    ButtonBlockComponent,
  ],
  template: `
    <div class="email-block-preview border rounded p-3 bg-white">
      @for (block of blocks; track block.id) {
        <div class="mb-3">
          @switch (block.type) {
            @case ('header') {
              <app-header-block [text]="block.text" />
            }
            @case ('text') {
              <app-text-block [text]="block.text" />
            }
            @case ('image') {
              <app-image-block [src]="block.src" [alt]="block.alt" />
            }
            @case ('button') {
              <app-button-block [label]="block.label" [href]="block.href" />
            }
          }
        </div>
      } @empty {
        <p class="text-secondary mb-0">Add blocks to preview the email.</p>
      }
    </div>
  `,
})
export class EmailBlockPreviewComponent {
  @Input({ required: true }) blocks: EmailBlock[] = [];
}
