import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Edit, Save, X, User } from 'lucide-react';
import { HRData } from '@/types/hr';

interface Employee {
  id: string;
  name: string;
  department: string;
  location: string;
}

interface AdminPanelProps {
  data: HRData;
  onUpdateEmployee: (employeeId: string, department: string, location: string) => void;
}

export const AdminPanel = ({ data, onUpdateEmployee }: AdminPanelProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const extractEmployees = () => {
      const employeeList: Employee[] = [];
      
      // Extract from Absenteeism data
      Object.entries(data.Absenteeism || {}).forEach(([dept, locations]) => {
        Object.entries(locations).forEach(([location, employees]) => {
          Object.entries(employees).forEach(([empId, empData]) => {
            if (typeof empData === 'object' && empData.Name) {
              employeeList.push({
                id: empId,
                name: empData.Name,
                department: dept,
                location: location
              });
            }
          });
        });
      });

      // Remove duplicates and set employees
      const uniqueEmployees = employeeList.filter((emp, index, self) => 
        index === self.findIndex(e => e.id === emp.id)
      );
      
      setEmployees(uniqueEmployees);
    };

    if (data) {
      extractEmployees();
    }
  }, [data]);

  const handleSaveEmployee = () => {
    if (editingEmployee) {
      onUpdateEmployee(editingEmployee.id, editingEmployee.department, editingEmployee.location);
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id ? editingEmployee : emp
      ));
      setEditingEmployee(null);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departments = Array.from(new Set(employees.map(emp => emp.department)));
  const getLocationsForDepartment = (dept: string) => {
    return Array.from(new Set(
      employees.filter(emp => emp.department === dept).map(emp => emp.location)
    ));
  };

  return (
    <Card className="shadow-xl border-t-4 border-t-indigo-500">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Settings className="h-6 w-6 text-indigo-600" />
          Employee Administration
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search */}
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search employees, departments, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Badge variant="secondary" className="px-3 py-1">
              {filteredEmployees.length} employees
            </Badge>
          </div>

          {/* Employee Table */}
          <div className="rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Employee ID</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">{employee.id}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{employee.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {employee.department}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {employee.location}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-indigo-50 hover:text-indigo-700"
                            onClick={() => setEditingEmployee(employee)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Edit className="h-5 w-5 text-indigo-600" />
                              Edit Employee: {employee.name}
                            </DialogTitle>
                          </DialogHeader>
                          {editingEmployee && (
                            <div className="space-y-4 pt-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700">Department</label>
                                <Select
                                  value={editingEmployee.department}
                                  onValueChange={(value) => 
                                    setEditingEmployee({...editingEmployee, department: value})
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {departments.map(dept => (
                                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium text-gray-700">Location</label>
                                <Select
                                  value={editingEmployee.location}
                                  onValueChange={(value) => 
                                    setEditingEmployee({...editingEmployee, location: value})
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getLocationsForDepartment(editingEmployee.department).map(loc => (
                                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex gap-2 pt-4">
                                <Button 
                                  onClick={handleSaveEmployee}
                                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Save Changes
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setEditingEmployee(null)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};