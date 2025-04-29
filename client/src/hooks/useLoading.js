import { useState, useCallback } from 'react';
import useCustomToast from './useCustomToast';

const useLoading = (options = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useCustomToast();

  const showError = useCallback((error) => {
    if (options.showToast !== false) {
      toast.error(
        'Error',
        error?.message || 'Something went wrong. Please try again.'
      );
    }
    setError(error);
  }, [options.showToast, toast]);

  const execute = useCallback(async (asyncFunction, loadingMessage = 'Loading...') => {
    setIsLoading(true);
    setError(null);

    let toastId;
    if (options.showLoadingToast !== false) {
      toastId = toast.loading(loadingMessage);
    }

    try {
      const result = await asyncFunction();

      if (options.showSuccessToast && options.successMessage) {
        toast.success('Success', options.successMessage);
      }

      return result;
    } catch (err) {
      showError(err);
      throw err;
    } finally {
      setIsLoading(false);
      if (toastId) {
        toast.closeAll();
      }
    }
  }, [options, showError, toast]);

  const withLoading = useCallback((asyncFunction, loadingMessage) => {
    return (...args) => execute(() => asyncFunction(...args), loadingMessage);
  }, [execute]);

  return {
    isLoading,
    error,
    execute,
    withLoading,
    setIsLoading,
    setError,
  };
};

export default useLoading;