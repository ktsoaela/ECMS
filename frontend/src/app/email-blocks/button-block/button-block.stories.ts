import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonBlockComponent } from './button-block.component';

const meta: Meta<ButtonBlockComponent> = {
  title: 'EmailBlocks/Button',
  component: ButtonBlockComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ButtonBlockComponent>;

export const Default: Story = {
  args: {
    label: 'Shop now',
    href: 'https://example.com',
  },
};
