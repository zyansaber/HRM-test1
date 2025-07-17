import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HRData } from '@/types/hr';

interface WeeklyTrendChartProps {
  data: HRData;
  department?: string;
  selectedPeriod?: string;
}

export const WeeklyTrendChart = ({ data, department, selectedPeriod = 'overall' }: WeeklyTrendChartProps) => {
  const parseAmount = (amount: string): number => {
    return parseFloat(amount.replace(/[$,]/g, ''));
  };

  // Generate weekly data for July 2025 (every 7 days)
  const generateWeeklyData = () => {
    const weeks = [
      { date: '2025-07-01', label: 'Jul 1' },
      { date: '2025-07-08', label: 'Jul 8' },
      { date: '2025-07-15', label: 'Jul 15' },
      { date: '2025-07-22', label: 'Jul 22' },
      { date: '2025-07-29', label: 'Jul 29' }
    ];

    return weeks.map(week => {
      let overtime = 0;
      let absenteeism = 0;
      let payments = 0;

      const departmentsToProcess = department ? [department] : Object.keys(data.Payment || {});

      // Calculate overtime
      departmentsToProcess.forEach(dept => {
        if (data.Overtime?.[dept]) {
          Object.values(data.Overtime[dept]).forEach(location => {
            Object.entries(location).forEach(([key, value]) => {
              if (key === week.date && typeof value === 'object' && 'OT_Hours' in value) {
                overtime += value.OT_Hours;
              }
            });
          });
        }
      });

      // Calculate absenteeism
      departmentsToProcess.forEach(dept => {
        if (data.Absenteeism?.[dept]) {
          Object.values(data.Absenteeism[dept]).forEach(location => {
            Object.values(location).forEach(employee => {
              if (typeof employee === 'object' && employee !== null) {
                Object.entries(employee).forEach(([key, value]) => {
                  if (key === week.date && typeof value === 'object' && 'Absenteeism' in value) {
                    absenteeism += value.Absenteeism;
                  }
                });
              }
            });
          });
        }
      });

      // Calculate payments
      departmentsToProcess.forEach(dept => {
        if (data.Payment?.[dept]) {
          Object.values(data.Payment[dept]).forEach(location => {
            Object.values(location).forEach(employee => {
              if (typeof employee === 'object' && employee !== null) {
                Object.entries(employee).forEach(([key, value]) => {
                  if (key === week.date && typeof value === 'object' && 'Payment' in value) {
                    payments++;
                  }
                });
              }
            });
          });
        }
      });

      return {
        week: week.label,
        overtime: overtime || 0, // Use real data only, 0 if no data
        absenteeism: absenteeism || 0,
        payments: payments || 0
      };
    });
  };

  const weeklyData = generateWeeklyData();

  return (
    <Card className="shadow-lg border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-purple-600">📊</span>
          {selectedPeriod === 'overall' ? '2025 Weekly Trend Analysis' :
           selectedPeriod.includes('-') ? 
            new Date(selectedPeriod + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + ' Weekly Trend Analysis' :
            selectedPeriod + ' Weekly Trend Analysis'
          }
          {department && (
            <span className="text-sm font-normal text-gray-600">- {department}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="week" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip 
              labelFormatter={(value) => `Week: ${value}`}
              formatter={(value, name) => [
                typeof value === 'number' ? value.toFixed(1) : value,
                name === 'overtime' ? 'Overtime Hours' :
                name === 'absenteeism' ? 'Absenteeism Hours' :
                'Payment Count'
              ]}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="overtime" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
              name="Overtime Hours"
            />
            <Line 
              type="monotone" 
              dataKey="absenteeism" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
              name="Absenteeism Hours"
            />
            <Line 
              type="monotone" 
              dataKey="payments" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              name="Payment Count"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};