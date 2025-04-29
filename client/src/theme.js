import { extendTheme } from '@chakra-ui/react';
import { tableTheme } from './components/shared/TableStyles';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
  colors: {
    brand: {
      50: '#E5F4FF',
      100: '#B8E1FF',
      200: '#8ACEFF',
      300: '#5CBBFF',
      400: '#2EA8FF',
      500: '#0095FF',
      600: '#0077CC',
      700: '#005999',
      800: '#003B66',
      900: '#001D33',
    },
    background: {
      light: '#F7FAFC',
      dark: '#1A202C',
    },
    card: {
      light: '#FFFFFF',
      dark: '#2D3748',
    }
  },
  components: {
    Table: tableTheme,
    Button: {
      baseStyle: {
        fontWeight: '500',
        rounded: 'lg',
        _hover: {
          transform: 'translateY(-1px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
        transition: 'all 0.2s',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
        }),
        ghost: {
          _hover: {
            transform: 'translateY(-1px)',
            boxShadow: 'none',
          },
        },
      },
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'light' ? 'card.light' : 'card.dark',
          boxShadow: 'sm',
          borderRadius: 'xl',
          transition: 'all 0.2s',
          _hover: {
            boxShadow: 'md',
            transform: 'translateY(-2px)',
          },
        },
      }),
    },
    // Add styles for Clerk components
    Clerk: {
      baseStyle: (props) => ({
        container: {
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto',
          padding: '2rem',
          bg: props.colorMode === 'light' ? 'white' : 'gray.800',
          borderRadius: 'xl',
          boxShadow: 'xl',
          border: '1px solid',
          borderColor: props.colorMode === 'light' ? 'gray.200' : 'gray.700',
        },
        header: {
          textAlign: 'center',
          mb: 6,
        },
        socialButtons: {
          width: '100%',
          mt: 4,
        },
        divider: {
          my: 6,
          borderColor: props.colorMode === 'light' ? 'gray.300' : 'gray.600',
        },
        form: {
          width: '100%',
        },
        input: {
          borderRadius: 'lg',
          bg: props.colorMode === 'light' ? 'white' : 'gray.700',
          borderColor: props.colorMode === 'light' ? 'gray.300' : 'gray.600',
          _hover: {
            borderColor: 'brand.500',
          },
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
          },
        },
        button: {
          width: '100%',
          height: '2.5rem',
          fontWeight: '600',
          borderRadius: 'lg',
          _hover: {
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
        },
        footerAction: {
          textAlign: 'center',
          mt: 4,
          fontSize: 'sm',
          color: props.colorMode === 'light' ? 'gray.600' : 'gray.400',
        },
        footerActionLink: {
          color: 'brand.500',
          fontWeight: '600',
          _hover: {
            textDecoration: 'underline',
          },
        },
      }),
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'light' ? 'background.light' : 'background.dark',
      },
      '.cl-rootBox': {
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
      },
      '.cl-card': {
        border: '1px solid',
        borderColor: props.colorMode === 'light' ? 'gray.200' : 'gray.700',
        boxShadow: 'xl',
        borderRadius: 'xl',
      },
      '.cl-formButtonPrimary': {
        bg: 'brand.500 !important',
        _hover: {
          bg: 'brand.600 !important',
        },
      },
      '.cl-formButtonReset': {
        color: 'brand.500 !important',
      },
      '.cl-footerActionLink': {
        color: 'brand.500 !important',
        fontWeight: '600 !important',
      },
    }),
  },
});

export default theme;