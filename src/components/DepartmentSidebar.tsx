import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building, Users, TrendingUp } from 'lucide-react';
import { DepartmentSummary } from '@/types/hr';

interface DepartmentSidebarProps {
  departments: DepartmentSummary[];
  selectedDepartment: string | null;
  onDepartmentSelect: (department: string | null) => void;
}

export const DepartmentSidebar = ({
  departments,
  selectedDepartment,
  onDepartmentSelect,
}: DepartmentSidebarProps) => {
  const totalPayments = departments.reduce((sum, dept) => sum + dept.paymentAmount, 0);

  const getBudgetColor = (utilization: number) => {
    if (utilization > 100) return 'bg-red-500';
    if (utilization > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="h-full w-80 shadow-xl border border-gray-200 rounded-lg bg-gradient-to-b from-white to-gray-50/50">
      <CardContent className="p-0 h-full">
        <ScrollArea className="h-full">
          <div>
            <CardHeader className="pb-4 px-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                  Departments
                </span>
              </CardTitle>
            </CardHeader>

            <div className="space-y-2 p-4">
              {/* Overall Button */}
              <Button
                variant={selectedDepartment === null ? "default" : "outline"}
                className={`w-full justify-start h-auto p-4 transition-all duration-300 ${
                  selectedDepartment === null
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md border-gray-200'
                }`}
                onClick={() => onDepartmentSelect(null)}
              >
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-semibold">Overall View</span>
                  </div>
                  <div className="text-xs opacity-90">
                    Total: ${totalPayments.toLocaleString()}
                  </div>
                </div>
              </Button>

              {departments.map((dept) => {
                const paymentPercentage =
                  totalPayments > 0 ? (dept.paymentAmount / totalPayments) * 100 : 0;

                return (
                  <Button
                    key={dept.department}
                    variant={selectedDepartment === dept.department ? "default" : "outline"}
                    className={`w-full justify-start h-auto p-4 transition-all duration-300 ${
                      selectedDepartment === dept.department
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                        : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md border-gray-200 hover:border-blue-200'
                    }`}
                    onClick={() => onDepartmentSelect(dept.department)}
                  >
                    <div className="flex flex-col items-start w-full space-y-2">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-sm truncate">
                          {dept.department}
                        </span>
                        <div
                          className={`w-3 h-3 rounded-full ${getBudgetColor(
                            dept.budgetUtilization
                          )}`}
                          title={`Budget: ${dept.budgetUtilization.toFixed(1)}%`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 w-full text-xs">
                        <div className="text-left">
                          <div className="opacity-80">Payment %</div>
                          <div className="font-medium">
                            {paymentPercentage.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="opacity-80">vs Budget</div>
                          <div className="font-medium">
                            {dept.budgetUtilization.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs opacity-80">
                        <Users className="h-3 w-3" />
                        <span>{dept.payments} payments</span>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
