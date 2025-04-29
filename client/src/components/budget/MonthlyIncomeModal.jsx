import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { createTransaction } from '../../utils/supabase';
import { formatCurrency } from '../../utils/formatters';

const MonthlyIncomeModal = ({ isOpen, onClose, onIncomeAdd }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid income amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const transaction = {
        type: 'receive',
        amount: parseFloat(amount),
        description: 'Monthly Income',
        date: today,
        tag: 'income',
      };

      await createTransaction(transaction);
      onIncomeAdd();
      onClose();
      setAmount('');
      
      toast({
        title: 'Income Updated',
        description: `Monthly income set to ${formatCurrency(parseFloat(amount))}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Monthly Income</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Monthly Income Amount</FormLabel>
              <Input
                type="number"
                placeholder="Enter monthly income"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </FormControl>
            <Text fontSize="sm" color="gray.500">
              This will update your monthly income and affect your budget calculations
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button 
            colorScheme="brand" 
            mr={3} 
            onClick={handleSubmit}
            isLoading={loading}
          >
            Update Income
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MonthlyIncomeModal;