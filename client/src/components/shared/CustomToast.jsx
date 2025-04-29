import { 
  Box, 
  Text, 
  HStack, 
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';

const MotionBox = motion(Box);

const toastVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const getToastIcon = (status) => {
  switch (status) {
    case 'success':
      return FaCheckCircle;
    case 'error':
      return FaExclamationCircle;
    case 'info':
      return FaInfoCircle;
    case 'warning':
      return FaExclamationTriangle;
    default:
      return FaInfoCircle;
  }
};

const getToastColor = (status) => {
  switch (status) {
    case 'success':
      return 'green';
    case 'error':
      return 'red';
    case 'info':
      return 'blue';
    case 'warning':
      return 'orange';
    default:
      return 'blue';
  }
};

// Sound effects for different toast types
const playSound = (status) => {
  const audio = new Audio();
  switch (status) {
    case 'success':
      audio.src = '/sounds/success.mp3';
      break;
    case 'error':
      audio.src = '/sounds/error.mp3';
      break;
    case 'warning':
      audio.src = '/sounds/warning.mp3';
      break;
    default:
      audio.src = '/sounds/notification.mp3';
  }
  audio.volume = 0.5;
  audio.play().catch(() => {
    // Ignore autoplay errors
  });
};

const CustomToast = ({ title, description, status }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const color = getToastColor(status);
  const IconComponent = getToastIcon(status);

  // Play sound effect when toast appears
  playSound(status);

  return (
    <MotionBox
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      boxShadow="lg"
      maxW="sm"
      w="full"
    >
      <HStack spacing={3} align="flex-start">
        <Icon 
          as={IconComponent} 
          boxSize={5} 
          color={`${color}.500`}
          mt={0.5}
        />
        <Box flex="1">
          {title && (
            <Text fontWeight="semibold" mb={description ? 1 : 0}>
              {title}
            </Text>
          )}
          {description && (
            <Text color="gray.600" fontSize="sm">
              {description}
            </Text>
          )}
        </Box>
      </HStack>
    </MotionBox>
  );
};

// Create toast configurations for different statuses
export const createToastConfig = (title, description, status = 'info') => ({
  position: 'top-right',
  duration: 5000,
  isClosable: true,
  render: ({ onClose }) => (
    <CustomToast 
      title={title}
      description={description}
      status={status}
      onClose={onClose}
    />
  ),
});

export default CustomToast;