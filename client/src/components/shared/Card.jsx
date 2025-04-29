import { Box, useColorModeValue } from '@chakra-ui/react';

const Card = ({ children, noPadding, animate, ...props }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      boxShadow="sm"
      p={noPadding ? 0 : 6}
      transition="all 0.2s"
      _hover={animate ? {
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      } : undefined}
      className="fade-in"
      {...props}
    >
      {children}
    </Box>
  );
};

export default Card;