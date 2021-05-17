module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/budgets/' : '/',
  presets: [
    '@vue/cli-plugin-babel/preset'
  ]
}
