import { EmailBlock } from './email-block.models';

/** Escape text so serialized HTML cannot inject markup from user input. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Allow only http(s) URLs for image src and button href. */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function serializeEmailBlocks(blocks: EmailBlock[]): string {
  const parts = blocks.map((block) => {
    switch (block.type) {
      case 'header':
        return `<h1>${escapeHtml(block.text)}</h1>`;
      case 'text':
        return `<p>${escapeHtml(block.text).replace(/\n/g, '<br>')}</p>`;
      case 'image': {
        const src = isSafeHttpUrl(block.src) ? escapeHtml(block.src) : '';
        const alt = escapeHtml(block.alt);
        return src ? `<img src="${src}" alt="${alt}">` : `<!-- omitted unsafe image -->`;
      }
      case 'button': {
        const href = isSafeHttpUrl(block.href) ? escapeHtml(block.href) : '#';
        const label = escapeHtml(block.label);
        return `<p><a href="${href}">${label}</a></p>`;
      }
    }
  });

  return `<section data-email-template="1">\n${parts.join('\n')}\n</section>`;
}

export function validateBlocksForSubmit(blocks: EmailBlock[]): string | null {
  if (blocks.length === 0) {
    return 'Add at least one content block to the email body.';
  }

  for (const block of blocks) {
    if (block.type === 'header' || block.type === 'text') {
      if (!block.text.trim()) {
        return 'Header and text blocks cannot be empty.';
      }
    }
    if (block.type === 'image') {
      if (!block.src.trim() || !isSafeHttpUrl(block.src)) {
        return 'Image blocks need a valid http(s) URL.';
      }
    }
    if (block.type === 'button') {
      if (!block.label.trim()) {
        return 'Button blocks need a label.';
      }
      if (!block.href.trim() || !isSafeHttpUrl(block.href)) {
        return 'Button blocks need a valid http(s) URL.';
      }
    }
  }

  const serialized = serializeEmailBlocks(blocks);
  if (serialized.length > 10000) {
    return 'Serialized email body exceeds 10,000 characters. Remove or shorten blocks.';
  }

  return null;
}
