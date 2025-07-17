export interface OvertimeData {
  OT_Amount: string;
  OT_Hours: number;
}

export interface AbsenteeismData {
  Absenteeism: number;
}

export interface PaymentData {
  Payment: string;
}

export interface EmployeeData {
  Name: string;
  [date: string]: AbsenteeismData | PaymentData | string;
}

export interface LocationData {
  [employeeId: string]: EmployeeData;
  [date: string]: OvertimeData;
}

export interface DepartmentData {
  [location: string]: LocationData;
}

export interface BudgetData {
  Budget: string;
}

export interface StarterTerminationData {
  starters: {
    [date: string]: {
      [department: string]: {
        [position: string]: unknown[];
      };
    };
  };
  terminations: {
    [date: string]: {
      [department: string]: {
        [position: string]: unknown[];
      };
    };
  };
}

export interface HRData {
  Overtime: {
    [department: string]: DepartmentData;
  };
  Absenteeism: {
    [department: string]: DepartmentData;
  };
  Payment: {
    [department: string]: DepartmentData;
  };
  Budget: {
    [department: string]: {
      [month: string]: BudgetData;
    };
  };
  LocationMap: {
    [department: string]: string[];
  };
  startertermination?: StarterTerminationData;
}

export interface MetricSummary {
  totalOvertime: number;
  totalOvertimeAmount: number;
  totalAbsenteeism: number;
  totalPayments: number;
  totalPaymentAmount: number;
}

export interface DepartmentSummary {
  department: string;
  overtime: number;
  overtimeAmount: number;
  absenteeism: number;
  payments: number;
  paymentAmount: number;
  budget: number;
  budgetUtilization: number;
  employeeCount?: number;
  locations?: string[];
}

export interface LocationAnalysis {
  department: string;
  location: string;
  employeeCount: number;
  paymentPercentage: number;
  overtimePercentage: number;
  paymentAmount: number;
  overtimeAmount: number;
}

export interface UploadTemplate {
  type: 'LocationMap' | 'Overtime' | 'Payment' | 'startertermination' | 'Absenteeism';
  filename: string;
  description: string;
}