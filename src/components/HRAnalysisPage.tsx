import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, DollarSign, Clock } from 'lucide-react';
import { HRData, LocationAnalysis } from '@/types/hr';

interface HRAnalysisPageProps {
  data: HRData;
}

export const HRAnalysisPage = ({ data }: HRAnalysisPageProps) => {
  const parseAmount = (amount: string): number => {
    return parseFloat(amount.replace(/[$,]/g, ''));
  };

  const getLocationAnalysis = (): LocationAnalysis[] => {
    const analysis: LocationAnalysis[] = [];
    
    Object.entries(data.Payment || {}).forEach(([department, locations]) => {
      Object.entries(locations).forEach(([location, employees]) => {
        let employeeCount = 0;
        let paymentAmount = 0;
        let overtimeAmount = 0;

        // Count employees and calculate payments
        Object.entries(employees).forEach(([empId, empData]) => {
          if (typeof empData === 'object' && empData.Name) {
            employeeCount++;
            Object.entries(empData).forEach(([key, value]) => {
              if (key.includes('2025-07') && typeof value === 'object' && 'Payment' in value) {
                paymentAmount += parseAmount(value.Payment);
              }
            });
          }
        });

        // Calculate overtime for this location
        if (data.Overtime?.[department]?.[location]) {
          Object.entries(data.Overtime[department][location]).forEach(([key, value]) => {
            if (key.includes('2025-07') && typeof value === 'object' && 'OT_Amount' in value) {
              overtimeAmount += parseAmount(value.OT_Amount);
            }
          });
        }

        if (employeeCount > 0) {
          analysis.push({
            department,
            location,
            employeeCount,
            paymentAmount,
            overtimeAmount,
            paymentPercentage: 0, // Will be calculated below
            overtimePercentage: 0 // Will be calculated below
          });
        }
      });
    });

    // Calculate percentages
    const totalPayment = analysis.reduce((sum, item) => sum + item.paymentAmount, 0);
    const totalOvertime = analysis.reduce((sum, item) => sum + item.overtimeAmount, 0);

    return analysis.map(item => ({
      ...item,
      paymentPercentage: totalPayment > 0 ? (item.paymentAmount / totalPayment) * 100 : 0,
      overtimePercentage: totalOvertime > 0 ? (item.overtimeAmount / totalOvertime) * 100 : 0
    }));
  };

  const locationAnalysis = getLocationAnalysis();
  const departments = [...new Set(locationAnalysis.map(item => item.department))];

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          HR Organization Analysis
        </h1>
        <p className="text-lg text-muted-foreground">
          Department → Location → Employee Distribution
        </p>
      </div>

      {departments.map(department => {
        const deptLocations = locationAnalysis.filter(item => item.department === department);
        const deptTotalEmployees = deptLocations.reduce((sum, loc) => sum + loc.employeeCount, 0);
        const deptTotalPayment = deptLocations.reduce((sum, loc) => sum + loc.paymentAmount, 0);
        const deptTotalOvertime = deptLocations.reduce((sum, loc) => sum + loc.overtimeAmount, 0);

        return (
          <Card key={department} className="shadow-xl border-t-4 border-t-indigo-500">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-indigo-900">{department}</h2>
                    <p className="text-sm text-indigo-600">Total: {deptTotalEmployees} employees</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    ${deptTotalPayment.toLocaleString()}
                  </div>
                  <div className="text-sm text-orange-600">
                    OT: ${deptTotalOvertime.toLocaleString()}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deptLocations.map((location) => (
                  <Card key={`${location.department}-${location.location}`} className="border-l-4 border-l-blue-400 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">{location.location}</h3>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Employee Count */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Employees</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {location.employeeCount}
                        </Badge>
                      </div>

                      {/* Payment Analysis */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-600">Payment</span>
                          </div>
                          <span className="text-sm font-medium">
                            {location.paymentPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={location.paymentPercentage} className="h-2" />
                        <div className="text-xs text-gray-500 text-right">
                          ${location.paymentAmount.toLocaleString()}
                        </div>
                      </div>

                      {/* Overtime Analysis */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-gray-600">Overtime</span>
                          </div>
                          <span className="text-sm font-medium">
                            {location.overtimePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={location.overtimePercentage} className="h-2" />
                        <div className="text-xs text-gray-500 text-right">
                          ${location.overtimeAmount.toLocaleString()}
                        </div>
                      </div>

                      {/* Employee Density */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          Employee Ratio: {((location.employeeCount / deptTotalEmployees) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};