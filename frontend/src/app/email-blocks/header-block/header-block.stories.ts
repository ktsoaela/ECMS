import type { Meta, StoryObj } from '@storybook/angular';
import { HeaderBlockComponent } from './header-block.component';

const meta: Meta<HeaderBlockComponent> = {
  title: 'EmailBlocks/Header',
  component: HeaderBlockComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<HeaderBlockComponent>;

export const Default: Story = {
  args: {
    text: 'Spring Sale',
  },
};
