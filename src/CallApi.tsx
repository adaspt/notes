import { FC } from 'react';
import { useApiQuery } from './hooks/useApiQuery';
import { getItems } from './api/notes';

const CallApi: FC = () => {
  const { data, refetch } = useApiQuery(getItems());

  return (
    <div>
      <pre>{JSON.stringify(data, undefined, 2)}</pre>
      <button type="button" onClick={() => refetch()}>
        Refresh
      </button>
    </div>
  );
};

export default CallApi;
