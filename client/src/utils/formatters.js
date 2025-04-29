// Currency formatter for Indian Rupee
export const formatCurrency = (amount, options = {}) => {
  const {
    decimal = 2,
    displayZero = true,
    useParentheses = false
  } = options;

  if (!displayZero && amount === 0) {
    return '₹0';
  }

  try {
    // Convert to number if string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Handle invalid numbers
    if (isNaN(numAmount)) {
      console.warn('Invalid amount provided to formatCurrency:', amount);
      return '₹0';
    }

    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
    });

    const formatted = formatter.format(Math.abs(numAmount));

    // Handle negative numbers
    if (numAmount < 0) {
      return useParentheses ? `(${formatted})` : `-${formatted}`;
    }

    return formatted;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return '₹0';
  }
};

// Transaction tag helpers
export const getTransactionTags = (type) => {
  switch (type) {
    case 'spend':
      return [
        { value: 'food', label: 'Food' },
        { value: 'travel', label: 'Travel' },
        { value: 'subscriptions', label: 'Subscriptions' },
        { value: 'shopping', label: 'Shopping' },
        { value: 'misc', label: 'Misc' }
      ];
    case 'invest':
      return [
        { value: 'investment', label: 'Investment' },
        { value: 'savings', label: 'Savings' }
      ];
    case 'receive':
      return [
        { value: 'income', label: 'Income' },
        { value: 'refund', label: 'Refund' },
        { value: 'other', label: 'Other' }
      ];
    default:
      return [];
  }
};

export const getTransactionTypeColor = (type) => {
  switch (type) {
    case 'receive':
      return 'green';
    case 'spend':
      return 'red';
    case 'invest':
      return 'purple';
    default:
      return 'gray';
  }
};

export const getTagColor = (tag) => {
  switch (tag?.toLowerCase()) {
    // Spend tags
    case 'food':
      return 'red';
    case 'travel':
      return 'blue';
    case 'subscriptions':
      return 'purple';
    case 'shopping':
      return 'pink';
    case 'misc':
      return 'gray';
    
    // Invest tags
    case 'investment':
      return 'teal';
    case 'savings':
      return 'cyan';
    
    // Receive tags
    case 'income':
      return 'green';
    case 'refund':
      return 'orange';
    case 'other':
      return 'gray';
    
    default:
      return 'gray';
  }
};

// Date formatters
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return date;
  }
};

export const formatTime = (time) => {
  if (!time) return '';
  
  try {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
};

// Number formatters
export const formatPercentage = (value, decimal = 1) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(decimal)}%`;
};

export const formatNumber = (value, decimal = 0) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal,
  }).format(value);
};