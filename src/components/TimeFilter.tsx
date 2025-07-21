import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

interface TimeFilterProps {
  selectedMonth: string | null;
  selectedDate: string | null;
  onSelectMonth: (month: string) => void;
  onSelectDate: (date: string) => void;
  availableDates: { months: string[], datesByMonth: Record<string, string[]> };
}

export const TimeFilter = ({ selectedMonth, selectedDate, onSelectMonth, onSelectDate, availableDates }: TimeFilterProps) => {
  const groupedByMonth = useMemo(() => {
    const monthMap: Record<string, string[]> = {};
    Object.values(availableDates.datesByMonth).flat().forEach(date => {
      const month = date.slice(0, 7); // '2025-07'
      if (!monthMap[month]) monthMap[month] = [];
      monthMap[month].push(date);
    });
    return monthMap;
  }, [availableDates]);

  const allMonths = Array.from({ length: 12 }, (_, i) => `2025-${String(i + 1).padStart(2, '0')}`);

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-400 uppercase tracking-wide">Time Period</div>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => { onSelectMonth(null); onSelectDate(null); }}
          className={`py-2 text-sm rounded-md font-medium transition-colors border border-gray-200 hover:bg-gray-100 ${
            selectedPeriod === 'overall' ? 'bg-blue-100 text-blue-800' : 'bg-white'
          }`}
        >
          Overall
        </button>
        {allMonths.map(month => {
          const hasData = !!groupedByMonth[month];
          return (
            <div key={month} className="relative">
              <button
                onClick={() => { onSelectMonth(month); onSelectDate(null); }}
                disabled={!hasData}
                className={`w-full py-2 text-sm rounded-md font-medium transition-colors border border-gray-200 hover:bg-gray-100 ${
                  selectedPeriod === month ? 'bg-blue-100 text-blue-800' : 'bg-white'
                } ${!hasData ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}
              </button>
              {hasData && (
                <div className="absolute top-1 right-1">
                  <span className="block h-2 w-2 rounded-full bg-green-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedPeriod !== 'overall' && selectedMonth ? availableDates.datesByMonth[selectedMonth] : [] && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedMonth ? availableDates.datesByMonth[selectedMonth] : [].map(date => (
            <Badge
              key={date}
              variant={selectedDate === date ? 'default' : 'secondary'}
              onClick={() => onSelectDate(date)}
              className="cursor-pointer"
            >
              {date}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
