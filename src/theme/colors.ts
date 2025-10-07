export const colors = {
  // Primary colors
  primary:'#1BAD7A',
  primaryDark:'#004334',
  secondary:'#FFEBCC',
  textWhite:'#F6F6F6',
  chatDark:'#373B3F',
  text:'#191D21',
  darkGray:'#5F6367',
  borderColor:'#D9D9D9',
  textLight:'#191D2180',
  placeholder:'#191D21B2',
  background:'#F6F6F6',
  error:'#E84545',
  success:'#1BAD7A',
  warning:'#FFEBCC',
  info:'#1BAD7A',
  light:'#F6F6F6',
  dark:'#191D21',
  border:'#E84545',

} as const;

export type ColorKeys = keyof typeof colors;
export type ColorShades = keyof typeof colors.primary;
