import { useToast } from '@chakra-ui/react';
import { createToastConfig } from '../components/shared/CustomToast';

const useCustomToast = () => {
  const toast = useToast();

  const showToast = (title, description, status = 'info') => {
    const config = createToastConfig(title, description, status);
    toast(config);
  };

  return {
    success: (title, description) => showToast(title, description, 'success'),
    error: (title, description) => showToast(title, description, 'error'),
    warning: (title, description) => showToast(title, description, 'warning'),
    info: (title, description) => showToast(title, description, 'info'),
    loading: (title = 'Loading...', description = '') => 
      toast({
        ...createToastConfig(title, description, 'info'),
        duration: null,
        isClosable: false,
      }),
    closeAll: () => toast.closeAll(),
    update: (id, options) => {
      const config = createToastConfig(
        options.title,
        options.description,
        options.status
      );
      toast.update(id, {
        ...config,
        ...options,
      });
    },
  };
};

export default useCustomToast;