import React from 'react';
import Card from '../Card';
import Loader from '../Loader';

/**
 * Reusable Container for Data Visualizations/Charts.
 * @param {Object} props
 * @param {string} props.title - Chart title
 * @param {boolean} props.isLoading - Displays inline spinner during data loads
 */
const ChartCard = ({
  title,
  subtitle,
  actions,
  children,
  isLoading = false,
  className = '',
  height = 'h-64'
}) => {
  return (
    <Card title={title} subtitle={subtitle} actions={actions} className={className}>
      <div className={`relative w-full ${height} flex items-center justify-center`}>
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader size="md" />
            <span className="text-xs text-text-secondary">Generating visualization...</span>
          </div>
        ) : (
          <div className="w-full h-full">
            {children}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChartCard;
export { ChartCard };
