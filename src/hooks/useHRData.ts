import { useState, useEffect } from 'react';
import { HRData, MetricSummary, DepartmentSummary } from '@/types/hr';
import { fetchHRData, listenToHRData } from '@/lib/firebase';

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
      } catch (err) {
        console.error('❌ Firebase加载失败:', err);
        setError(`Firebase连接失败: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadFirebaseData();
    
    // 每30秒检查一次数据更新
    const interval = setInterval(() => {
      console.log('🔄 检查Firebase数据更新...');
      loadFirebaseData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const parseAmount = (amount: string): number => {
    return parseFloat(amount.replace(/[$,]/g, ''));
  };

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

    // Calculate Overtime
    departmentsToProcess.forEach(dept => {
      if (data.Overtime?.[dept]) {
        Object.values(data.Overtime[dept]).forEach(location => {
          Object.entries(location).forEach(([key, value]) => {
            if (dateFilter(key) && typeof value === 'object' && 'OT_Hours' in value) {
              totalOvertime += value.OT_Hours;
              totalOvertimeAmount += parseAmount(value.OT_Amount);
            }
          });
        });
      }
    });

    // Calculate Absenteeism
    departmentsToProcess.forEach(dept => {
      if (data.Absenteeism?.[dept]) {
        Object.values(data.Absenteeism[dept]).forEach(location => {
          Object.values(location).forEach(employee => {
            if (typeof employee === 'object' && employee !== null) {
              Object.entries(employee).forEach(([key, value]) => {
                if (dateFilter(key) && typeof value === 'object' && 'Absenteeism' in value) {
                  totalAbsenteeism += value.Absenteeism;
                }
              });
            }
          });
        });
      }
    });

    // Calculate Payments
    departmentsToProcess.forEach(dept => {
      if (data.Payment?.[dept]) {
        Object.values(data.Payment[dept]).forEach(location => {
          Object.values(location).forEach(employee => {
            if (typeof employee === 'object' && employee !== null) {
              Object.entries(employee).forEach(([key, value]) => {
                if (dateFilter(key) && typeof value === 'object' && 'Payment' in value) {
                  totalPayments++;
                  totalPaymentAmount += parseAmount(value.Payment);
                }
              });
            }
          });
        });
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

  const getDepartmentSummary = (selectedPeriod?: string, selectedDepartment?: string | null): DepartmentSummary[] => {
    if (!data) return [];

    const departments = new Set([
      ...Object.keys(data.Overtime || {}),
      ...Object.keys(data.Absenteeism || {}),
      ...Object.keys(data.Payment || {}),
      ...Object.keys(data.Budget || {})
    ]);

    const filteredDepartments = selectedDepartment 
      ? [selectedDepartment].filter(dept => departments.has(dept))
      : Array.from(departments);

    return filteredDepartments.map(dept => {
      let overtime = 0;
      let overtimeAmount = 0;
      let absenteeism = 0;
      let payments = 0;
      let paymentAmount = 0;
      let budget = 0;

      const dateFilter = selectedPeriod && selectedPeriod.includes('-07-') 
        ? (key: string) => key === selectedPeriod
        : (key: string) => key.includes('2025-07');

      // Overtime data
      if (data.Overtime?.[dept]) {
        Object.values(data.Overtime[dept]).forEach(location => {
          Object.entries(location).forEach(([key, value]) => {
            if (dateFilter(key) && typeof value === 'object' && 'OT_Hours' in value) {
              overtime += value.OT_Hours;
              overtimeAmount += parseAmount(value.OT_Amount);
            }
          });
        });
      }

      // Absenteeism data
      if (data.Absenteeism?.[dept]) {
        Object.values(data.Absenteeism[dept]).forEach(location => {
          Object.values(location).forEach(employee => {
            if (typeof employee === 'object' && employee !== null) {
              Object.entries(employee).forEach(([key, value]) => {
                if (dateFilter(key) && typeof value === 'object' && 'Absenteeism' in value) {
                  absenteeism += value.Absenteeism;
                }
              });
            }
          });
        });
      }

      // Payment data
      if (data.Payment?.[dept]) {
        Object.values(data.Payment[dept]).forEach(location => {
          Object.values(location).forEach(employee => {
            if (typeof employee === 'object' && employee !== null) {
              Object.entries(employee).forEach(([key, value]) => {
                if (dateFilter(key) && typeof value === 'object' && 'Payment' in value) {
                  payments++;
                  paymentAmount += parseAmount(value.Payment);
                }
              });
            }
          });
        });
      }

      // Budget data (July 2025)
      if (data.Budget?.[dept]?.[getCurrentMonth()]) {
        budget = parseAmount(data.Budget[dept][getCurrentMonth()].Budget);
      }

      const budgetUtilization = budget > 0 ? (paymentAmount / budget) * 100 : 0;

      return {
        department: dept,
        overtime,
        overtimeAmount,
        absenteeism,
        payments,
        paymentAmount,
        budget,
        budgetUtilization
      };
    });
  };

  const getTrendData = (selectedDepartment?: string | null) => {
    if (!data) return [];

    const dates = ['2025-07-02', '2025-07-09'];
    
    return dates.map(date => {
      let overtime = 0;
      let absenteeism = 0;
      let payments = 0;

      const departmentsToProcess = selectedDepartment 
        ? [selectedDepartment] 
        : Object.keys(data.Overtime || {});

      departmentsToProcess.forEach(dept => {
        // Overtime
        if (data.Overtime?.[dept]) {
          Object.values(data.Overtime[dept]).forEach(location => {
            const dayData = location[date];
            if (dayData && typeof dayData === 'object' && 'OT_Hours' in dayData) {
              overtime += dayData.OT_Hours;
            }
          });
        }

        // Absenteeism
        if (data.Absenteeism?.[dept]) {
          Object.values(data.Absenteeism[dept]).forEach(location => {
            Object.values(location).forEach(employee => {
              if (typeof employee === 'object' && employee !== null) {
                const dayData = employee[date];
                if (dayData && typeof dayData === 'object' && 'Absenteeism' in dayData) {
                  absenteeism += dayData.Absenteeism;
                }
              }
            });
          });
        }

        // Payments
        if (data.Payment?.[dept]) {
          Object.values(data.Payment[dept]).forEach(location => {
            Object.values(location).forEach(employee => {
              if (typeof employee === 'object' && employee !== null) {
                const dayData = employee[date];
                if (dayData && typeof dayData === 'object' && 'Payment' in dayData) {
                  payments++;
                }
              }
            });
          });
        }
      });

      return {
        date,
        overtime,
        absenteeism,
        payments
      };
    });
  };

  const getAvailableDates = (): string[] => {
    if (!data) return [];
    
    const dates = new Set<string>();
    
    // Extract dates from all data sources
    Object.values(data.Overtime || {}).forEach(dept => {
      Object.values(dept).forEach(location => {
        Object.keys(location).forEach(key => {
          if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
            dates.add(key);
          }
        });
      });
    });

    return Array.from(dates).sort();
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
    getDepartmentSummary,
    getTrendData,
    getAvailableDates,
    getEmployeeCount,
    getStarterTerminationCounts
  };
};