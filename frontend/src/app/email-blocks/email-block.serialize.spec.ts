import {
  escapeHtml,
  isSafeHttpUrl,
  serializeEmailBlocks,
  validateBlocksForSubmit,
} from './email-block.serialize';
import { EmailBlock } from './email-block.models';

describe('email-block.serialize', () => {
  it('escapes HTML in text content', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('rejects non-http URLs', () => {
    expect(isSafeHttpUrl('javascript:alert(1)')).toBeFalse();
    expect(isSafeHttpUrl('https://example.com/x')).toBeTrue();
  });

  it('serializes blocks into a template section', () => {
    const blocks: EmailBlock[] = [
      { id: '1', type: 'header', text: 'Hello <b>x</b>' },
      { id: '2', type: 'button', label: 'Go', href: 'https://example.com' },
    ];

    const html = serializeEmailBlocks(blocks);
    expect(html).toContain('<h1>Hello &lt;b&gt;x&lt;/b&gt;</h1>');
    expect(html).toContain('href="https://example.com"');
    expect(html).not.toContain('<b>x</b>');
  });

  it('requires at least one block', () => {
    expect(validateBlocksForSubmit([])).toContain('at least one');
  });
});
