import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DepartmentSummary } from '@/types/hr';

interface DepartmentChartProps {
  data: DepartmentSummary[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const DepartmentChart = ({ data }: DepartmentChartProps) => {
  const pieData = data.map(dept => ({
    name: dept.department,
    value: dept.paymentAmount,
    percentage: data.length > 0 ? ((dept.paymentAmount / data.reduce((sum, d) => sum + d.paymentAmount, 0)) * 100).toFixed(1) : 0
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Department Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'overtimeAmount' ? `$${Number(value).toLocaleString()}` :
                  name === 'paymentAmount' ? `$${Number(value).toLocaleString()}` :
                  name === 'budgetUtilization' ? `${Number(value).toFixed(1)}%` :
                  value,
                  name === 'overtimeAmount' ? 'Overtime Amount' :
                  name === 'paymentAmount' ? 'Payment Amount' :
                  name === 'budgetUtilization' ? 'Budget Utilization' :
                  name === 'overtime' ? 'Overtime Hours' :
                  name === 'absenteeism' ? 'Absenteeism Hours' :
                  'Payments Count'
                ]}
              />
              <Bar dataKey="overtimeAmount" fill="#8884d8" name="overtimeAmount" />
              <Bar dataKey="paymentAmount" fill="#82ca9d" name="paymentAmount" />
              <Bar dataKey="budgetUtilization" fill="#ffc658" name="budgetUtilization" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Distribution by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};