import React from 'react';
import { useBreadcrumbsContext } from './BreadcrumbsContext';

const BreadcrumbSeparator: React.FC = () => {
  const { separator } = useBreadcrumbsContext(); 

  return <span className="mx-sm text-gray-500">{separator}</span>;
};

export default BreadcrumbSeparator;
