import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Building2, MapPin, Users, DollarSign, Clock, UserX } from 'lucide-react';
import { HRData } from '@/types/hr';

interface TreeHRAnalysisPageProps {
  data: HRData;
}

interface LocationStats {
  employeeCount: number;
  totalPayment: number;
  totalOvertime: number;
  totalOvertimeAmount: number;
  totalAbsenteeism: number;
}

export const TreeHRAnalysisPage = ({ data }: TreeHRAnalysisPageProps) => {
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());

  const parseAmount = (amount: string): number => {
    return parseFloat(amount.replace(/[$,]/g, ''));
  };

  const toggleDepartment = (department: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(department)) {
      newExpanded.delete(department);
    } else {
      newExpanded.add(department);
    }
    setExpandedDepartments(newExpanded);
  };

  const toggleLocation = (locationKey: string) => {
    const newExpanded = new Set(expandedLocations);
    if (newExpanded.has(locationKey)) {
      newExpanded.delete(locationKey);
    } else {
      newExpanded.add(locationKey);
    }
    setExpandedLocations(newExpanded);
  };

  const getLocationStats = (department: string, location: string): LocationStats => {
    let employeeCount = 0;
    let totalPayment = 0;
    let totalOvertime = 0;
    let totalOvertimeAmount = 0;
    let totalAbsenteeism = 0;

    // Get employee data from Payment section
    if (data.Payment?.[department]?.[location]) {
      const employees = data.Payment[department][location];
      Object.entries(employees).forEach(([empId, empData]) => {
        if (typeof empData === 'object' && empData.Name) {
          employeeCount++;
          Object.entries(empData).forEach(([key, value]) => {
            if (key.includes('2025-07') && typeof value === 'object' && 'Payment' in value) {
              totalPayment += parseAmount(value.Payment);
            }
          });
        }
      });
    }

    // Get overtime data
    if (data.Overtime?.[department]?.[location]) {
      Object.entries(data.Overtime[department][location]).forEach(([key, value]) => {
        if (key.includes('2025-07') && typeof value === 'object' && 'OT_Hours' in value) {
          totalOvertime += value.OT_Hours;
          totalOvertimeAmount += parseAmount(value.OT_Amount);
        }
      });
    }

    // Get absenteeism data
    if (data.Absenteeism?.[department]?.[location]) {
      Object.values(data.Absenteeism[department][location]).forEach(employee => {
        if (typeof employee === 'object' && employee !== null) {
          Object.entries(employee).forEach(([key, value]) => {
            if (key.includes('2025-07') && typeof value === 'object' && 'Absenteeism' in value) {
              totalAbsenteeism += value.Absenteeism;
            }
          });
        }
      });
    }

    return {
      employeeCount,
      totalPayment,
      totalOvertime,
      totalOvertimeAmount,
      totalAbsenteeism
    };
  };

  const getEmployeeList = (department: string, location: string) => {
    const employees: Array<{ id: string; name: string; payment: number; overtime: number; absenteeism: number }> = [];
    
    if (data.Payment?.[department]?.[location]) {
      Object.entries(data.Payment[department][location]).forEach(([empId, empData]) => {
        if (typeof empData === 'object' && empData.Name) {
          let payment = 0;
          const overtime = 0;
          let absenteeism = 0;

          // Get payment data
          Object.entries(empData).forEach(([key, value]) => {
            if (key.includes('2025-07') && typeof value === 'object' && 'Payment' in value) {
              payment += parseAmount(value.Payment);
            }
          });

          // Get absenteeism data
          if (data.Absenteeism?.[department]?.[location]?.[empId]) {
            const absData = data.Absenteeism[department][location][empId];
            if (typeof absData === 'object') {
              Object.entries(absData).forEach(([key, value]) => {
                if (key.includes('2025-07') && typeof value === 'object' && 'Absenteeism' in value) {
                  absenteeism += value.Absenteeism;
                }
              });
            }
          }

          employees.push({
            id: empId,
            name: empData.Name,
            payment,
            overtime,
            absenteeism
          });
        }
      });
    }

    return employees;
  };

  const getDepartments = () => {
    return Object.keys(data.Payment || {});
  };

  const getLocations = (department: string) => {
    return Object.keys(data.Payment?.[department] || {});
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Organization Tree Structure
        </h1>
        <p className="text-lg text-muted-foreground">
          Expandable Department → Location → Employee Hierarchy
        </p>
      </div>

      <div className="space-y-4">
        {getDepartments().map(department => {
          const locations = getLocations(department);
          const isExpanded = expandedDepartments.has(department);
          
          // Calculate department totals
          const deptStats = locations.reduce((acc, location) => {
            const stats = getLocationStats(department, location);
            return {
              employeeCount: acc.employeeCount + stats.employeeCount,
              totalPayment: acc.totalPayment + stats.totalPayment,
              totalOvertime: acc.totalOvertime + stats.totalOvertime,
              totalOvertimeAmount: acc.totalOvertimeAmount + stats.totalOvertimeAmount,
              totalAbsenteeism: acc.totalAbsenteeism + stats.totalAbsenteeism
            };
          }, { employeeCount: 0, totalPayment: 0, totalOvertime: 0, totalOvertimeAmount: 0, totalAbsenteeism: 0 });

          return (
            <Card key={department} className="shadow-lg border-l-4 border-l-indigo-500">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <CardHeader 
                    className="cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors"
                    onClick={() => toggleDepartment(department)}
                  >
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        <Building2 className="h-6 w-6 text-indigo-600" />
                        <div>
                          <h2 className="text-xl font-bold text-indigo-900">{department}</h2>
                          <p className="text-sm text-indigo-600">{deptStats.employeeCount} employees in {locations.length} locations</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ${deptStats.totalPayment.toLocaleString()}
                        </Badge>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {deptStats.totalOvertime.toFixed(1)}h OT
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3 ml-8">
                      {locations.map(location => {
                        const locationKey = `${department}-${location}`;
                        const isLocationExpanded = expandedLocations.has(locationKey);
                        const locationStats = getLocationStats(department, location);
                        const employees = getEmployeeList(department, location);

                        return (
                          <Card key={location} className="border-l-4 border-l-blue-400">
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <CardHeader 
                                  className="cursor-pointer hover:bg-blue-50 transition-colors py-3"
                                  onClick={() => toggleLocation(locationKey)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {isLocationExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                      <MapPin className="h-5 w-5 text-blue-600" />
                                      <div>
                                        <h3 className="font-semibold text-blue-900">{location}</h3>
                                        <p className="text-xs text-blue-600">{locationStats.employeeCount} employees</p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-xs">
                                      <div className="text-center">
                                        <div className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          <span>{locationStats.employeeCount}</span>
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-3 w-3 text-green-600" />
                                          <span>${locationStats.totalPayment.toLocaleString()}</span>
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3 text-orange-600" />
                                          <span>{locationStats.totalOvertime.toFixed(1)}h</span>
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="flex items-center gap-1">
                                          <UserX className="h-3 w-3 text-red-600" />
                                          <span>{locationStats.totalAbsenteeism.toFixed(1)}h</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent>
                                <CardContent className="pt-0">
                                  <div className="ml-6 space-y-2">
                                    <h4 className="font-medium text-gray-700 mb-3">Employees ({employees.length})</h4>
                                    <div className="grid gap-2">
                                      {employees.map(employee => (
                                        <div 
                                          key={employee.id} 
                                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                              {employee.name.charAt(0)}
                                            </div>
                                            <div>
                                              <div className="font-medium text-sm">{employee.name}</div>
                                              <div className="text-xs text-gray-500">ID: {employee.id}</div>
                                            </div>
                                          </div>
                                          <div className="flex gap-4 text-xs">
                                            <div className="text-center">
                                              <div className="text-green-600 font-medium">${employee.payment.toLocaleString()}</div>
                                              <div className="text-gray-500">Payment</div>
                                            </div>
                                            <div className="text-center">
                                              <div className="text-red-600 font-medium">{employee.absenteeism.toFixed(1)}h</div>
                                              <div className="text-gray-500">Absent</div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Collapsible>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
};