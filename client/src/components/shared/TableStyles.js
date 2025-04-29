import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const variantStriped = defineStyle(props => {
  const { colorMode } = props;
  const darkBg = 'gray.700';
  const lightBg = 'gray.50';

  return {
    th: {
      textAlign: 'center',
      textTransform: 'capitalize',
      fontWeight: 'bold',
      fontSize: 'sm',
      px: '6',
      py: '4',
      bg: colorMode === 'dark' ? darkBg : lightBg,
      borderBottom: '2px solid',
      borderColor: colorMode === 'dark' ? 'gray.600' : 'gray.200',
    },
    td: {
      px: '6',
      py: '4',
      textAlign: 'center',
      verticalAlign: 'middle',
      fontSize: 'sm',
      borderColor: colorMode === 'dark' ? 'gray.600' : 'gray.100',
    },
    caption: {
      px: '6',
      py: '4',
      textAlign: 'left',
    },
    tbody: {
      tr: {
        _even: {
          bg: colorMode === 'dark' ? 'gray.800' : 'gray.50',
        },
        _hover: {
          bg: colorMode === 'dark' ? 'gray.600' : 'gray.100',
          transition: 'background-color 0.2s',
        },
      },
    },
  };
});

export const tableTheme = defineStyleConfig({
  variants: {
    striped: variantStriped,
  },
  defaultProps: {
    variant: 'striped',
  },
});