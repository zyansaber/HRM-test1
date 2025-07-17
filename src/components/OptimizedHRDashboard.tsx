import { useState } from 'react';
import { Clock, UserX, DollarSign, TrendingUp, Users, Settings, BarChart3, Upload, UserPlus, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from './MetricCard';
import { DepartmentTable } from './DepartmentTable';
import { WeeklyTrendChart } from './WeeklyTrendChart';
import { TreeHRAnalysisPage } from './TreeHRAnalysisPage';
import { RingPaymentChart } from './RingPaymentChart';
import { DataUploadPage } from './DataUploadPage';
import { DepartmentSidebar } from './DepartmentSidebar';
import { TimeFilter } from './TimeFilter';
import { AdminPanel } from './AdminPanel';
import { useHRData } from '@/hooks/useHRData';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const OptimizedHRDashboard = () => {
  const { data, loading, error, getMetricsSummary, getDepartmentSummary, getTrendData, getAvailableDates, getEmployeeCount, getStarterTerminationCounts } = useHRData();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('overall');
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert>
          <AlertDescription>Error loading HR data: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <Alert>
          <AlertDescription>No HR data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  const metrics = getMetricsSummary(selectedPeriod, selectedDepartment);
  const departmentSummary = getDepartmentSummary(selectedPeriod, selectedDepartment);
  const allDepartments = getDepartmentSummary();
  const availableDates = getAvailableDates();
  const employeeCount = getEmployeeCount(selectedDepartment);
  const { starters } = getStarterTerminationCounts(selectedPeriod);
  const overtimeToPaymentRatio = metrics.totalPaymentAmount > 0 ? (metrics.totalOvertimeAmount / metrics.totalPaymentAmount) * 100 : 0;

  const handleUpdateEmployee = (employeeId: string, department: string, location: string) => {
    console.log('Update employee:', { employeeId, department, location });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Compact Sidebar */}
        <div className="w-56 bg-white shadow-lg border-r">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="text-center space-y-1">
              <h1 className="text-lg font-bold text-blue-600">HR Analytics</h1>
              <p className="text-xs text-gray-500">
                {selectedPeriod === 'overall' ? '2025' :
                 selectedPeriod.includes('-') ? 
                  new Date(selectedPeriod + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
                  selectedPeriod
                }
              </p>
            </div>

            {/* Navigation */}
            <div className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'blue' },
                { id: 'analysis', label: 'Analysis', icon: Users, color: 'purple' },
                { id: 'upload', label: 'Upload', icon: Upload, color: 'green' },
                { id: 'admin', label: 'Admin', icon: Settings, color: 'orange' }
              ].map(({ id, label, icon: Icon, color }) => (
                <div 
                  key={id}
                  className={`p-2 rounded cursor-pointer transition-all text-sm ${
                    activeTab === id ? `bg-${color}-100 text-${color}-700` : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab(id)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                </div>
              ))}
            </div>

            <TimeFilter
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              availableDates={availableDates}
            />
          </div>
        </div>

        {/* Department Sidebar */}
        {activeTab === 'dashboard' && (
          <div className="w-64 bg-gray-50 border-r">
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
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                {/* Summary Card */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {selectedPeriod === 'overall' ? '2025 Summary' :
                       selectedPeriod.includes('-') ? 
                        new Date(selectedPeriod + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) :
                        selectedPeriod
                      } - {selectedDepartment || 'All Departments'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">${metrics.totalPaymentAmount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Total Payment</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{metrics.totalOvertime.toFixed(1)}h</div>
                        <div className="text-xs text-gray-500">Overtime</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{metrics.totalAbsenteeism.toFixed(1)}h</div>
                        <div className="text-xs text-gray-500">Absenteeism</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{employeeCount}</div>
                        <div className="text-xs text-gray-500">Employees</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Equal Height Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetricCard
                    title="Overtime Hours"
                    value={`${metrics.totalOvertime.toFixed(1)}h`}
                    subtitle={selectedDepartment || "All"}
                    icon={Clock}
                    className="h-24 border-l-4 border-l-blue-500"
                  />
                  <MetricCard
                    title="Overtime Cost"
                    value={`$${metrics.totalOvertimeAmount.toLocaleString()}`}
                    subtitle="Total"
                    icon={DollarSign}
                    className="h-24 border-l-4 border-l-green-500"
                  />
                  <MetricCard
                    title="Absenteeism"
                    value={`${metrics.totalAbsenteeism.toFixed(1)}h`}
                    subtitle="Hours"
                    icon={UserX}
                    className="h-24 border-l-4 border-l-red-500"
                  />
                  <MetricCard
                    title="Payments"
                    value={metrics.totalPayments}
                    subtitle="Count"
                    icon={Users}
                    className="h-24 border-l-4 border-l-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetricCard
                    title="Payment Amount"
                    value={`$${metrics.totalPaymentAmount.toLocaleString()}`}
                    subtitle="Total"
                    icon={TrendingUp}
                    className="h-24 border-l-4 border-l-orange-500"
                  />
                  <MetricCard
                    title="Employee Count"
                    value={employeeCount}
                    subtitle="Active"
                    icon={Users}
                    className="h-24 border-l-4 border-l-cyan-500"
                  />
                  <MetricCard
                    title="OT Ratio"
                    value={`${overtimeToPaymentRatio.toFixed(1)}%`}
                    subtitle="vs Payment"
                    icon={Percent}
                    className="h-24 border-l-4 border-l-indigo-500"
                  />
                  <MetricCard
                    title="New Hires"
                    value={starters}
                    subtitle="Period"
                    icon={UserPlus}
                    className="h-24 border-l-4 border-l-emerald-500"
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="h-80">
                    <WeeklyTrendChart data={data} department={selectedDepartment || undefined} />
                  </div>
                  <div className="h-80">
                    <RingPaymentChart data={departmentSummary} />
                  </div>
                </div>

                {/* Table */}
                <div className="h-96">
                  <DepartmentTable data={departmentSummary} />
                </div>
              </div>
            )}

            {activeTab === 'analysis' && <TreeHRAnalysisPage data={data} />}
            {activeTab === 'upload' && <DataUploadPage />}
            {activeTab === 'admin' && <AdminPanel data={data} onUpdateEmployee={handleUpdateEmployee} />}
          </div>
        </div>
      </div>
    </div>
  );
};