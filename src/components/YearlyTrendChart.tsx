import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface YearlyTrendData {
  month: string;
  overtime: number;
  absenteeism: number;
  payments: number;
}

interface YearlyTrendChartProps {
  data: YearlyTrendData[];
  department?: string;
}

export const YearlyTrendChart = ({ data, department }: YearlyTrendChartProps) => {
  // Generate mock yearly data for demonstration
  const yearlyData = [
    { month: 'Jan 2025', overtime: 120, absenteeism: 45, payments: 28 },
    { month: 'Feb 2025', overtime: 135, absenteeism: 38, payments: 32 },
    { month: 'Mar 2025', overtime: 142, absenteeism: 52, payments: 29 },
    { month: 'Apr 2025', overtime: 128, absenteeism: 41, payments: 35 },
    { month: 'May 2025', overtime: 156, absenteeism: 47, payments: 31 },
    { month: 'Jun 2025', overtime: 148, absenteeism: 39, payments: 33 },
    { month: 'Jul 2025', overtime: 162, absenteeism: 55, payments: 36 },
    { month: 'Aug 2025', overtime: 140, absenteeism: 43, payments: 30 },
    { month: 'Sep 2025', overtime: 158, absenteeism: 49, payments: 34 },
    { month: 'Oct 2025', overtime: 145, absenteeism: 46, payments: 32 },
    { month: 'Nov 2025', overtime: 139, absenteeism: 41, payments: 29 },
    { month: 'Dec 2025', overtime: 151, absenteeism: 44, payments: 31 }
  ];

  return (
    <Card className="shadow-lg border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-purple-600">📊</span>
          2025 Yearly Trend Analysis
          {department && (
            <span className="text-sm font-normal text-gray-600">- {department}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#666"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip 
              labelFormatter={(value) => `Month: ${value}`}
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