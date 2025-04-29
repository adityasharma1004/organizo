import { useColorModeValue } from '@chakra-ui/react';

export const useChartStyles = () => {
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const gridColor = useColorModeValue('gray.200', 'gray.700');
  const tooltipBg = useColorModeValue('white', 'gray.800');
  const tooltipBorder = useColorModeValue('gray.200', 'gray.600');

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            family: 'Inter',
            size: 12,
            weight: '500',
          },
          color: textColor,
        },
        title: {
          color: textColor,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        bodySpacing: 4,
        titleSpacing: 8,
        titleMarginBottom: 8,
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: '600',
        },
        bodyFont: {
          family: 'Inter',
          size: 12,
        },
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== undefined) {
              label += new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR'
              }).format(context.parsed);
            }
            return label;
          }
        }
      },
    },
  };

  const pieOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      title: {
        display: true,
        text: 'Monthly Transactions by Category',
        font: {
          family: 'Inter',
          size: 16,
          weight: 'bold',
        },
        color: textColor,
        padding: 20,
      },
    },
    cutout: '60%',
    radius: '90%',
  };

  const barOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      title: {
        display: true,
        text: 'Monthly Overview',
        font: {
          family: 'Inter',
          size: 16,
          weight: 'bold',
        },
        color: textColor,
        padding: 20,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
          drawBorder: false,
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 12,
          },
          color: textColor,
          padding: 8,
          callback: function(value) {
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0
            }).format(value);
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 12,
          },
          color: textColor,
          padding: 8,
        },
      },
    },
    borderRadius: 4,
    barThickness: 'flex',
    maxBarThickness: 32,
  };

  const chartColors = {
    expenses: [
      'rgba(239, 68, 68, 0.9)',    // Red - Food
      'rgba(59, 130, 246, 0.9)',   // Blue - Travel
      'rgba(76, 29, 149, 0.9)',    // Deep Purple - Subscriptions
      'rgba(236, 72, 153, 0.9)',   // Pink - Shopping
      'rgba(107, 114, 128, 0.9)',  // Gray - Misc
    ],
    investment: 'rgba(14, 165, 233, 0.9)',  // Lighter Blue
    savings: 'rgba(56, 189, 248, 0.9)',     // Sky Blue
    monthly: 'rgba(59, 130, 246, 0.9)',     // Blue
  };

  // Use different colors for dark mode
  if (useColorModeValue(false, true)) {
    chartColors.expenses = [
      'rgba(252, 165, 165, 0.9)',  // Light Red - Food
      'rgba(147, 197, 253, 0.9)',  // Light Blue - Travel
      'rgba(216, 180, 254, 0.9)',  // Light Purple - Subscriptions
      'rgba(251, 207, 232, 0.9)',  // Light Pink - Shopping
      'rgba(209, 213, 219, 0.9)',  // Light Gray - Misc
    ];
    chartColors.investment = 'rgba(125, 211, 252, 0.9)';  // Light Sky Blue
    chartColors.savings = 'rgba(186, 230, 253, 0.9)';     // Lighter Sky Blue
    chartColors.monthly = 'rgba(147, 197, 253, 0.9)';     // Light Blue
  }

  return {
    pieOptions,
    barOptions,
    chartColors,
  };
};

export default useChartStyles;