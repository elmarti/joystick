module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../stencil-component/src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
      "@storybook/addon-actions"

  ],
  "framework": "@storybook/react"
}