import { useToast } from '@chakra-ui/react';

const useErrorHandler = () => {
  const toast = useToast();

  const handleError = (error, customMessage = '') => {
    console.error('Error:', error);

    // Handle specific error types
    if (error.message === 'Authentication required') {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to continue.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Handle transaction validation errors
    if (error.message?.includes('Invalid tag for type')) {
      toast({
        title: 'Invalid Category',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (error.message?.includes('Missing required fields')) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (error.code === '22P02') {
      toast({
        title: 'Invalid Input',
        description: 'Please check the values you entered.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (error.code === '23505') {
      toast({
        title: 'Duplicate Entry',
        description: 'This record already exists.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Handle network errors
    if (error.message === 'Failed to fetch' || error.message?.includes('Network Error')) {
      toast({
        title: 'Network Error',
        description: 'Please check your internet connection and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Default error message
    toast({
      title: 'Error',
      description: customMessage || error.message || 'An unexpected error occurred.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const showSuccess = (title, description) => {
    toast({
      title,
      description,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const showInfo = (title, description) => {
    toast({
      title,
      description,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const showWarning = (title, description) => {
    toast({
      title,
      description,
      status: 'warning',
      duration: 4000,
      isClosable: true,
    });
  };

  return {
    handleError,
    showSuccess,
    showInfo,
    showWarning,
  };
};

export default useErrorHandler;