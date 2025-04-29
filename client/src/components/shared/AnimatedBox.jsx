import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const AnimatedBox = ({ children, delay = 0, ...props }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut'
      }}
      {...props}
    >
      {children}
    </MotionBox>
  );
};

export const ListAnimation = ({ children, index = 0 }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: 'easeOut'
      }}
    >
      {children}
    </MotionBox>
  );
};

export default AnimatedBox;