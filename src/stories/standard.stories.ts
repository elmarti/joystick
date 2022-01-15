import { Story, Meta } from '@storybook/html';

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Basic/Standard',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  // argTypes: {
  //   backgroundColor: { control: 'color' },
  //   label: { control: 'text' },
  //   onClick: { action: 'onClick' },
  //   primary: { control: 'boolean' },
  //   size: {
  //     control: { type: 'select' },
  //     options: ['small', 'medium', 'large'],
  //   },
  // },
} as Meta;

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template: Story<any> = (args) => {
  return `<joy-stick></joy-stick>`
};
//
export const Primary = Template.bind({});
// // More on args: https://storybook.js.org/docs/html/writing-stories/args
// Primary.args = {
//   primary: true,
//   label: 'Button',
// };
//
// export const Secondary = Template.bind({});
// Secondary.args = {
//   label: 'Button',
// };
//
// export const Large = Template.bind({});
// Large.args = {
//   size: 'large',
//   label: 'Button',
// };
//
// export const Small = Template.bind({});
// Small.args = {
//   size: 'small',
//   label: 'Button',
// };
