import type { Meta, StoryObj } from '@storybook/angular';
import { ImageBlockComponent } from './image-block.component';

const meta: Meta<ImageBlockComponent> = {
  title: 'EmailBlocks/Image',
  component: ImageBlockComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ImageBlockComponent>;

export const Default: Story = {
  args: {
    src: 'https://placehold.co/600x200',
    alt: 'Sale banner',
  },
};
