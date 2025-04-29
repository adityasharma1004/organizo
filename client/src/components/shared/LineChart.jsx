import { Box, useColorModeValue } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ data, options = {} }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: borderColor,
        },
      },
      x: {
        grid: {
          color: borderColor,
        },
      },
    },
  };

  return (
    <Box
      bg={bgColor}
      p={4}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      height="300px"
    >
      <Line data={data} options={{ ...defaultOptions, ...options }} />
    </Box>
  );
};

export default LineChart;