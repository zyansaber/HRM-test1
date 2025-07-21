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

};
