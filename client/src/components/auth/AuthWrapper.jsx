import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Spinner, VStack, Text, useToast, Alert, AlertIcon, Box, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const AuthWrapper = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const toast = useToast();
  const [authError, setAuthError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Add enhanced debugging for authentication state
  useEffect(() => {
    if (isLoaded) {
      console.log('Auth state:', { 
        isSignedIn, 
        userId: user?.id,
        primaryEmailAddress: user?.primaryEmailAddress?.emailAddress,
        hasPublicMetadata: !!user?.publicMetadata,
        userLoaded: !!user,
        environment: import.meta.env.MODE,
        origin: window.location.origin
      });
      
      if (isSignedIn && user?.id) {
        // Log successful authentication
        console.log('User authenticated successfully:', user.id);
        setAuthError(null);
      } else if (isLoaded && !isSignedIn) {
        console.warn('User not signed in after auth loaded');
        setAuthError('Authentication required. Please sign in to continue.');
      }
    }
  }, [isLoaded, isSignedIn, user]);

  // Handle authentication errors
  useEffect(() => {
    // Only try to recover if we have authentication issues
    if (isLoaded && !isSignedIn && window.Clerk) {
      const handleClerkError = async () => {
        try {
          // Check if there's a session that could be recovered
          await window.Clerk.load();
          
          if (window.Clerk && window.Clerk.sessions) {
            console.log('Clerk sessions available:', window.Clerk.sessions.length);
            
            // Try to refresh the active session if one exists
            if (window.Clerk.session) {
              console.log('Attempting to refresh session');
              try {
                await window.Clerk.session.refresh();
                window.location.reload(); // Reload after successful refresh
              } catch (refreshError) {
                console.error('Session refresh failed:', refreshError);
              }
            }
          } else {
            console.warn('Clerk sessions not available');
          }
        } catch (error) {
          console.error('Error recovering authentication:', error);
        }
      };

      // Don't run recovery logic too many times
      if (retryCount < 2) {
        const timer = setTimeout(() => {
          handleClerkError();
          setRetryCount(prev => prev + 1);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, isSignedIn, retryCount]);

  // Handle when Clerk is not available
  useEffect(() => {
    if (isLoaded && !window.Clerk) {
      console.error('Clerk not available after load');
      toast({
        title: 'Authentication Service Error',
        description: 'The authentication service failed to initialize. Please refresh the page.',
        status: 'error',
        duration: 10000,
        isClosable: true,
      });
    }
  }, [isLoaded, toast]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!isLoaded) {
    return (
      <VStack spacing={4} pt={20}>
        <Spinner size="xl" />
        <Text>Loading authentication...</Text>
      </VStack>
    );
  }

  // If Clerk isn't loaded properly, show error with refresh button
  if (!window.Clerk) {
    return (
      <VStack spacing={6} pt={20}>
        <Text color="red.500" fontSize="lg">Authentication service failed to load</Text>
        <Button colorScheme="blue" onClick={handleRefresh}>
          Refresh Page
        </Button>
        <Navigate to="/sign-in" replace />
      </VStack>
    );
  }

  if (!isSignedIn) {
    // Show a toast notification about redirect
    toast({
      title: 'Authentication Required',
      description: 'Please sign in to access the application.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    return (
      <>
        {authError && (
          <Box position="fixed" top="4" right="4" zIndex="toast">
            <Alert status="error" variant="solid" rounded="md">
              <AlertIcon />
              {authError}
            </Alert>
          </Box>
        )}
        <Navigate to="/sign-in" replace />
      </>
    );
  }

  return children;
};

export default AuthWrapper;