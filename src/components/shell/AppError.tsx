import type { FallbackProps } from 'react-error-boundary';

function AppError({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export default AppError;
