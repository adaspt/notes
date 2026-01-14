import type { FallbackProps } from 'react-error-boundary';

function AppError({ error, resetErrorBoundary }: FallbackProps) {
  const handleReset = async () => {
    indexedDB.deleteDatabase('Notes');
    localStorage.clear();
    location.assign('/');
  };

  return (
    <div className="p-4">
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}

export default AppError;
