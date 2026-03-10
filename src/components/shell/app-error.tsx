import type { FallbackProps } from 'react-error-boundary';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

function AppError({ error, resetErrorBoundary }: FallbackProps) {
  const handleReset = async () => {
    indexedDB.deleteDatabase('Notes').onsuccess = () => {
      localStorage.clear();
      location.assign('/');
    };
  };

  return (
    <div className="p-4">
      <p>{getErrorMessage(error)}</p>
      <div className="flex flex-col gap-2 mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={resetErrorBoundary}
        >
          Try again
        </button>
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default AppError;
