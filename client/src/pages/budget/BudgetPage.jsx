import { 
  Box, 
  Container, 
  SimpleGrid, 
  Heading, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  VStack,
  Text,
  Button,
  useColorModeValue,
  Spinner,
  HStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useDisclosure,
  Flex,
  Tooltip,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { useUser } from '@clerk/clerk-react';
import { FaWallet, FaChartLine, FaMoneyBillWave, FaPiggyBank } from 'react-icons/fa';
import TransactionArea from '../../components/budget/TransactionArea';
import MonthlyIncomeModal from '../../components/budget/MonthlyIncomeModal';
import { getTransactions } from '../../utils/supabase';
import Card from '../../components/shared/Card';
import AnimatedBox from '../../components/shared/AnimatedBox';
import useChartStyles from '../../components/shared/ChartStyles';
import { formatCurrency } from '../../utils/formatters';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const BudgetPage = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [savingsAmount, setSavingsAmount] = useState(0);
  const [previousBalance, setPreviousBalance] = useState(0);
  const { pieOptions, barOptions, chartColors } = useChartStyles();
  
  const [monthlyData, setMonthlyData] = useState({
    labels: ['Food', 'Travel', 'Subscriptions', 'Shopping', 'Misc', 'Investment', 'Savings'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: [
        ...chartColors.expenses,
        chartColors.investment,
        chartColors.savings
      ],
      borderColor: 'transparent',
    }],
  });

  const [yearlyData, setYearlyData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Monthly Expenses',
      data: Array(12).fill(0),
      backgroundColor: chartColors.monthly,
      borderColor: 'transparent',
      borderRadius: 4,
    }],
  });

  const { user } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const calculateCategoryTotals = (transactions) => {
    const categories = {
      food: 0,
      travel: 0,
      subscriptions: 0,
      shopping: 0,
      misc: 0,
      investment: 0,
      savings: 0
    };

    transactions
      .filter(t => (t.type === 'spend' || t.type === 'invest') && t.tag)
      .forEach(t => {
        if (t.type === 'invest') {
          categories[t.tag] += t.amount;
        } else if (categories.hasOwnProperty(t.tag)) {
          categories[t.tag] += t.amount;
        }
      });

    return Object.values(categories);
  };

  const calculateMonthlyTotals = (transactions) => {
    const monthlyTotals = Array(12).fill(0);

    transactions
      .filter(t => t.type === 'spend' || t.type === 'invest')
      .forEach(t => {
        const month = new Date(t.date).getMonth();
        monthlyTotals[month] += t.amount;
      });

    return monthlyTotals;
  };

  const calculateSavings = (transactions) => {
    return transactions
      .filter(t => t.type === 'invest' && t.tag === 'savings')
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const calculateBalance = (transactions) => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'receive') {
        return acc + t.amount;
      } else if (t.type === 'spend' || t.type === 'invest') {
        return acc - t.amount;
      }
      return acc;
    }, 0);
  };

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data || []);
      
      // Update balance
      const newBalance = calculateBalance(data);
      setBalance(newBalance);

      // Update savings amount
      const savingsTotal = calculateSavings(data);
      setSavingsAmount(savingsTotal);

      // Update monthly category data
      const categoryTotals = calculateCategoryTotals(data);
      setMonthlyData(prev => ({
        ...prev,
        datasets: [{
          ...prev.datasets[0],
          data: categoryTotals
        }]
      }));

      // Update yearly data
      const monthlyTotals = calculateMonthlyTotals(data);
      setYearlyData(prev => ({
        ...prev,
        datasets: [{
          ...prev.datasets[0],
          data: monthlyTotals
        }]
      }));

      // Calculate previous balance (excluding today's transactions)
      const today = new Date().toISOString().split('T')[0];
      const previousTransactions = data.filter(t => t.date < today);
      const previousBal = calculateBalance(previousTransactions);
      setPreviousBalance(previousBal);

    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAdd = async () => {
    await fetchTransactions();
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading budget data...</Text>
        </VStack>
      </Container>
    );
  }

  const balanceChange = balance - previousBalance;
  const percentChange = previousBalance !== 0 
    ? ((balance - previousBalance) / Math.abs(previousBalance)) * 100 
    : 0;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Balance Overview Cards */}
        <AnimatedBox>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">Current Balance</Heading>
                  <Icon as={FaWallet} boxSize={6} color={balance >= 0 ? 'green.500' : 'red.500'} />
                </HStack>
                <Stat>
                  <StatNumber color={balance >= 0 ? 'green.500' : 'red.500'}>
                    {formatCurrency(balance)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type={balanceChange >= 0 ? 'increase' : 'decrease'} />
                    {Math.abs(percentChange).toFixed(1)}% from yesterday
                  </StatHelpText>
                </Stat>
              </VStack>
            </Card>

            <Card>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">Savings</Heading>
                  <Icon as={FaPiggyBank} boxSize={6} color="cyan.500" />
                </HStack>
                <Stat>
                  <StatNumber color="cyan.500">
                    {formatCurrency(savingsAmount)}
                  </StatNumber>
                  <StatHelpText>
                    Total savings this month
                  </StatHelpText>
                </Stat>
                <Button 
                  colorScheme="green" 
                  leftIcon={<FaMoneyBillWave />}
                  onClick={onOpen}
                >
                  Add Monthly Income
                </Button>
              </VStack>
            </Card>

            <Card>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">Monthly Spending</Heading>
                  <Icon as={FaChartLine} boxSize={6} color="purple.500" />
                </HStack>
                <Stat>
                  <StatNumber color="purple.500">
                    {formatCurrency(
                      transactions
                        .filter(t => {
                          const thisMonth = new Date().getMonth();
                          const transMonth = new Date(t.date).getMonth();
                          return (t.type === 'spend' || t.type === 'invest') &&
                                 transMonth === thisMonth;
                        })
                        .reduce((acc, t) => acc + t.amount, 0)
                    )}
                  </StatNumber>
                  <StatHelpText>Total expenses & investments this month</StatHelpText>
                </Stat>
              </VStack>
            </Card>
          </SimpleGrid>
        </AnimatedBox>

        {/* Charts Section */}
        <AnimatedBox delay={0.2}>
          <Card>
            <Tabs variant="enclosed" colorScheme="brand">
              <TabList>
                <Tab>Monthly View</Tab>
                <Tab>Yearly View</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Flex justify="center" align="center" w="100%" p={4}>
                    <Box w={{ base: "100%", lg: "60%" }} h="400px" position="relative">
                      <Pie data={monthlyData} options={pieOptions} />
                    </Box>
                  </Flex>
                </TabPanel>
                <TabPanel>
                  <Box w="100%" h="400px" position="relative" p={4}>
                    <Bar data={yearlyData} options={barOptions} />
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Card>
        </AnimatedBox>

        {/* Transaction Area */}
        <AnimatedBox delay={0.4}>
          <TransactionArea onTransactionAdd={handleTransactionAdd} />
        </AnimatedBox>
      </VStack>

      {/* Monthly Income Modal */}
      <MonthlyIncomeModal
        isOpen={isOpen}
        onClose={onClose}
        onIncomeAdd={handleTransactionAdd}
      />
    </Container>
  );
};

export default BudgetPage;