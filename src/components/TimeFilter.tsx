import { Button } from '@/components/ui/button';

interface TimeFilterProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  availableDates: string[];
}

export const TimeFilter = ({ selectedPeriod, onPeriodChange, availableDates }: TimeFilterProps) => {
  // Generate all months of 2025
  const allMonths = [
    { value: 'overall', label: 'Overall', short: 'All' },
    { value: '2025-01', label: 'January', short: 'Jan' },
    { value: '2025-02', label: 'February', short: 'Feb' },
    { value: '2025-03', label: 'March', short: 'Mar' },
    { value: '2025-04', label: 'April', short: 'Apr' },
    { value: '2025-05', label: 'May', short: 'May' },
    { value: '2025-06', label: 'June', short: 'Jun' },
    { value: '2025-07', label: 'July', short: 'Jul' },
    { value: '2025-08', label: 'August', short: 'Aug' },
    { value: '2025-09', label: 'September', short: 'Sep' },
    { value: '2025-10', label: 'October', short: 'Oct' },
    { value: '2025-11', label: 'November', short: 'Nov' },
    { value: '2025-12', label: 'December', short: 'Dec' }
  ];

  // Check if month has data
  const hasData = (monthValue: string) => {
    if (monthValue === 'overall') return true;
    return availableDates.some(date => date.startsWith(monthValue));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Time Period</label>
      <div className="grid grid-cols-4 gap-2">
        {allMonths.map(month => (
          <Button
            key={month.value}
            variant={selectedPeriod === month.value ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange(month.value)}
            className={`
              relative transition-all duration-200 text-xs
              ${selectedPeriod === month.value 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                : hasData(month.value)
                  ? 'hover:bg-blue-50 hover:border-blue-300'
                  : 'opacity-50 text-gray-400 cursor-not-allowed'
              }
            `}
            disabled={!hasData(month.value)}
          >
            {month.short}
            {hasData(month.value) && month.value !== 'overall' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};