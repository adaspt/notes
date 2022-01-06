import { graphQuery } from '../hooks/useApiQuery';

export const getNotes = () => graphQuery('/drive/special/approot');
