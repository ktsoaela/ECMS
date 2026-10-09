export type EmailBlockType = 'header' | 'text' | 'image' | 'button';

export interface HeaderBlock {
  id: string;
  type: 'header';
  text: string;
}

export interface TextBlock {
  id: string;
  type: 'text';
  text: string;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  src: string;
  alt: string;
}

export interface ButtonBlock {
  id: string;
  type: 'button';
  label: string;
  href: string;
}

export type EmailBlock = HeaderBlock | TextBlock | ImageBlock | ButtonBlock;

function newBlockId(): string {
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createBlock(type: EmailBlockType): EmailBlock {
  const id = newBlockId();

  switch (type) {
    case 'header':
      return { id, type, text: 'Campaign headline' };
    case 'text':
      return { id, type, text: 'Write your email copy here.' };
    case 'image':
      return {
        id,
        type,
        src: 'https://placehold.co/600x200',
        alt: 'Campaign image',
      };
    case 'button':
      return {
        id,
        type,
        label: 'Shop now',
        href: 'https://example.com',
      };
  }
}
