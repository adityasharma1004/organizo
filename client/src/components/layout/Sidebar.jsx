import {
  Box,
  VStack,
  Text,
  Flex,
  Icon,
  CloseButton,
  useColorModeValue,
  Drawer,
  DrawerContent,
  DrawerOverlay,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaTasks, FaWallet } from 'react-icons/fa';

const NavItem = ({ icon, path, children, onClose }) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  const activeBg = useColorModeValue('brand.50', 'gray.700');
  const activeColor = useColorModeValue('brand.500', 'white');
  const inactiveColor = useColorModeValue('gray.600', 'gray.300');
  
  return (
    <Link to={path} style={{ width: '100%' }} onClick={onClose}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : inactiveColor}
        _hover={{
          bg: activeBg,
          color: activeColor,
        }}
        fontWeight={isActive ? 'semibold' : 'normal'}
        transition="all 0.2s"
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="18"
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};

const SidebarContent = ({ onClose, ...rest }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      transition="0.3s ease"
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, brand.500, purple.500)" bgClip="text">
          Organizo
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <VStack spacing={0} align="stretch" mt={4}>
        <NavItem icon={FaHome} path="/" onClose={onClose}>Home</NavItem>
        <NavItem icon={FaTasks} path="/tasks" onClose={onClose}>Task Manager</NavItem>
        <NavItem icon={FaWallet} path="/budget" onClose={onClose}>Budget Buddy</NavItem>
      </VStack>
    </Box>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <Box display={{ base: 'block', md: 'none' }}>
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Sidebar;