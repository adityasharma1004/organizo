import { 
  Box, 
  Container, 
  useColorModeValue, 
  VStack,
  Heading,
  Text,
  HStack,
  Icon,
  Grid,
  IconButton,
} from '@chakra-ui/react';
import { FaChartLine, FaTasks, FaShieldAlt, FaSun, FaMoon } from 'react-icons/fa';
import { useColorMode } from '@chakra-ui/react';
import Card from '../shared/Card';
import AnimatedBox from '../shared/AnimatedBox';

const AuthFeature = ({ icon, title, description }) => (
  <HStack spacing={4} align="start">
    <Icon as={icon} boxSize={5} color="brand.500" mt={1} />
    <Box>
      <Text fontWeight="medium" fontSize="sm">{title}</Text>
      <Text color="gray.500" fontSize="xs">{description}</Text>
    </Box>
  </HStack>
);

const AuthLayout = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50)',
    'linear(to-br, gray.900, purple.900)'
  );

  const features = [
    {
      icon: FaChartLine,
      title: 'Track Your Finances',
      description: 'Monitor expenses, investments, and savings goals in one place'
    },
    {
      icon: FaTasks,
      title: 'Manage Tasks',
      description: 'Stay organized with our intuitive task management system'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security'
    }
  ];

  return (
    <Box
      minH="100vh"
      w="100%"
      bgGradient={bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: 4, md: 8 }}
      px={{ base: 2, md: 4 }}
      position="relative"
    >
      {/* Color Mode Toggle */}
      <IconButton
        icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
        onClick={toggleColorMode}
        position="absolute"
        top={4}
        right={4}
        variant="ghost"
        aria-label="Toggle color mode"
      />

      <Container maxW={{ base: "100%", md: "container.lg" }}>
        <AnimatedBox>
          <Card
            p={{ base: 4, md: 8 }}
            boxShadow="xl"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            _hover={{ transform: 'none' }}
            className="auth-card"
          >
            <Grid 
              templateColumns={{ base: '1fr', md: '1fr 1fr' }} 
              gap={{ base: 6, md: 8 }}
              alignItems="center"
            >
              {/* Left side - Features */}
              <VStack spacing={6} align="stretch" display={{ base: 'none', md: 'flex' }}>
                <VStack spacing={2} align="start">
                  <Heading 
                    size={{ base: "lg", md: "xl" }} 
                    bgGradient="linear(to-r, brand.500, purple.500)" 
                    bgClip="text"
                  >
                    Welcome to Organizo
                  </Heading>
                  <Text color="gray.500">
                    Your personal finance and task management solution
                  </Text>
                </VStack>

                <VStack spacing={4} align="stretch" mt={4}>
                  {features.map((feature, index) => (
                    <AuthFeature key={index} {...feature} />
                  ))}
                </VStack>
              </VStack>

              {/* Mobile Welcome Text */}
              <VStack spacing={2} align="center" display={{ base: 'flex', md: 'none' }} mb={4}>
                <Heading 
                  size="lg" 
                  bgGradient="linear(to-r, brand.500, purple.500)" 
                  bgClip="text"
                  textAlign="center"
                >
                  Welcome to Organizo
                </Heading>
              </VStack>

              {/* Right side - Auth Form */}
              <Box w="100%">
                {children}
              </Box>
            </Grid>
          </Card>
        </AnimatedBox>
      </Container>
    </Box>
  );
};

export default AuthLayout;