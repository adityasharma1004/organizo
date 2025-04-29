import { 
  Box, 
  Flex, 
  Button, 
  useColorMode, 
  IconButton, 
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  VStack,
  Divider,
  useColorModeValue,
  MenuDivider,
  useDisclosure,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Link, useLocation } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        position="relative"
        px={4}
        h={10}
        _hover={{
          bg: 'transparent',
        }}
      >
        {isActive && (
          <MotionBox
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            height="3px"
            bg="brand.500"
            layoutId="navunderline"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <Text
          color={isActive ? 'brand.500' : 'inherit'}
          fontWeight={isActive ? '600' : '500'}
        >
          {children}
        </Text>
      </Button>
    </Link>
  );
};

const Navbar = ({ onSidebarOpen }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { signOut } = useClerk();
  const { user } = useUser();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <MotionFlex
      px={4}
      py={2}
      position="fixed"
      w="100%"
      top={0}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      zIndex={1000}
      backdropFilter="blur(10px)"
      backgroundColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(26, 32, 44, 0.8)'}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="container.xl" mx="auto" w="100%">
        <HStack spacing={8} alignItems="center">
          {/* Mobile menu button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            variant="ghost"
            icon={<HamburgerIcon boxSize={5} />}
            onClick={onSidebarOpen}
            aria-label="Open Menu"
            _hover={{
              bg: useColorModeValue('gray.100', 'gray.700'),
            }}
          />
          
          {/* Logo and Brand */}
          <Link to="/">
            <HStack spacing={2}>
              <Box
                w={8}
                h={8}
                bg="brand.500"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontSize="xl" fontWeight="bold">
                  O
                </Text>
              </Box>
              <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, brand.500, purple.500)" bgClip="text">
                Organizo
              </Text>
            </HStack>
          </Link>

          {/* Navigation Links */}
          <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/tasks">Task Manager</NavLink>
            <NavLink to="/budget">Budget Buddy</NavLink>
          </HStack>
        </HStack>

        {/* Right Side */}
        <HStack spacing={4}>
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            aria-label="Toggle color mode"
            variant="ghost"
            _hover={{
              bg: useColorModeValue('gray.100', 'gray.700'),
            }}
          />

          <Menu>
            <MenuButton>
              <Avatar 
                size="sm" 
                src={user?.profileImageUrl}
                name={user?.fullName || user?.username}
                bg="brand.500"
                _hover={{
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease',
                }}
              />
            </MenuButton>
            <MenuList>
              <Box px={4} py={2}>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">{user?.fullName || user?.username}</Text>
                  <Text fontSize="sm" color="gray.500">{user?.primaryEmailAddress?.emailAddress}</Text>
                </VStack>
              </Box>
              <MenuDivider />
              <MenuItem onClick={() => signOut()}>Sign Out</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </MotionFlex>
  );
};

export default Navbar;