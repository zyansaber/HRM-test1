import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DepartmentSummary } from '@/types/hr';

interface RingPaymentChartProps {
  data: DepartmentSummary[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FBBF24', '#EC4899'];

export const RingPaymentChart = ({ data }: RingPaymentChartProps) => {
  const chartData = data.map((dept, index) => ({
    name: dept.department,
    value: dept.paymentAmount,
    color: COLORS[index % COLORS.length],
    percentage: data.length > 0 ? ((dept.paymentAmount / data.reduce((sum, d) => sum + d.paymentAmount, 0)) * 100) : 0
  }));

  interface LabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    name: string;
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: LabelProps) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for very small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={11}
        fontWeight="600"
      >
        <tspan x={x} dy="0">{name}</tspan>
        <tspan x={x} dy="12" fontSize={10} fill="#6b7280">{`${(percent * 100).toFixed(1)}%`}</tspan>
      </text>
    );
  };

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        value: number;
        percentage: number;
      };
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <div className="font-semibold">{data.name}</div>
          <div className="text-green-600">${data.value.toLocaleString()}</div>
          <div className="text-gray-500">{data.percentage.toFixed(1)}%</div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="text-center">Payment Distribution by Department</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          {/* Ring Chart with Labels */}
          <div className="w-96 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};