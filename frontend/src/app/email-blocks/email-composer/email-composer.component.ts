import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EmailBlock,
  EmailBlockType,
  createBlock,
} from '../email-block.models';
import {
  serializeEmailBlocks,
  validateBlocksForSubmit,
} from '../email-block.serialize';
import { EmailBlockPreviewComponent } from '../email-block-preview/email-block-preview.component';

@Component({
  selector: 'app-email-composer',
  standalone: true,
  imports: [CommonModule, FormsModule, EmailBlockPreviewComponent],
  templateUrl: './email-composer.component.html',
  styleUrl: './email-composer.component.scss',
})
export class EmailComposerComponent {
  @Output() readonly bodyChange = new EventEmitter<string>();

  readonly blocks = signal<EmailBlock[]>([
    createBlock('header'),
    createBlock('text'),
  ]);
  readonly selectedId = signal<string | null>(this.blocks()[0]?.id ?? null);

  readonly selected = computed(() => {
    const id = this.selectedId();
    return this.blocks().find((block) => block.id === id) ?? null;
  });

  readonly serializedLength = computed(() => serializeEmailBlocks(this.blocks()).length);

  constructor() {
    this.emitBody();
  }

  addBlock(type: EmailBlockType): void {
    const block = createBlock(type);
    this.blocks.update((list) => [...list, block]);
    this.selectedId.set(block.id);
    this.emitBody();
  }

  selectBlock(id: string): void {
    this.selectedId.set(id);
  }

  removeSelected(): void {
    const id = this.selectedId();
    if (!id) {
      return;
    }

    this.blocks.update((list) => list.filter((block) => block.id !== id));
    this.selectedId.set(this.blocks()[0]?.id ?? null);
    this.emitBody();
  }

  patchSelected(patch: Partial<EmailBlock>): void {
    const id = this.selectedId();
    if (!id) {
      return;
    }

    this.blocks.update((list) =>
      list.map((block) => {
        if (block.id !== id) {
          return block;
        }
        return { ...block, ...patch } as EmailBlock;
      })
    );
    this.emitBody();
  }

  validationError(): string | null {
    return validateBlocksForSubmit(this.blocks());
  }

  private emitBody(): void {
    this.bodyChange.emit(serializeEmailBlocks(this.blocks()));
  }
}
