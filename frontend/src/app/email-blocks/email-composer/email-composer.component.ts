import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
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
export class EmailComposerComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private noticeTimer: ReturnType<typeof setTimeout> | null = null;

  @Input() subject = '';
  @Output() readonly bodyChange = new EventEmitter<string>();

  readonly blocks = signal<EmailBlock[]>(this.defaultBlocks());
  readonly selectedId = signal<string | null>(this.blocks()[0]?.id ?? null);
  readonly device = signal<'desktop' | 'mobile'>('desktop');
  readonly notice = signal<string | null>(null);

  readonly selected = computed(() => {
    const id = this.selectedId();
    return this.blocks().find((block) => block.id === id) ?? null;
  });

  readonly serializedLength = computed(() => serializeEmailBlocks(this.blocks()).length);
  readonly blockCountLabel = computed(() => {
    const count = this.blocks().length;
    return `${count} block${count === 1 ? '' : 's'}`;
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.clearNoticeTimer());
  }

  ngAfterViewInit(): void {
    this.emitBody();
  }

  addBlock(type: EmailBlockType): void {
    const block = createBlock(type);
    this.blocks.update((list) => [...list, block]);
    this.selectedId.set(block.id);
    this.emitBody();
    this.flash(`${type} block added`);
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
    this.flash('Block removed');
  }

  reset(): void {
    this.blocks.set(this.defaultBlocks());
    this.selectedId.set(this.blocks()[0]?.id ?? null);
    this.device.set('desktop');
    this.emitBody();
    this.flash('Blocks reset');
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

  serializedBody(): string {
    return serializeEmailBlocks(this.blocks());
  }

  private emitBody(): void {
    this.bodyChange.emit(serializeEmailBlocks(this.blocks()));
  }

  private defaultBlocks(): EmailBlock[] {
    return [createBlock('header'), createBlock('text')];
  }

  private flash(message: string): void {
    this.clearNoticeTimer();
    this.notice.set(message);
    this.noticeTimer = setTimeout(() => this.notice.set(null), 2300);
  }

  private clearNoticeTimer(): void {
    if (this.noticeTimer !== null) {
      clearTimeout(this.noticeTimer);
      this.noticeTimer = null;
    }
  }
}
