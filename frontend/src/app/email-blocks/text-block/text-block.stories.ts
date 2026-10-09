import type { Meta, StoryObj } from '@storybook/angular';
import { TextBlockComponent } from './text-block.component';

const meta: Meta<TextBlockComponent> = {
  title: 'EmailBlocks/Text',
  component: TextBlockComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<TextBlockComponent>;

export const Default: Story = {
  args: {
    text: 'Check out our amazing deals this weekend.',
  },
};
