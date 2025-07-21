import { useState, useEffect } from 'react';
import { HRData } from '@/types/hr';
import { fetchHRData } from '@/lib/firebase';

const extractDatesFromHRData = (data: HRData): { availableMonths: string[]; monthDateMap: Record<string, string[]> } => {
  const monthMap: Record<string, Set<string>> = {
    Absenteeism: new Set(),
    Payment: new Set(),
    Overtime: new Set(),
    Budget: new Set(),
  };

  const toMonth = (date: string) => date.slice(0, 7);

  // Absenteeism
  for (const dept in data.Absenteeism || {}) {
    for (const loc in data.Absenteeism[dept]) {
      for (const empId in data.Absenteeism[dept][loc]) {
        for (const date in data.Absenteeism[dept][loc][empId]) {
          if (date !== 'Name') monthMap.Absenteeism.add(toMonth(date));
        }
      }
    }
  }

  // Payment
  for (const dept in data.Payment || {}) {
    for (const loc in data.Payment[dept]) {
      for (const empId in data.Payment[dept][loc]) {
        for (const date in data.Payment[dept][loc][empId]) {
          if (date !== 'Name') monthMap.Payment.add(toMonth(date));
        }
      }
    }
  }

  // Overtime
  for (const dept in data.Overtime || {}) {
    for (const loc in data.Overtime[dept]) {
      for (const date in data.Overtime[dept][loc]) {
        monthMap.Overtime.add(toMonth(date));
      }
    }
  }

  // Budget
  for (const dept in data.Budget || {}) {
    for (const month in data.Budget[dept]) {
      monthMap.Budget.add(month);
    }
  }

  const availableMonths = [...monthMap.Absenteeism].filter(
    (month) =>
      monthMap.Payment.has(month) &&
      monthMap.Overtime.has(month) &&
      monthMap.Budget.has(month)
  );

  const allDates: string[] = [];

  for (const dept in data.Absenteeism || {}) {
    for (const loc in data.Absenteeism[dept]) {
      for (const empId in data.Absenteeism[dept][loc]) {
        for (const date in data.Absenteeism[dept][loc][empId]) {
          if (date !== 'Name') allDates.push(date);
        }
      }
    }
  }

  for (const dept in data.Payment || {}) {
    for (const loc in data.Payment[dept]) {
      for (const empId in data.Payment[dept][loc]) {
        for (const date in data.Payment[dept][loc][empId]) {
          if (date !== 'Name') allDates.push(date);
        }
      }
    }
  }

  for (const dept in data.Overtime || {}) {
    for (const loc in data.Overtime[dept]) {
      for (const date in data.Overtime[dept][loc]) {
        allDates.push(date);
      }
    }
  }

  const monthDateMap: Record<string, string[]> = {};
  for (const date of allDates) {
    const month = toMonth(date);
    if (!monthDateMap[month]) monthDateMap[month] = [];
    if (!monthDateMap[month].includes(date)) {
      monthDateMap[month].push(date);
    }
  }

  return {
    availableMonths,
    monthDateMap,
  };
};

export const useHRData = () => {
  const [data, setData] = useState<HRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [monthDateMap, setMonthDateMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const loadFirebaseData = async () => {
      try {
        const firebaseData = await fetchHRData();
        if (firebaseData && firebaseData.length > 0) {
          const mainData = firebaseData[0];
          setData(mainData);

          const { availableMonths, monthDateMap } = extractDatesFromHRData(mainData);
          setAvailableMonths(availableMonths);
          setMonthDateMap(monthDateMap);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFirebaseData();
  }, []);

  return { data, loading, error, availableMonths, monthDateMap };
};
