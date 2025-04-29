import {
  Box,
  VStack,
  Spinner,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const overlayVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const contentVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.1,
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

const LoadingOverlay = ({ message = 'Loading...', fullScreen = false }) => {
  const bgColor = useColorModeValue(
    'rgba(255, 255, 255, 0.8)',
    'rgba(26, 32, 44, 0.8)'
  );

  return (
    <MotionBox
      position={fullScreen ? 'fixed' : 'absolute'}
      top={0}
      left={0}
      right={0}
      bottom={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
      backdropFilter="blur(8px)"
      zIndex={9999}
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <MotionBox
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <VStack spacing={4}>
          <Spinner
            size="xl"
            thickness="3px"
            speed="0.8s"
            color="brand.500"
            emptyColor="transparent"
          />
          <Text
            fontSize="lg"
            fontWeight="medium"
            color={useColorModeValue('gray.700', 'gray.200')}
          >
            {message}
          </Text>
        </VStack>
      </MotionBox>
    </MotionBox>
  );
};

export default LoadingOverlay;