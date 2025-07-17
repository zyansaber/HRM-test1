import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DepartmentSummary } from '@/types/hr';

interface ImprovedDepartmentChartProps {
  data: DepartmentSummary[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FBBF24', '#EC4899'];

export const ImprovedDepartmentChart = ({ data }: ImprovedDepartmentChartProps) => {
  const pieData = data.map((dept, index) => ({
    department: dept.department,
    paymentAmount: dept.paymentAmount,
    color: COLORS[index % COLORS.length],
    percentage: data.length > 0 ? ((dept.paymentAmount / data.reduce((sum, d) => sum + d.paymentAmount, 0)) * 100) : 0
  }));

  const maxAmount = Math.max(...data.map(d => d.paymentAmount));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-lg border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle>Department Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="department" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
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
              <Bar dataKey="overtimeAmount" fill="#8b5cf6" name="overtimeAmount" />
              <Bar dataKey="paymentAmount" fill="#10b981" name="paymentAmount" />
              <Bar dataKey="budgetUtilization" fill="#f59e0b" name="budgetUtilization" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle>Payment Distribution by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pieData.map((item, index) => (
              <div key={item.department} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-sm">{item.department}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${item.paymentAmount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2 ml-4">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(item.paymentAmount / maxAmount) * 100}%`,
                      backgroundColor: item.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};