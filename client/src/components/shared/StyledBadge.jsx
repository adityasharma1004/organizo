import { Badge, useColorModeValue } from '@chakra-ui/react';

const StyledBadge = ({ type, children, animate = false, ...props }) => {
  const getColors = () => {
    switch (type?.toLowerCase()) {
      // Priority badges
      case 'high':
        return {
          bg: useColorModeValue('red.50', 'red.900'),
          color: useColorModeValue('red.600', 'red.200'),
          borderColor: useColorModeValue('red.100', 'red.800'),
        };
      case 'medium':
        return {
          bg: useColorModeValue('yellow.50', 'yellow.900'),
          color: useColorModeValue('yellow.600', 'yellow.200'),
          borderColor: useColorModeValue('yellow.100', 'yellow.800'),
        };
      case 'low':
        return {
          bg: useColorModeValue('green.50', 'green.900'),
          color: useColorModeValue('green.600', 'green.200'),
          borderColor: useColorModeValue('green.100', 'green.800'),
        };

      // Status badges
      case 'brand':
        return {
          bg: useColorModeValue('brand.50', 'brand.900'),
          color: useColorModeValue('brand.600', 'brand.200'),
          borderColor: useColorModeValue('brand.100', 'brand.800'),
        };
      case 'success':
        return {
          bg: useColorModeValue('green.50', 'green.900'),
          color: useColorModeValue('green.600', 'green.200'),
          borderColor: useColorModeValue('green.100', 'green.800'),
        };

      // Transaction type badges
      case 'spend':
        return {
          bg: useColorModeValue('red.50', 'red.900'),
          color: useColorModeValue('red.600', 'red.200'),
          borderColor: useColorModeValue('red.100', 'red.800'),
        };
      case 'invest':
        return {
          bg: useColorModeValue('purple.50', 'purple.900'),
          color: useColorModeValue('purple.600', 'purple.200'),
          borderColor: useColorModeValue('purple.100', 'purple.800'),
        };
      case 'receive':
        return {
          bg: useColorModeValue('green.50', 'green.900'),
          color: useColorModeValue('green.600', 'green.200'),
          borderColor: useColorModeValue('green.100', 'green.800'),
        };

      // Category badges for transactions
      case 'food':
        return {
          bg: useColorModeValue('orange.50', 'orange.900'),
          color: useColorModeValue('orange.600', 'orange.200'),
          borderColor: useColorModeValue('orange.100', 'orange.800'),
        };
      case 'travel':
        return {
          bg: useColorModeValue('blue.50', 'blue.900'),
          color: useColorModeValue('blue.600', 'blue.200'),
          borderColor: useColorModeValue('blue.100', 'blue.800'),
        };
      case 'subscriptions':
        return {
          bg: useColorModeValue('purple.50', 'purple.900'),
          color: useColorModeValue('purple.600', 'purple.200'),
          borderColor: useColorModeValue('purple.100', 'purple.800'),
        };
      case 'shopping':
        return {
          bg: useColorModeValue('pink.50', 'pink.900'),
          color: useColorModeValue('pink.600', 'pink.200'),
          borderColor: useColorModeValue('pink.100', 'pink.800'),
        };
      case 'misc':
        return {
          bg: useColorModeValue('gray.50', 'gray.900'),
          color: useColorModeValue('gray.600', 'gray.200'),
          borderColor: useColorModeValue('gray.100', 'gray.800'),
        };

      // Investment categories
      case 'investment':
        return {
          bg: useColorModeValue('teal.50', 'teal.900'),
          color: useColorModeValue('teal.600', 'teal.200'),
          borderColor: useColorModeValue('teal.100', 'teal.800'),
        };
      case 'savings':
        return {
          bg: useColorModeValue('cyan.50', 'cyan.900'),
          color: useColorModeValue('cyan.600', 'cyan.200'),
          borderColor: useColorModeValue('cyan.100', 'cyan.800'),
        };

      // Income categories
      case 'income':
        return {
          bg: useColorModeValue('green.50', 'green.900'),
          color: useColorModeValue('green.600', 'green.200'),
          borderColor: useColorModeValue('green.100', 'green.800'),
        };
      case 'refund':
        return {
          bg: useColorModeValue('orange.50', 'orange.900'),
          color: useColorModeValue('orange.600', 'orange.200'),
          borderColor: useColorModeValue('orange.100', 'orange.800'),
        };
      case 'other':
        return {
          bg: useColorModeValue('gray.50', 'gray.900'),
          color: useColorModeValue('gray.600', 'gray.200'),
          borderColor: useColorModeValue('gray.100', 'gray.800'),
        };

      default:
        return {
          bg: useColorModeValue('gray.50', 'gray.900'),
          color: useColorModeValue('gray.600', 'gray.200'),
          borderColor: useColorModeValue('gray.100', 'gray.800'),
        };
    }
  };

  const colors = getColors();

  return (
    <Badge
      px={3}
      py={1}
      borderRadius="full"
      border="1px solid"
      fontSize="sm"
      fontWeight="medium"
      textTransform="capitalize"
      whiteSpace="nowrap"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-1px)',
        boxShadow: 'sm',
      }}
      {...colors}
      {...props}
    >
      {children}
    </Badge>
  );
};

export default StyledBadge;