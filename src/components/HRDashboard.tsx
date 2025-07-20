import { useState } from 'react';
import { Clock, UserX, DollarSign, Building, TrendingUp, Users, Settings, BarChart3, Upload, UserPlus, UserMinus, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from './MetricCard';
import { DepartmentChart } from './DepartmentChart';
import { DepartmentTable } from './DepartmentTable';
import { ImprovedDepartmentChart } from './ImprovedDepartmentChart';
import { WeeklyTrendChart } from './WeeklyTrendChart';
import { TreeHRAnalysisPage } from './TreeHRAnalysisPage';
import { RingPaymentChart } from './RingPaymentChart';
import { DataUploadPage } from './DataUploadPage';
import { DepartmentSidebar } from './DepartmentSidebar';
import { TimeFilter } from './TimeFilter';
import { TrendChart } from './TrendChart';
import { AdminPanel } from './AdminPanel';
import { useHRData } from '@/hooks/useHRData';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const HRDashboard = () => {
  const { data, loading, error, getMetricsSummary, getDepartmentSummary, getTrendData, getAvailableDates, getEmployeeCount, getStarterTerminationCounts } = useHRData();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('overall');
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            Error loading HR data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            No HR data available
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const metrics = getMetricsSummary(selectedPeriod, null);
  const departmentSummary = getDepartmentSummary(selectedPeriod, selectedDepartment);
  const allDepartments = getDepartmentSummary();
  const trendData = getTrendData(selectedDepartment);
  const availableDates = getAvailableDates();
  const employeeCount = getEmployeeCount(selectedDepartment);
  const { starters, terminations } = getStarterTerminationCounts(selectedPeriod);
  const overtimeToPaymentRatio = metrics.totalPaymentAmount > 0 ? (metrics.totalOvertimeAmount / metrics.totalPaymentAmount) * 100 : 0;

  const handleUpdateEmployee = (employeeId: string, department: string, location: string) => {
    console.log('Update employee:', { employeeId, department, location });
    // TODO: Implement Firebase update
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-xl border-r">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HR Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedPeriod === 'overall' ? 'Overall 2025' :
                 selectedPeriod.includes('-') ? 
                  new Date(selectedPeriod + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) :
                  selectedPeriod
                }
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="space-y-2">
              <div 
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700 shadow-md' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('dashboard')}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </div>
              </div>
              
              <div 
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  activeTab === 'analysis' ? 'bg-purple-100 text-purple-700 shadow-md' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('analysis')}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">HR Analysis</span>
                </div>
              </div>
              
              <div 
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  activeTab === 'upload' ? 'bg-green-100 text-green-700 shadow-md' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('upload')}
              >
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5" />
                  <span className="font-medium">Upload Data</span>
                </div>
              </div>
              
              <div 
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  activeTab === 'admin' ? 'bg-orange-100 text-orange-700 shadow-md' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('admin')}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Admin Panel</span>
                </div>
              </div>
            </div>

            {/* Time Filter */}
            <TimeFilter
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              availableDates={availableDates}
            />
          </div>
        </div>

        {/* Department Sidebar - Compact */}
        {activeTab === 'dashboard' && (
          <div className="w-85 bg-gradient-to-b from-gray-50 to-gray-100 border-r shadow-sm">
            <div className="p-3 h-full overflow-auto">
              <DepartmentSidebar
                departments={allDepartments}
                selectedDepartment={selectedDepartment}
                onDepartmentSelect={setSelectedDepartment}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-auto relative">
          {/* 滚动的部门背景 */}
          <div className="absolute inset-6 overflow-hidden opacity-5 rounded-lg pointer-events-none">
            <div className="animate-scroll-slow whitespace-nowrap h-full flex items-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="inline-block mx-8 text-2xl font-bold text-blue-600 flex-shrink-0">
                  {data && data.length > 0 && data[0].Absenteeism 
                    ? Object.keys(data[0].Absenteeism).join(' • ') + ' • '
                    : 'Dealerships • Production • Administration • '}
                </span>
              ))}
            </div>
          </div>
          <div className="p-6 relative z-10 max-w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="dashboard" className="space-y-6">
                {/* MTD/YTD Summary */}
                <Card className="shadow-lg border-l-4 border-l-blue-500 mb-6">
                  <CardHeader>
                    <CardTitle className="text-center">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-2xl font-bold">
                            {selectedPeriod === 'overall' ? 'Overall 2025 Performance Summary' :
                             selectedPeriod.includes('-') ? 
                              new Date(selectedPeriod + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + ' Performance Summary' :
                              selectedPeriod + ' Performance Summary'
                            }
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {selectedPeriod === 'overall' ? 'Year-to-Date (YTD)' : 'Month-to-Date (MTD) & Year-to-Date (YTD)'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-blue-600">Today: July 16, 2025</div>
                          <div className="text-sm text-gray-500">Day 16 of 31</div>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Overall MTD/YTD */}
                       <div className="w-full md:w-[280px] text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">
                          {selectedDepartment ? `${selectedDepartment} Performance` : 'Overall Performance'}
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-600">MTD Payment:</span>
                            <span className="block text-xl font-bold text-green-600">${metrics.totalPaymentAmount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">MTD Budget (Expected):</span>
                            <span className="block text-lg font-semibold text-blue-600">${Math.round(metrics.totalPaymentAmount * 2 * (16/31)).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">MTD Budget Utilization:</span>
                            <span className="block text-lg font-semibold text-orange-600">{((metrics.totalPaymentAmount / (metrics.totalPaymentAmount * 2 * (16/31))) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Department Breakdown */}
                      <div className="col-span-2">
                        <h3 className="font-semibold text-lg mb-3">Department MTD Performance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {departmentSummary.slice(0, 4).map(dept => (
                            <div key={dept.department} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{dept.department}</span>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-green-600">${dept.paymentAmount.toLocaleString()}</div>
                                  <div className="text-xs text-gray-500">{dept.budgetUtilization.toFixed(1)}% budget</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics - First Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <MetricCard
                    title="Total Overtime Hours"
                    value={`${metrics.totalOvertime.toFixed(1)}h`}
                    subtitle={selectedDepartment || "All departments"}
                    icon={Clock}
                    className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow"
                  />
                  
                  <MetricCard
                    title="Overtime Amount"
                    value={`$${metrics.totalOvertimeAmount.toLocaleString()}`}
                    subtitle="Total cost"
                    icon={DollarSign}
                    className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow"
                  />
                  
                  <MetricCard
                    title="Absenteeism Hours"
                    value={`${metrics.totalAbsenteeism.toFixed(1)}h`}
                    subtitle="Total absence"
                    icon={UserX}
                    className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow"
                  />
                  
                  <MetricCard
                    title="Total Payments"
                    value={metrics.totalPayments}
                    subtitle="Payment count"
                    icon={Users}
                    className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow"
                  />
                </div>

                {/* Second Row of Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Payment Amount"
                    value={`$${metrics.totalPaymentAmount.toLocaleString()}`}
                    subtitle="Total disbursed"
                    icon={TrendingUp}
                    className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow"
                  />

                  <MetricCard
                    title="Employee Count"
                    value={employeeCount}
                    subtitle="Active employees"
                    icon={Users}
                    className="border-l-4 border-l-cyan-500 shadow-lg hover:shadow-xl transition-shadow"
                  />

                  <MetricCard
                    title="Overtime % to Payment"
                    value={`${overtimeToPaymentRatio.toFixed(1)}%`}
                    subtitle="OT vs Payment ratio"
                    icon={Percent}
                    className="border-l-4 border-l-indigo-500 shadow-lg hover:shadow-xl transition-shadow"
                  />

                  <MetricCard
                    title="New Hires"
                    value={starters}
                    subtitle="This period"
                    icon={UserPlus}
                    className="border-l-4 border-l-emerald-500 shadow-lg hover:shadow-xl transition-shadow"
                  />
                </div>

                {/* Weekly Trend Chart */}
                <WeeklyTrendChart data={data} department={selectedDepartment || undefined} />

                {/* Payment Distribution Ring Chart */}
                <RingPaymentChart data={departmentSummary} />

                {/* Department Details Table */}
                <DepartmentTable data={departmentSummary} />
              </TabsContent>

              <TabsContent value="analysis">
                <TreeHRAnalysisPage data={data} />
              </TabsContent>

              <TabsContent value="upload">
                <DataUploadPage />
              </TabsContent>

              <TabsContent value="admin">
                <AdminPanel data={data} onUpdateEmployee={handleUpdateEmployee} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
