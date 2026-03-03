/** @type {const} */
const themeColors = {
  // Co-Star aesthetic: pure white/black, no color, cold editorial
  primary:    { light: '#000000', dark: '#FFFFFF' },   // inverts with mode
  background: { light: '#FFFFFF', dark: '#000000' },
  surface:    { light: '#F7F7F7', dark: '#0D0D0D' },   // very subtle off-tone for cards
  foreground: { light: '#000000', dark: '#FFFFFF' },
  muted:      { light: '#555555', dark: '#AAAAAA' },
  border:     { light: '#DDDDDD', dark: '#222222' },
  success:    { light: '#000000', dark: '#FFFFFF' },
  warning:    { light: '#000000', dark: '#FFFFFF' },
  error:      { light: '#CC0000', dark: '#FF3333' },   // only red accent, like Co-Star's dot
};

module.exports = { themeColors };
