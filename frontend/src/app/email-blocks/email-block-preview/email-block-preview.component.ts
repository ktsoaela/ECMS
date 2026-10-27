import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  styles: [
    `
      .preview-block-selected {
        outline: 2px solid #111;
        border-radius: 4px;
      }
    `,
  ],
  template: `
    <div class="email-block-preview border rounded p-3 bg-white">
      @for (block of blocks; track block.id) {
        <button
          type="button"
          class="preview-block mb-3 w-100 text-start border-0 bg-transparent p-0"
          [class.preview-block-selected]="block.id === selectedId"
          (click)="blockSelect.emit(block.id)"
        >
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
        </button>
      } @empty {
        <p class="text-secondary mb-0">Add blocks to preview the email.</p>
      }
    </div>
  `,
})
export class EmailBlockPreviewComponent {
  @Input({ required: true }) blocks: EmailBlock[] = [];
  @Input() selectedId: string | null = null;
  @Output() readonly blockSelect = new EventEmitter<string>();
}
