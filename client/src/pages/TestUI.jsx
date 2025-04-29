import {
  Box,
  Container,
  VStack,
  Heading,
  Button,
  SimpleGrid,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import Card from '../components/shared/Card';
import AnimatedBox from '../components/shared/AnimatedBox';
import LoadingOverlay from '../components/shared/LoadingOverlay';
import useCustomToast from '../hooks/useCustomToast';
import useLoading from '../hooks/useLoading';

const TestUI = () => {
  const toast = useCustomToast();
  const { isLoading, execute } = useLoading();
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  const simulateAsyncOperation = async () => {
    return new Promise((resolve) => setTimeout(resolve, 2000));
  };

  // Test toast notifications
  const handleTestToasts = () => {
    toast.success('Success', 'Operation completed successfully');
    setTimeout(() => {
      toast.error('Error', 'Something went wrong');
    }, 1000);
    setTimeout(() => {
      toast.warning('Warning', 'Please be careful');
    }, 2000);
    setTimeout(() => {
      toast.info('Info', 'Just letting you know');
    }, 3000);
  };

  // Test loading states
  const handleTestLoading = async () => {
    await execute(async () => {
      await simulateAsyncOperation();
      toast.success('Success', 'Async operation completed');
    }, 'Processing...');
  };

  // Test loading overlay
  const handleTestLoadingOverlay = async () => {
    setShowLoadingOverlay(true);
    await simulateAsyncOperation();
    setShowLoadingOverlay(false);
    toast.success('Success', 'Loading overlay test completed');
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <AnimatedBox>
          <Card>
            <Heading size="lg" mb={6}>UI Components Test</Heading>
            <Text color="gray.600" mb={8}>
              This page demonstrates various UI components and their interactions.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {/* Toast Notifications */}
              <Card animate>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Toast Notifications</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Test different types of toast notifications
                  </Text>
                  <Button
                    colorScheme="brand"
                    onClick={handleTestToasts}
                  >
                    Show Toast Notifications
                  </Button>
                </VStack>
              </Card>

              {/* Loading States */}
              <Card animate>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Loading States</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Test loading states with toast
                  </Text>
                  <Button
                    colorScheme="purple"
                    onClick={handleTestLoading}
                    isLoading={isLoading}
                  >
                    Test Loading State
                  </Button>
                </VStack>
              </Card>

              {/* Loading Overlay */}
              <Card animate>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Loading Overlay</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Test full-screen loading overlay
                  </Text>
                  <Button
                    colorScheme="blue"
                    onClick={handleTestLoadingOverlay}
                  >
                    Show Loading Overlay
                  </Button>
                </VStack>
              </Card>
            </SimpleGrid>
          </Card>
        </AnimatedBox>

        {/* Additional test sections can be added here */}
      </VStack>

      {/* Loading Overlay */}
      {showLoadingOverlay && (
        <LoadingOverlay
          message="Processing your request..."
          fullScreen
        />
      )}
    </Container>
  );
};

export default TestUI;