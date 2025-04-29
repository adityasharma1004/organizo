import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Spinner,
  useToast,
  Alert,
  AlertIcon,
  SimpleGrid,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Code,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  useColorModeValue,
  Flex,
  Badge
} from '@chakra-ui/react';
import { useUser } from '@clerk/clerk-react';
import { AddIcon, CheckIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { FaTasks, FaKeyboard, FaExclamationCircle, FaClock, FaWifi, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import useErrorHandler from '../../hooks/useErrorHandler';
import StyledBadge from '../../components/shared/StyledBadge';
import AnimatedBox from '../../components/shared/AnimatedBox';
import { getTasks, createTask, updateTask, deleteTask } from '../../utils/supabase';

// Initial state for task manager
const initialState = {
  loading: true,
  loadingError: null,
  isOffline: !navigator.onLine,
  isSlowConnection: false,
  tasks: [],
  selectedTaskId: null,
  newTask: { name: '', date: '', time: '', priority: 'medium' },
  editingTask: null,
  taskToDelete: null,
  isUpdating: false,
  showShortcuts: false
};

// Animation component for list items
const ListAnimation = ({ children, index }) => {
  return (
    <Box
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {children}
    </Box>
  );
};

/**
 * Task Manager component for managing user tasks
 */
const TaskManager = () => {
  // Use single state object to manage all state
  const [state, setState] = useState(initialState);

  // Destructure state for convenience
  const {
    loading,
    loadingError,
    isOffline,
    isSlowConnection,
    tasks,
    selectedTaskId,
    newTask,
    editingTask,
    taskToDelete,
    isUpdating,
    showShortcuts
  } = state;

  // Modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  // Refs and hooks
  const cancelRef = useRef();
  const initialFocusRef = useRef();
  const { handleError, showSuccess } = useErrorHandler();
  const { user } = useUser();
  const toast = useToast();

  // Update state helper
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Handle task selection
  const handleTaskSelect = useCallback((taskId) => {
    updateState({ selectedTaskId: taskId });
  }, [updateState]);

  // Detect slow connection
  useEffect(() => {
    let timeoutId;
    if (loading) {
      timeoutId = setTimeout(() => {
        updateState({ isSlowConnection: true });
      }, 5000);
    }
    return () => {
      clearTimeout(timeoutId);
      updateState({ isSlowConnection: false });
    };
  }, [loading, updateState]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => updateState({ isOffline: false });
    const handleOffline = () => updateState({ isOffline: true });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateState]);

  // Handle arrow key navigation
  const handleArrowNavigation = useCallback((e) => {
    if (!tasks.length || isInputFocused()) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = selectedTaskId
        ? tasks.findIndex(t => t.id === selectedTaskId)
        : -1;

      let newIndex;
      if (e.key === 'ArrowDown') {
        newIndex = currentIndex < tasks.length - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : tasks.length - 1;
      }

      updateState({ selectedTaskId: tasks[newIndex].id });
    }
  }, [tasks, selectedTaskId, updateState]);

  const isInputFocused = () => {
    const activeElement = document.activeElement;
    return activeElement.tagName === 'INPUT' ||
           activeElement.tagName === 'TEXTAREA' ||
           activeElement.tagName === 'SELECT';
  };

  const isMac = navigator.platform.toLowerCase().includes('mac');
  
  const shortcuts = [
    { key: 'N', description: 'New task', modifier: '' },
    { key: '↑/↓', description: 'Navigate tasks', modifier: '' },
    { key: 'Space', description: 'Toggle task completion', modifier: '' },
    { key: 'E', description: 'Edit selected task', modifier: '' },
    { key: 'Del', description: 'Delete selected task', modifier: '' },
    { key: 'Enter', description: 'Save task', modifier: isMac ? '⌘' : 'Ctrl' },
    { key: 'Esc', description: 'Close dialogs', modifier: '' },
  ];

  const formatShortcut = (shortcut) => {
    if (shortcut.modifier) {
      return (
        <HStack spacing={1} aria-label={`${shortcut.modifier} plus ${shortcut.key}`}>
          <Code
            p={2}
            bg="gray.100"
            fontSize="sm"
            borderRadius="md"
            fontWeight="semibold"
          >
            {shortcut.modifier}
          </Code>
          <Text color="gray.500">+</Text>
          <Code
            p={2}
            bg="gray.100"
            fontSize="sm"
            borderRadius="md"
            fontWeight="semibold"
          >
            {shortcut.key}
          </Code>
        </HStack>
      );
    }
    return (
      <Code
        p={2}
        bg="gray.100"
        fontSize="sm"
        borderRadius="md"
        fontWeight="semibold"
        aria-label={shortcut.key}
      >
        {shortcut.key}
      </Code>
    );
  };

  const confirmDelete = (task) => {
    updateState({ taskToDelete: task });
    onDeleteOpen();
  };

  const handleDeleteConfirmed = async () => {
    if (!taskToDelete) return;
    
    onDeleteClose();
    await handleDelete(taskToDelete.id);
    updateState({ taskToDelete: null });
  };

  // Load tasks on component mount
  useEffect(() => {
    async function loadTasks() {
      if (!user?.id) {
        updateState({ loading: false });
        return;
      }

      try {
        updateState({ loading: true, loadingError: null });
        
        // Fetch tasks from API
        const data = await getTasks();
        
        updateState({ tasks: data || [] });
        
      } catch (err) {
        updateState({ loadingError: err.message });
        toast({
          title: 'Error loading tasks',
          description: err.message,
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      } finally {
        updateState({ loading: false });
      }
    }

    loadTasks();
  }, [user?.id, toast, updateState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingTask) {
      updateState({
        editingTask: {
          ...editingTask,
          [name]: value
        }
      });
    } else {
      updateState({
        newTask: {
          ...newTask,
          [name]: value
        }
      });
    }
  };

  const handleSubmit = async () => {
    if (!newTask.name || !newTask.date) {
      toast({
        title: 'Error',
        description: 'Task name and date are required',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    try {
      const taskToCreate = {
        ...newTask,
        user_id: user.id,
        completed: false
      };
      
      // Create task in API
      const createdTask = await createTask(taskToCreate);
      
      // Add to tasks list
      updateState({
        tasks: [...tasks, createdTask],
        newTask: {
          name: '',
          date: '',
          time: '',
          priority: 'medium'
        }
      });

      showSuccess('Task Added', 'Task has been created successfully');
    } catch (error) {
      handleError(error, 'Error adding task');
    }
  };

  const handleEdit = (task) => {
    updateState({ editingTask: task });
    onOpen();
  };

  const handleUpdate = async () => {
    if (!editingTask.name || !editingTask.date) {
      handleError(new Error('Task name and date are required'));
      return;
    }

    updateState({ isUpdating: true });
    try {
      // Update task in API
      const updatedTask = await updateTask(editingTask.id, editingTask);
      
      // Update in tasks list
      updateState({ 
        tasks: tasks.map(t => t.id === editingTask.id ? updatedTask : t),
        isUpdating: false
      });
      
      showSuccess('Task Updated', 'Task has been updated successfully');
      onClose();
      updateState({ editingTask: null });
    } catch (error) {
      handleError(error, 'Error updating task');
      updateState({ isUpdating: false });
    }
  };

  const handleDelete = async (id) => {
    try {
      // Delete task in API
      await deleteTask(id);
      
      // Remove from tasks list
      const taskToDelete = tasks.find(t => t.id === id);
      updateState({ tasks: tasks.filter(t => t.id !== id) });
      
      showSuccess(
        'Task Deleted',
        `"${taskToDelete.name || taskToDelete.title}" has been removed`,
        { duration: 2000 }
      );
    } catch (error) {
      handleError(error, 'Error deleting task');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      // Toggle completion in API
      const updatedTask = await updateTask(task.id, { 
        completed: !task.completed
      });
      
      // Update in tasks list
      updateState({
        tasks: tasks.map(t => 
          t.id === task.id ? updatedTask : t
        )
      });
      
      showSuccess(
        task.completed ? 'Task Reopened' : 'Task Completed',
        task.completed ? 'Task marked as active' : 'Great job completing the task!'
      );
    } catch (error) {
      handleError(error, 'Error updating task status');
    }
  };

  // Filter and sort tasks
  const activeTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      // Sort by date first
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare !== 0) return dateCompare;
      
      // If same date, sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
    });

  const completedTasks = tasks
    .filter(task => task.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recently completed first

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + Enter to add task
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (newTask.name && newTask.date) {
          e.preventDefault();
          handleSubmit();
        }
      }

      // Esc to close modals
      if (e.key === 'Escape') {
        if (isDeleteOpen) onDeleteClose();
        if (isOpen) onClose();
        if (showShortcuts) updateState({ showShortcuts: false });
      }

      // Only handle shortcuts when not in input fields
      if (!isInputFocused()) {
        // '?' to show shortcuts
        if (e.key === '?') {
          e.preventDefault();
          updateState({ showShortcuts: true });
        }
        
        // 'N' to focus new task input
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          document.querySelector('input[name="name"]')?.focus();
        }

        // 'E' to edit selected task
        if (e.key.toLowerCase() === 'e' && selectedTaskId) {
          e.preventDefault();
          const selectedTask = tasks.find(t => t.id === selectedTaskId);
          if (selectedTask) {
            handleEdit(selectedTask);
          }
        }

        // Space to toggle task completion
        if (e.key === ' ' && selectedTaskId) {
          e.preventDefault();
          const selectedTask = tasks.find(t => t.id === selectedTaskId);
          if (selectedTask) {
            handleToggleComplete(selectedTask);
          }
        }

        // Delete to remove selected task
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTaskId) {
          e.preventDefault();
          const selectedTask = tasks.find(t => t.id === selectedTaskId);
          if (selectedTask) {
            confirmDelete(selectedTask);
          }
        }

        // Arrow keys for navigation
        if (e.key.startsWith('Arrow')) {
          handleArrowNavigation(e);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    newTask, isDeleteOpen, isOpen, showShortcuts, onDeleteClose, onClose, 
    tasks, selectedTaskId, handleArrowNavigation, handleEdit, 
    handleToggleComplete, updateState, handleSubmit
  ]);

  // Loading state
  if (loading) {
    return (
      <Container centerContent py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading tasks...</Text>
          {isSlowConnection && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">This is taking longer than usual. Please wait...</Text>
            </Alert>
          )}
        </VStack>
      </Container>
    );
  }

  if (loadingError) {
    return (
      <Container py={8}>
        <Alert status="error">
          <AlertIcon />
          {loadingError}
        </Alert>
        <Button 
          mt={4} 
          colorScheme="blue" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Container>
    );
  }

  // Mobile-friendly Task Card component
  const TaskCard = ({ task }) => (
    <Box 
      p={4} 
      mb={3} 
      borderWidth="1px" 
      borderRadius="lg"
      onClick={() => handleTaskSelect(task.id)}
      bg={selectedTaskId === task.id
        ? useColorModeValue('gray.100', 'gray.600')
        : 'transparent'
      }
      _hover={{
        bg: useColorModeValue('gray.50', 'gray.700'),
      }}
    >
      <Flex justifyContent="space-between" alignItems="flex-start">
        <VStack align="start" spacing={1} flex="1">
          <Text 
            fontWeight="medium"
            textDecoration={task.completed ? 'line-through' : 'none'}
            color={task.completed ? 'gray.500' : 'inherit'}
          >
            {task.name || task.title}
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            <Text fontSize="sm" color="gray.500">
              {new Date(task.date).toLocaleDateString()}
            </Text>
            {task.time && (
              <Text fontSize="sm" color="gray.500">
                {task.time}
              </Text>
            )}
            <StyledBadge type={task.priority || 'medium'} size="sm">
              {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
            </StyledBadge>
          </HStack>
        </VStack>
        <HStack spacing={1}>
          <IconButton
            icon={<CheckIcon />}
            colorScheme={task.completed ? 'green' : 'gray'}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleComplete(task);
            }}
            aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
            size="sm"
          />
          <IconButton
            icon={<EditIcon />}
            colorScheme="blue"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(task);
            }}
            aria-label="Edit task"
            size="sm"
          />
          <IconButton
            icon={<DeleteIcon />}
            colorScheme="red"
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(task);
            }}
            aria-label="Delete task"
            size="sm"
          />
        </HStack>
      </Flex>
    </Box>
  );

  const TaskTable = ({ tasks }) => (
    <Box
      borderRadius="lg"
      borderWidth="1px"
      overflow="hidden"
      role="grid"
      aria-rowcount={tasks.length}
      aria-colcount={5}
      tabIndex={0}
      onKeyDown={handleArrowNavigation}
      display={{ base: "none", md: "block" }}
      onFocus={() => {
        // Auto-select first task if none selected
        if (tasks.length && !selectedTaskId) {
          handleTaskSelect(tasks[0].id);
        }
      }}
    >
      <Table variant="simple">
        <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
          <Tr>
            <Th py={4} px={6} textAlign="left" width="30%">Task</Th>
            <Th py={4} px={6} textAlign="center" width="20%">Date</Th>
            <Th py={4} px={6} textAlign="center" width="15%">Time</Th>
            <Th py={4} px={6} textAlign="center" width="15%">Priority</Th>
            <Th py={4} px={6} textAlign="right" width="20%">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.length === 0 ? (
            <Tr>
              <Td colSpan={5} textAlign="center" py={8}>
                <Text color="gray.500">No tasks found</Text>
              </Td>
            </Tr>
          ) : (
            tasks.map((task) => (
              <Tr
                key={task.id}
                data-task-id={task.id}
                onClick={() => handleTaskSelect(task.id)}
                cursor="pointer"
                _hover={{
                  bg: useColorModeValue('gray.50', 'gray.700'),
                }}
                bg={
                  selectedTaskId === task.id
                    ? useColorModeValue('gray.100', 'gray.600')
                    : 'transparent'
                }
              >
                <Td py={4} px={6}>
                  <Text
                    textDecoration={task.completed ? 'line-through' : 'none'}
                    color={task.completed ? 'gray.500' : 'inherit'}
                  >
                    {task.name || task.title}
                  </Text>
                </Td>
                <Td py={4} px={6} textAlign="center">
                  {new Date(task.date).toLocaleDateString()}
                </Td>
                <Td py={4} px={6} textAlign="center">
                  {task.time || '-'}
                </Td>
                <Td py={4} px={6} textAlign="center">
                  <StyledBadge type={task.priority || 'medium'}>
                    {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                  </StyledBadge>
                </Td>
                <Td py={4} px={6} textAlign="right">
                  <HStack spacing={2} justify="flex-end">
                    <IconButton
                      icon={<CheckIcon />}
                      colorScheme={task.completed ? 'green' : 'gray'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(task);
                      }}
                      aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                      size="sm"
                    />
                    <IconButton
                      icon={<EditIcon />}
                      colorScheme="blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(task);
                      }}
                      aria-label="Edit task"
                      size="sm"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(task);
                      }}
                      aria-label="Delete task"
                      size="sm"
                    />
                  </HStack>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
  
  // Mobile view for tasks list
  const TaskCardList = ({ tasks }) => (
    <Box display={{ base: "block", md: "none" }}>
      {tasks.length === 0 ? (
        <Box textAlign="center" py={8}>
          <VStack spacing={3}>
            <Icon as={FaTasks} boxSize={8} color="gray.400" />
            <Text color="gray.500">No tasks found</Text>
          </VStack>
        </Box>
      ) : (
        tasks.map((task) => <TaskCard key={task.id} task={task} />)
      )}
    </Box>
  );

  return (
    <Container maxW="container.xl" py={{ base: 4, md: 8 }} px={{ base: 2, md: 4 }}>
      <VStack spacing={6}>
        <Heading fontSize={{ base: "xl", md: "2xl" }}>Task Manager</Heading>
        
        <Box p={{ base: 3, md: 4 }} shadow="sm" borderWidth="1px" borderRadius="lg" width="100%">
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Task Name</FormLabel>
              <Input
                name="name"
                value={newTask.name}
                onChange={handleInputChange}
                placeholder="What needs to be done?"
                size={{ base: "md", md: "md" }}
              />
            </FormControl>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} width="100%">
              <FormControl isRequired>
                <FormLabel>Due Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={newTask.date}
                  onChange={handleInputChange}
                  size={{ base: "md", md: "md" }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Due Time</FormLabel>
                <Input
                  type="time"
                  name="time"
                  value={newTask.time}
                  onChange={handleInputChange}
                  size={{ base: "md", md: "md" }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Priority</FormLabel>
                <Select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleInputChange}
                  size={{ base: "md", md: "md" }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </FormControl>
            </SimpleGrid>
            
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              width="100%"
              isDisabled={!newTask.name || !newTask.date}
              size={{ base: "md", md: "md" }}
            >
              Add Task
            </Button>
          </VStack>
        </Box>
        
        <Box width="100%">
          <Tabs isFitted variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab fontSize={{ base: "sm", md: "md" }}>Active ({activeTasks.length})</Tab>
              <Tab fontSize={{ base: "sm", md: "md" }}>Completed ({completedTasks.length})</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={{ base: 2, md: 4 }}>
                <TaskTable tasks={activeTasks} />
                <TaskCardList tasks={activeTasks} />
              </TabPanel>
              <TabPanel p={{ base: 2, md: 4 }}>
                <TaskTable tasks={completedTasks} />
                <TaskCardList tasks={completedTasks} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
        
        {/* Edit Task Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent mx={{ base: 3, md: 0 }}>
            <ModalHeader>Edit Task</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Task Name</FormLabel>
                  <Input
                    name="name"
                    value={editingTask?.name || editingTask?.title || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Due Date</FormLabel>
                  <Input
                    type="date"
                    name="date"
                    value={editingTask?.date || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Due Time</FormLabel>
                  <Input
                    type="time"
                    name="time"
                    value={editingTask?.time || ''}
                    onChange={handleInputChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    name="priority"
                    value={editingTask?.priority || 'medium'}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleUpdate} 
                isLoading={isUpdating}
              >
                Update
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent mx={{ base: 3, md: 0 }}>
              <AlertDialogHeader>Delete Task</AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete this task? This action cannot be undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" ml={3} onClick={handleDeleteConfirmed}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        
        {/* Keyboard Shortcuts Modal */}
        <Modal isOpen={showShortcuts} onClose={() => updateState({ showShortcuts: false })}>
          <ModalOverlay />
          <ModalContent mx={{ base: 3, md: 0 }}>
            <ModalHeader>Keyboard Shortcuts</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={2} align="stretch">
                {shortcuts.map((shortcut) => (
                  <HStack key={shortcut.key} justify="space-between" p={2}>
                    <Text>{shortcut.description}</Text>
                    {formatShortcut(shortcut)}
                  </HStack>
                ))}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => updateState({ showShortcuts: false })}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default TaskManager;