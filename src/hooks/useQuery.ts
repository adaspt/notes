import { useEffect, useState } from 'react';

export interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

const initialState: QueryState<null> = {
  data: null,
  loading: true,
  error: null
};

export function useQuery<T>(queryFn: () => Promise<T>, deps: unknown[] = []): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>(initialState as QueryState<T>);

  useEffect(() => {
    let isMounted = true;

    setState(initialState as QueryState<T>);
    queryFn().then(
      (data) => {
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      },
      (error) => {
        if (isMounted) {
          setState({ data: null, loading: false, error });
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, deps);

  return state;
}
