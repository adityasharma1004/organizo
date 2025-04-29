import { 
  Container, 
  SimpleGrid, 
  Heading, 
  Text, 
  VStack, 
  HStack,
  Progress,
  IconButton,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useToast,
  Spinner,
  Box,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { FaChartLine, FaTasks, FaBullseye, FaArrowUp, FaArrowDown, FaSync } from 'react-icons/fa';
import { EditIcon, CheckIcon } from '@chakra-ui/icons';
import { useUser } from '@clerk/clerk-react';
import AnimatedBox, { ListAnimation } from '../components/shared/AnimatedBox';
import Card from '../components/shared/Card';
import StyledBadge from '../components/shared/StyledBadge';
import LineChart from '../components/shared/LineChart';
import { getTasks, getTransactions, updateTask } from '../utils/supabase';
import { formatCurrency } from '../utils/formatters';
import useErrorHandler from '../hooks/useErrorHandler';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [balanceGoal, setBalanceGoal] = useState(1000);
  const [newGoal, setNewGoal] = useState(1000);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [previousBalance, setPreviousBalance] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [balanceHistory, setBalanceHistory] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Balance',
      data: [0, 0, 0, 0, 0, 0, 0],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      tension: 0.4,
    }],
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { user } = useUser();
  const { handleError, showSuccess } = useErrorHandler();

  const calculateDayBalance = (transactions, date) => {
    return transactions
      .filter(t => t.date <= date)
      .reduce((acc, t) => {
        if (t.type === 'receive') return acc + t.amount;
        return acc - t.amount;
      }, 0);
  };

  const calculateMonthlySpending = (transactions) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString().split('T')[0];

    return transactions
      .filter(t => t.date >= firstDayOfMonth && t.type === 'spend')
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const fetchData = useCallback(async () => {
    try {
      // Fetch tasks due today
      const tasks = await getTasks();
      const today = new Date().toISOString().split('T')[0];
      const todaysTasks = tasks.filter(task => task.date === today && !task.completed);
      setTodaysTasks(todaysTasks);

      // Fetch transactions and calculate balances
      const transactions = await getTransactions();
      
      // Calculate balance history for the last 7 days
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const dailyBalances = last7Days.map(date => 
        calculateDayBalance(transactions, date)
      );

      setBalanceHistory({
        labels: last7Days.map(date => {
          const d = new Date(date);
          return d.toLocaleDateString('en-US', { weekday: 'short' });
        }),
        datasets: [
          {
            label: 'Balance',
            data: dailyBalances,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.4,
          },
        ],
      });

      // Set current and previous balance
      setCurrentBalance(dailyBalances[dailyBalances.length - 1]);
      setPreviousBalance(dailyBalances[dailyBalances.length - 2]);

      // Calculate monthly spending
      const monthlyTotal = calculateMonthlySpending(transactions);
      setMonthlySpending(monthlyTotal);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error fetching data',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUpdateGoal = useCallback(() => {
    setBalanceGoal(parseFloat(newGoal));
    onClose();
    toast({
      title: 'Goal Updated',
      description: 'Your monthly savings goal has been updated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [newGoal, onClose, toast]);

  const handleToggleComplete = async (task) => {
    try {
      // Update task in the database
      const updatedTask = await updateTask(task.id, { completed: !task.completed });
      
      // Update in local state
      setTodaysTasks(prev => 
        prev.map(t => t.id === task.id ? updatedTask : t)
          .filter(t => !t.completed) // Remove completed tasks from today's tasks
      );
      
      showSuccess(
        'Task Completed',
        'Great job completing the task! It has been moved to completed tasks.'
      );
    } catch (error) {
      handleError(error, 'Error updating task');
    }
  };

  const goalProgress = (currentBalance / balanceGoal) * 100;
  const balanceChange = currentBalance - previousBalance;
  const percentChange = previousBalance !== 0 
    ? ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100 
    : 0;

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading your dashboard...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Welcome Section */}
        <AnimatedBox>
          <Card>
            <HStack spacing={4}>
              <VStack align="stretch" flex={1}>
                <Heading size="lg">
                  Welcome, {user?.firstName || 'User'}
                </Heading>
                <Text color="gray.600">
                  Your personal finance and task management solution
                </Text>
              </VStack>
              <Icon as={FaChartLine} boxSize={10} color="brand.500" />
            </HStack>
          </Card>
        </AnimatedBox>

        {/* Overview Cards */}
        <AnimatedBox delay={0.1}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Today's Tasks Card */}
            <Card animate>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">Today's Tasks</Heading>
                  <HStack>
                    <IconButton
                      icon={<FaSync />}
                      isLoading={refreshing}
                      onClick={handleRefresh}
                      aria-label="Refresh tasks"
                      variant="ghost"
                      size="sm"
                    />
                    <Icon as={FaTasks} boxSize={6} color="blue.500" />
                  </HStack>
                </HStack>
                <VStack align="stretch" spacing={3}>
                  {todaysTasks.length > 0 ? (
                    todaysTasks.map((task, index) => (
                      <ListAnimation key={task.id} index={index}>
                        <HStack
                          p={3}
                          bg={useColorModeValue('gray.50', 'gray.700')}
                          borderRadius="md"
                          justify="space-between"
                        >
                          <Text flex="1">{task.name}</Text>
                          <HStack>
                            <StyledBadge type={task.priority}>
                              {task.priority}
                            </StyledBadge>
                            <IconButton
                              icon={<CheckIcon />}
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleToggleComplete(task)}
                              aria-label="Mark as complete"
                            />
                          </HStack>
                        </HStack>
                      </ListAnimation>
                    ))
                  ) : (
                    <Text color="gray.500" textAlign="center">No tasks scheduled for today</Text>
                  )}
                </VStack>
              </VStack>
            </Card>

            {/* Current Balance Card */}
            <Card animate>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">Current Balance</Heading>
                  <HStack>
                    <IconButton
                      icon={<FaSync />}
                      isLoading={refreshing}
                      onClick={handleRefresh}
                      aria-label="Refresh balance"
                      variant="ghost"
                      size="sm"
                    />
                    <Icon
                      as={balanceChange >= 0 ? FaArrowUp : FaArrowDown}
                      boxSize={6}
                      color={
                        balanceChange > 0 ? 'green.500' :
                        balanceChange < 0 ? 'red.500' :
                        'gray.500'
                      }
                    />
                  </HStack>
                </HStack>
                <Stat>
                  <StatNumber
                    color={
                      balanceChange > 0 ? 'green.500' :
                      balanceChange < 0 ? 'red.500' :
                      'gray.500'
                    }
                  >
                    {formatCurrency(currentBalance)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type={balanceChange >= 0 ? 'increase' : 'decrease'} />
                    {Math.abs(percentChange).toFixed(1)}% from yesterday
                  </StatHelpText>
                </Stat>
              </VStack>
            </Card>
          </SimpleGrid>
        </AnimatedBox>

        {/* Balance Chart */}
        <AnimatedBox delay={0.2}>
          <Card>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Balance Trend</Heading>
              <Box height="300px">
                <LineChart data={balanceHistory} />
              </Box>
            </VStack>
          </Card>
        </AnimatedBox>
      </VStack>

      {/* Update Goal Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Monthly Goal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>New Goal Amount</FormLabel>
              <Input
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Enter goal amount"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={handleUpdateGoal}>
              Update
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Home;