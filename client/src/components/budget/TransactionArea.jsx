import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  HStack,
  Icon,
  Heading,
  useColorModeValue,
  SimpleGrid,
  TableContainer,
  IconButton,
  Tooltip,
  Container,
  Alert,
  AlertIcon,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import useErrorHandler from '../../hooks/useErrorHandler';
import { FaMoneyBillWave, FaChartPie, FaHandHoldingUsd, FaEdit, FaTrash, FaExclamationCircle } from 'react-icons/fa';
import { getTransactions, createTransaction } from '../../utils/supabase';
import Card from '../shared/Card';
import StyledBadge from '../shared/StyledBadge';
import AnimatedBox from '../shared/AnimatedBox';
import { formatCurrency, getTransactionTags, getTagColor } from '../../utils/formatters';

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

const TransactionArea = ({ onTransactionAdd }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'spend',
    date: '',
    amount: '',
    description: '',
    tag: ''
  });
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  
  const { handleError, showSuccess } = useErrorHandler();
  const { user } = useUser();
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const tableBorderColor = useColorModeValue('gray.200', 'gray.600');
  const tableRowHoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchTransactions();
    
    // Add slow connection detection
    const timeoutId = setTimeout(() => {
      if (loading) {
        setIsSlowConnection(true);
      }
    }, 5000);
    
    return () => {
      clearTimeout(timeoutId);
      setIsSlowConnection(false);
    };
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      if (!data) {
        handleError(new Error('No transactions found'));
        setTransactions([]);
        return;
      }
      
      // Sort transactions by date (newest first)
      const sortedData = [...data].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );
      
      setTransactions(sortedData);
    } catch (error) {
      handleError(error, 'Error fetching transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateTransaction = (data, type) => {
    if (!data.date) throw new Error('Date is required');
    if (!data.description) throw new Error('Description is required');
    if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
      throw new Error('Please enter a valid amount greater than 0');
    }
    
    // Validate tag based on type
    if (type === 'invest' && !data.tag) {
      throw new Error('Please select an investment category');
    }
    if (type === 'spend' && !data.tag) {
      throw new Error('Please select a spending category');
    }
  };

  const handleSubmit = async (type) => {
    try {
      validateTransaction(newTransaction, type);

      const transaction = {
        ...newTransaction,
        type,
        user_id: user.id,
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date || new Date().toISOString().split('T')[0]
      };

      const createdTransaction = await createTransaction(transaction);
      onTransactionAdd(createdTransaction);
      await fetchTransactions();

      // Reset form
      setNewTransaction({
        type: 'spend',
        date: '',
        amount: '',
        description: '',
        tag: ''
      });

      showSuccess(
        'Transaction Added',
        `${type.charAt(0).toUpperCase() + type.slice(1)} transaction has been recorded`
      );
    } catch (error) {
      handleError(error);
    }
  };
  
  const handleTransactionSelect = (transactionId) => {
    setSelectedTransactionId(transactionId === selectedTransactionId ? null : transactionId);
  };

  if (loading) {
    return (
      <Container centerContent py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading transactions...</Text>
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

  const transactionTypes = [
    { type: 'spend', icon: FaMoneyBillWave, color: 'red.500' },
    { type: 'invest', icon: FaChartPie, color: 'purple.500' },
    { type: 'receive', icon: FaHandHoldingUsd, color: 'green.500' }
  ];

  // Mobile transaction item renderer
  const MobileTransactionItem = ({ transaction }) => (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="lg" 
      mb={3}
      onClick={() => handleTransactionSelect(transaction.id)}
      bg={selectedTransactionId === transaction.id
        ? useColorModeValue('gray.100', 'gray.600')
        : 'transparent'
      }
      _hover={{
        bg: useColorModeValue('gray.50', 'gray.700'),
      }}
    >
      <Flex justifyContent="space-between" mb={2}>
        <Text fontWeight="medium">{transaction.description}</Text>
        <Text
          fontWeight="semibold"
          color={
            transaction.type === 'receive' ? 'green.500' :
            transaction.type === 'invest' ? 'blue.500' :
            'red.500'
          }
        >
          {transaction.type === 'spend' || transaction.type === 'invest' ? '- ' : '+ '}
          {formatCurrency(transaction.amount)}
        </Text>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="sm" color="gray.500">
          {new Date(transaction.date).toLocaleDateString()}
        </Text>
        <HStack spacing={2}>
          <StyledBadge type={transaction.type} size="sm">
            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
          </StyledBadge>
          {transaction.tag && (
            <StyledBadge type={getTagColor(transaction.tag)} size="sm">
              {transaction.tag.charAt(0).toUpperCase() + transaction.tag.slice(1)}
            </StyledBadge>
          )}
        </HStack>
      </Flex>
    </Box>
  );

  return (
    <Card>
      <VStack spacing={6} align="stretch">
        <Tabs variant="enclosed" colorScheme="brand" isLazy>
          <TabList overflowX="auto" className="mobile-tab-list">
            {transactionTypes.map(({ type, icon: IconComponent, color }) => (
              <Tab key={type} minWidth="auto" px={{ base: 3, md: 4 }}>
                <HStack spacing={{ base: 1, md: 2 }}>
                  <Icon as={IconComponent} color={color} />
                  <Text display={{ base: 'none', sm: 'block' }}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </HStack>
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {transactionTypes.map(({ type }) => (
              <TabPanel key={type} p={{ base: 2, md: 4 }}>
                <VStack spacing={4} align="stretch" className="transaction-form-mobile">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Date</FormLabel>
                      <Input
                        type="date"
                        name="date"
                        value={newTransaction.date}
                        onChange={handleInputChange}
                        size={{ base: "md", md: "lg" }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Amount</FormLabel>
                      <Input
                        type="number"
                        name="amount"
                        placeholder="Enter amount"
                        value={newTransaction.amount}
                        onChange={handleInputChange}
                        size={{ base: "md", md: "lg" }}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Input
                      name="description"
                      placeholder="Enter description"
                      value={newTransaction.description}
                      onChange={handleInputChange}
                      size={{ base: "md", md: "lg" }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <Select
                      name="tag"
                      value={newTransaction.tag}
                      onChange={handleInputChange}
                      size={{ base: "md", md: "lg" }}
                    >
                      <option value="">Select category</option>
                      {getTransactionTags(type).map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    colorScheme="brand"
                    size={{ base: "md", md: "lg" }}
                    onClick={() => handleSubmit(type)}
                    leftIcon={<Icon as={transactionTypes.find(t => t.type === type).icon} />}
                  >
                    Add {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                </VStack>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>

        {/* Transaction History - Responsive version */}
        <VStack spacing={4} align="stretch">
          <Heading size="md">Transaction History</Heading>
          
          {/* Mobile view - Card list */}
          <Box display={{ base: 'block', md: 'none' }}>
            {transactions.length === 0 ? (
              <Box textAlign="center" py={8}>
                <VStack spacing={3}>
                  <Icon as={FaMoneyBillWave} boxSize={8} color="gray.400" />
                  <Text color="gray.500">No transactions found</Text>
                  <Text color="gray.400" fontSize="sm">
                    Add your first transaction using the form above
                  </Text>
                </VStack>
              </Box>
            ) : (
              transactions.map((transaction) => (
                <MobileTransactionItem key={transaction.id} transaction={transaction} />
              ))
            )}
          </Box>

          {/* Desktop view - Table */}
          <Box
            borderRadius="lg"
            borderWidth="1px"
            overflow="hidden"
            role="grid"
            tabIndex={0}
            display={{ base: 'none', md: 'block' }}
            onFocus={() => {
              // Auto-select first transaction if none selected
              if (transactions.length && !selectedTransactionId) {
                handleTransactionSelect(transactions[0].id);
              }
            }}
          >
            <Table variant="simple">
              <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                <Tr>
                  <Th py={4} px={6} textAlign="left" width="20%">Date</Th>
                  <Th py={4} px={6} textAlign="center" width="15%">Type</Th>
                  <Th py={4} px={6} textAlign="left" width="25%">Description</Th>
                  <Th py={4} px={6} textAlign="right" width="20%">Amount</Th>
                  <Th py={4} px={6} textAlign="center" width="20%">Category</Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={8}>
                      <VStack spacing={3}>
                        <Icon
                          as={FaMoneyBillWave}
                          boxSize={8}
                          color="gray.400"
                        />
                        <Text color="gray.500">No transactions found</Text>
                        <Text color="gray.400" fontSize="sm">
                          Add your first transaction using the form above
                        </Text>
                      </VStack>
                    </Td>
                  </Tr>
                ) : (
                  transactions.map((transaction) => (
                    <Tr
                      key={transaction.id}
                      data-transaction-id={transaction.id}
                      onClick={() => handleTransactionSelect(transaction.id)}
                      cursor="pointer"
                      _hover={{
                        bg: useColorModeValue('gray.50', 'gray.700'),
                      }}
                      bg={
                        selectedTransactionId === transaction.id
                          ? useColorModeValue('gray.100', 'gray.600')
                          : 'transparent'
                      }
                    >
                      <Td py={4} px={6}>
                        {new Date(transaction.date).toLocaleDateString()}
                      </Td>
                      <Td py={4} px={6} textAlign="center">
                        <StyledBadge type={transaction.type}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </StyledBadge>
                      </Td>
                      <Td py={4} px={6}>
                        {transaction.description}
                      </Td>
                      <Td py={4} px={6} textAlign="right">
                        <Text
                          fontWeight="semibold"
                          color={
                            transaction.type === 'receive' ? 'green.500' :
                            transaction.type === 'invest' ? 'blue.500' :
                            'red.500'
                          }
                        >
                          {transaction.type === 'spend' || transaction.type === 'invest' ? '- ' : '+ '}
                          {formatCurrency(transaction.amount)}
                        </Text>
                      </Td>
                      <Td py={4} px={6} textAlign="center">
                        <StyledBadge type={getTagColor(transaction.tag)}>
                          {transaction.tag
                            ? transaction.tag.charAt(0).toUpperCase() + transaction.tag.slice(1)
                            : '-'
                          }
                        </StyledBadge>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </VStack>
    </Card>
  );
};

export default TransactionArea;