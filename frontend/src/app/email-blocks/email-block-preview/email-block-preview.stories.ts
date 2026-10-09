import type { Meta, StoryObj } from '@storybook/angular';
import { EmailBlockPreviewComponent } from './email-block-preview.component';

const meta: Meta<EmailBlockPreviewComponent> = {
  title: 'EmailBlocks/Preview',
  component: EmailBlockPreviewComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<EmailBlockPreviewComponent>;

export const SampleTemplate: Story = {
  args: {
    blocks: [
      { id: '1', type: 'header', text: 'Spring Sale' },
      { id: '2', type: 'text', text: '50% off this weekend only.' },
      {
        id: '3',
        type: 'image',
        src: 'https://placehold.co/600x200',
        alt: 'Banner',
      },
      { id: '4', type: 'button', label: 'Shop now', href: 'https://example.com' },
    ],
  },
};
