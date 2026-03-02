/** @type {const} */
const themeColors = {
  // Pure black background — Pillowtalk signature
  primary:    { light: '#C8B89A', dark: '#C8B89A' }, // warm sand/cream accent
  background: { light: '#000000', dark: '#000000' }, // pure black
  surface:    { light: '#111111', dark: '#111111' }, // slightly lifted surface
  foreground: { light: '#F5F0E8', dark: '#F5F0E8' }, // warm off-white text
  muted:      { light: '#6B6560', dark: '#6B6560' }, // warm grey muted
  border:     { light: 'rgba(255,255,255,0.07)', dark: 'rgba(255,255,255,0.07)' },
  success:    { light: '#8FAF8A', dark: '#8FAF8A' }, // sage green
  warning:    { light: '#C4A882', dark: '#C4A882' }, // warm amber
  error:      { light: '#C47A72', dark: '#C47A72' }, // dusty rose
  tint:       { light: '#C8B89A', dark: '#C8B89A' }, // same as primary
};

module.exports = { themeColors };
