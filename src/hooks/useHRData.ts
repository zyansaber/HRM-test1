
import { useState, useEffect } from 'react';
import { HRData, MetricSummary, DepartmentSummary } from '@/types/hr';
import { fetchHRData } from '@/lib/firebase';

export const useHRData = () => {
  const [data, setData] = useState<HRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 初始化Firebase连接...');
    setLoading(true);

    const loadFirebaseData = async () => {
      try {
        console.log('📡 开始获取Firebase数据...');
        const firebaseData = await fetchHRData();

        if (firebaseData && firebaseData.length > 0) {
          const data = firebaseData[0];
          console.log('✅ Firebase数据加载成功!');
          console.log('📊 数据结构检查:', {
            hasAbsenteeism: !!data.Absenteeism,
            hasPayment: !!data.Payment,
            hasOvertime: !!data.Overtime,
            hasBudget: !!data.Budget
          });

          setData(data);
          setError(null);
        } else {
          console.log('❌ Firebase没有返回数据');
          setError('Firebase中没有数据 - 请检查数据库');
        }
      } catch (err: any) {
        console.error('❌ Firebase加载失败:', err);
        setError(`Firebase连接失败: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadFirebaseData();

    const interval = setInterval(() => {
      console.log('🔄 检查Firebase数据更新...');
      loadFirebaseData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const parseAmount = (amount: string): number => parseFloat(amount.replace(/[$,]/g, ''));

  const getCurrentMonth = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const getMetricsSummary = (selectedPeriod?: string, selectedDepartment?: string | null): MetricSummary => {
    if (!data) return { totalOvertime: 0, totalOvertimeAmount: 0, totalAbsenteeism: 0, totalPayments: 0, totalPaymentAmount: 0 };

    let totalOvertime = 0;
    let totalOvertimeAmount = 0;
    let totalAbsenteeism = 0;
    let totalPayments = 0;
    let totalPaymentAmount = 0;

    const dateFilter = selectedPeriod && selectedPeriod.includes('-07-') 
      ? (key: string) => key === selectedPeriod
      : (key: string) => key.includes('2025-07');

    const departmentsToProcess = selectedDepartment 
      ? [selectedDepartment] 
      : Object.keys(data.Overtime || {});

    departmentsToProcess.forEach(dept => {
      // Overtime
      if (data.Overtime?.[dept]) {
        Object.values(data.Overtime[dept]).forEach(location =>
          Object.entries(location).forEach(([key, value]) => {
            if (dateFilter(key) && typeof value === 'object' && 'OT_Hours' in value) {
              totalOvertime += value.OT_Hours;
              totalOvertimeAmount += parseAmount(value.OT_Amount);
            }
          })
        );
      }

      // Absenteeism
      if (data.Absenteeism?.[dept]) {
        Object.values(data.Absenteeism[dept]).forEach(location =>
          Object.values(location).forEach(employee => {
            if (typeof employee === 'object') {
              Object.entries(employee).forEach(([key, value]) => {
                if (dateFilter(key) && typeof value === 'object' && 'Absenteeism' in value) {
                  totalAbsenteeism += value.Absenteeism;
                }
              });
            }
          })
        );
      }

      // Payment
      if (data.Payment?.[dept]) {
        Object.values(data.Payment[dept]).forEach(location =>
          Object.values(location).forEach(employee => {
            if (typeof employee === 'object') {
              Object.entries(employee).forEach(([key, value]) => {
                if (dateFilter(key) && typeof value === 'object' && 'Payment' in value) {
                  totalPayments++;
                  totalPaymentAmount += parseAmount(value.Payment);
                }
              });
            }
          })
        );
      }
    });

    return {
      totalOvertime,
      totalOvertimeAmount,
      totalAbsenteeism,
      totalPayments,
      totalPaymentAmount
    };
  };

  const getAvailableDates = (): { months: string[], datesByMonth: Record<string, string[]> } => {
    if (!data) return { months: [], datesByMonth: {} };

    const dateSet = new Set<string>();

    const extractDates = (obj: any) => {
      Object.values(obj || {}).forEach((dept: any) => {
        Object.values(dept).forEach((location: any) => {
          if (typeof location === 'object') {
            Object.keys(location).forEach((dateKey) => {
              if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
                dateSet.add(dateKey);
              }
            });
          }
        });
      });
    };

    extractDates(data.Overtime);
    extractDates(data.Payment);
    extractDates(data.Absenteeism);

    const dates = Array.from(dateSet).sort();
    const months = Array.from(new Set(dates.map(d => d.slice(0, 7)))).sort();

    const datesByMonth: Record<string, string[]> = {};
    for (const month of months) {
      datesByMonth[month] = dates.filter(d => d.startsWith(month));
    }

    return { months, datesByMonth };
  };

  const getEmployeeCount = (selectedDepartment?: string | null): number => {
    if (!data) return 0;

    let count = 0;
    const departmentsToProcess = selectedDepartment 
      ? [selectedDepartment] 
      : Object.keys(data.Payment || {});

    departmentsToProcess.forEach(dept => {
      if (data.Payment?.[dept]) {
        Object.values(data.Payment[dept]).forEach(location => {
          Object.values(location).forEach(employee => {
            if (typeof employee === 'object' && employee.Name) {
              count++;
            }
          });
        });
      }
    });

    return count;
  };

  const getStarterTerminationCounts = (selectedPeriod?: string): { starters: number; terminations: number } => {
    if (!data?.startertermination) return { starters: 0, terminations: 0 };

    const dateFilter = selectedPeriod && selectedPeriod.includes('-07-') ? selectedPeriod : '2025-07-09';

    let starters = 0;
    let terminations = 0;

    if (data.startertermination.starters?.[dateFilter]) {
      Object.values(data.startertermination.starters[dateFilter]).forEach(dept => {
        Object.values(dept).forEach(positions => {
          starters += Array.isArray(positions) ? positions.length : 0;
        });
      });
    }

    if (data.startertermination.terminations?.[dateFilter]) {
      Object.values(data.startertermination.terminations[dateFilter]).forEach(dept => {
        Object.values(dept).forEach(positions => {
          terminations += Array.isArray(positions) ? positions.length : 0;
        });
      });
    }

    return { starters, terminations };
  };

  return {
    data,
    loading,
    error,
    getMetricsSummary,
    getAvailableDates,
    getEmployeeCount,
    getStarterTerminationCounts
  };
};
