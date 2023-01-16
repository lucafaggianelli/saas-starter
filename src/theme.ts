import { Roboto } from '@next/font/google'
import { createTheme } from '@mui/material/styles'
import { LinkProps } from '@mui/material'
import NextLinkComposed from './components/Link';

export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

declare module '@mui/material/styles' {
  interface Palette {
    gray: Palette['primary'];
  }
  interface PaletteOptions {
    gray: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    gray: {
      light: '#efefef',
      main: 'darkgray',
      dark: '#404040'
    },
    primary: {
      main: '#29b6f6'
    },
    secondary: {
      main: '#ffa000'
    }
  },
  components: {
    MuiAvatar: {
      defaultProps: {
        variant: 'rounded'
      }
    },
    MuiGrid: {
      defaultProps: {
        spacing: 3
      }
    },
    MuiLink: {
      defaultProps: {
        component: NextLinkComposed,
        underline: 'hover'
      } as LinkProps
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: NextLinkComposed,
      }
    },
    MuiStack: {
      defaultProps: {
        alignItems: 'center',
        direction: 'row',
        spacing: 2
      }
    }
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
})

export default theme
