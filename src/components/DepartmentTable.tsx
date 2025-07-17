import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DepartmentSummary } from '@/types/hr';

interface DepartmentTableProps {
  data: DepartmentSummary[];
}

export const DepartmentTable = ({ data }: DepartmentTableProps) => {
  const getBudgetStatus = (utilization: number) => {
    if (utilization > 100) return { label: 'Over Budget', variant: 'destructive' as const };
    if (utilization > 80) return { label: 'Near Limit', variant: 'secondary' as const };
    return { label: 'Within Budget', variant: 'default' as const };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Department Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Overtime Hours</TableHead>
              <TableHead>Overtime Amount</TableHead>
              <TableHead>Absenteeism</TableHead>
              <TableHead>Payments</TableHead>
              <TableHead>Payment Amount</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Budget Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((dept) => {
              const budgetStatus = getBudgetStatus(dept.budgetUtilization);
              return (
                <TableRow key={dept.department}>
                  <TableCell className="font-medium">{dept.department}</TableCell>
                  <TableCell>{dept.overtime.toFixed(1)}h</TableCell>
                  <TableCell>${dept.overtimeAmount.toLocaleString()}</TableCell>
                  <TableCell>{dept.absenteeism.toFixed(1)}h</TableCell>
                  <TableCell>{dept.payments}</TableCell>
                  <TableCell>${dept.paymentAmount.toLocaleString()}</TableCell>
                  <TableCell>${dept.budget.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={budgetStatus.variant}>
                        {budgetStatus.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {dept.budgetUtilization.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};