import { ChakraProvider, ColorModeScript, useToast } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ClerkProvider, SignIn, SignUp } from '@clerk/clerk-react';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import AuthLayout from './components/auth/AuthLayout';
import Home from './pages/Home';
import BudgetPage from './pages/budget/BudgetPage';
import TaskManager from './pages/tasks/TaskManager';
import TestUI from './pages/TestUI';
import AuthWrapper from './components/auth/AuthWrapper';
import theme from './theme';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Get environment variables for Clerk redirects
const signInUrl = import.meta.env.VITE_CLERK_SIGN_IN_URL || '/sign-in';
const signUpUrl = import.meta.env.VITE_CLERK_SIGN_UP_URL || '/sign-up';
const signInFallbackUrl = import.meta.env.VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/';
const signUpFallbackUrl = import.meta.env.VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '/';

// Get the current domain for Clerk redirects
const getBaseUrl = () => {
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:5173';
  }
  // In production, use the deployed URL
  return window.location.origin;
};

// Clerk appearance settings
const appearance = {
  elements: {
    formButtonPrimary: {
      fontSize: '16px',
      fontWeight: 600,
      textTransform: 'none',
      backgroundColor: 'var(--chakra-colors-brand-500)',
      '&:hover': {
        backgroundColor: 'var(--chakra-colors-brand-600)'
      }
    },
    card: {
      border: 'none',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      borderRadius: '0',
    },
    socialButtonsBlockButton: {
      width: '100%',
      marginTop: '8px',
      marginBottom: '8px',
      borderRadius: '8px',
      border: '1px solid var(--chakra-colors-gray-200)',
      backgroundColor: 'white',
      '&:hover': {
        backgroundColor: 'var(--chakra-colors-gray-50)',
      }
    },
    socialButtonsBlockButtonText: {
      fontWeight: '500',
      fontSize: '14px',
    },
    footerActionText: {
      fontSize: '14px',
      color: 'var(--chakra-colors-gray-600)',
    },
    footerActionLink: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--chakra-colors-brand-500)',
      '&:hover': {
        color: 'var(--chakra-colors-brand-600)',
      }
    },
    dividerLine: {
      borderColor: 'var(--chakra-colors-gray-200)',
    },
    dividerText: {
      color: 'var(--chakra-colors-gray-500)',
    },
    formFieldLabel: {
      fontSize: '14px',
      fontWeight: '500',
    },
    formFieldInput: {
      fontSize: '16px',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid var(--chakra-colors-gray-200)',
      '&:focus': {
        borderColor: 'var(--chakra-colors-brand-500)',
        boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
      }
    },
    navbar: {
      display: 'none',
    }
  },
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'blockButton',
    privacyPageUrl: 'https://clerk.com/privacy',
    helpPageUrl: 'https://clerk.com/help',
  },
};

function AuthDebugger() {
  const toast = useToast();
  
  useEffect(() => {
    // Log auth debugging information
    console.log('Auth debugger initialized');
    console.log('Current URL:', window.location.href);
    console.log('Base URL:', getBaseUrl());
    console.log('Clerk redirect settings:', {
      signInUrl,
      signUpUrl,
      signInFallbackUrl,
      signUpFallbackUrl
    });
    
    // Check if Clerk is loaded properly with retry mechanism
    const checkClerk = () => {
      if (window.Clerk) {
        console.log('Clerk is loaded');
        return true;
      }
      return false;
    };

    // Initial check
    if (!checkClerk()) {
      // Set up retry mechanism in case Clerk is loading slowly
      let retryCount = 0;
      const maxRetries = 3;
      const retryInterval = setInterval(() => {
        retryCount++;
        if (checkClerk() || retryCount >= maxRetries) {
          clearInterval(retryInterval);
          
          if (!window.Clerk && retryCount >= maxRetries) {
            console.error('Clerk failed to load after retries');
            toast({
              title: 'Authentication Error',
              description: 'Failed to load authentication service. Please try refreshing the page.',
              status: 'error',
              duration: 9000,
              isClosable: true,
            });
          }
        }
      }, 1000);
    }
  }, [toast]);
  
  return null;
}

// Wrapper component to provide navigation to Clerk
function ClerkProviderWithNavigate({ children }) {
  const navigate = useNavigate();
  
  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={appearance}
      navigate={(to) => navigate(to)}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      afterSignInUrl={signInFallbackUrl}
      afterSignUpUrl={signUpFallbackUrl}
    >
      {children}
    </ClerkProvider>
  );
}

function App() {
  // Check if Clerk key is available
  if (!clerkPubKey) {
    console.error('Missing Clerk publishable key');
    return (
      <ChakraProvider theme={theme}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Configuration Error</h2>
          <p>Authentication service configuration is missing. Please check your environment variables.</p>
        </div>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <ClerkProviderWithNavigate>
          <AuthDebugger />
          <Routes>
            {/* Auth Routes */}
            <Route 
              path="/sign-in/*" 
              element={
                <AuthLayout>
                  <SignIn 
                    routing="path" 
                    path="/sign-in" 
                    signUpUrl={signUpUrl}
                    fallbackRedirectUrl={signInFallbackUrl}
                  />
                </AuthLayout>
              } 
            />
            <Route 
              path="/sign-up/*" 
              element={
                <AuthLayout>
                  <SignUp 
                    routing="path" 
                    path="/sign-up" 
                    signInUrl={signInUrl}
                    fallbackRedirectUrl={signUpFallbackUrl}
                  />
                </AuthLayout>
              } 
            />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <AuthWrapper>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/tasks" element={<TaskManager />} />
                      <Route path="/budget" element={<BudgetPage />} />
                      {import.meta.env.DEV && (
                        <Route path="/test-ui" element={<TestUI />} />
                      )}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </AuthWrapper>
              }
            />
          </Routes>
        </ClerkProviderWithNavigate>
      </Router>
    </ChakraProvider>
  );
}

export default App;
