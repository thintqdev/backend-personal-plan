# Monthly Report - Sample Data Examples

## Example API Response Data

### 1. Complete PDF Data Response

```json
{
  "reportInfo": {
    "year": 2025,
    "month": 8,
    "createdAt": "26/08/2025, 16:00:00",
    "isFinalized": false,
    "finalizedAt": null
  },
  "user": {
    "name": "Tr Sn Quang Thìn",
    "email": "thintqdev@gmail.com",
    "income": 16000000
  },
  "summary": {
    "userIncome": 16000000,
    "totalAllocated": 16000000,
    "totalSpent": 5900000,
    "totalSavings": 10100000,
    "carryOverFromPreviousMonth": 2500000,
    "carryOverToNextMonth": 12600000
  },
  "jarsReport": [
    {
      "jarId": "66cc111111111abcdef11111",
      "jarName": "Tự do tài chính",
      "jarCategory": "Investment",
      "allocatedAmount": 4000000,
      "actualSpent": 0,
      "actualIncome": 0,
      "savings": 4000000,
      "percentage": 25,
      "savingsPercentage": "100.0",
      "transactions": [],
      "jarInfo": {
        "name": "Tự do tài chính",
        "color": "#2E86AB",
        "icon": "💰",
        "category": "Investment"
      }
    },
    {
      "jarId": "66cc222222222abcdef22222",
      "jarName": "Giáo dục",
      "jarCategory": "Education",
      "allocatedAmount": 1600000,
      "actualSpent": 1500000,
      "actualIncome": 0,
      "savings": 100000,
      "percentage": 10,
      "savingsPercentage": "6.3",
      "transactions": [
        {
          "transactionId": "66cc789012345abcdef56789",
          "amount": 500000,
          "type": "expense",
          "description": "Khóa học online",
          "category": "Giáo dục",
          "date": "2025-08-15T10:00:00.000Z"
        },
        {
          "transactionId": "66cc789012345abcdef56790",
          "amount": 1000000,
          "type": "expense",
          "description": "Mua sách chuyên ngành",
          "category": "Giáo dục",
          "date": "2025-08-20T14:30:00.000Z"
        }
      ],
      "jarInfo": {
        "name": "Giáo dục",
        "color": "#17a2b8",
        "icon": "📚",
        "category": "Education"
      }
    },
    {
      "jarId": "66cc333333333abcdef33333",
      "jarName": "Cần thiết",
      "jarCategory": "Necessity",
      "allocatedAmount": 8000000,
      "actualSpent": 4400000,
      "actualIncome": 0,
      "savings": 3600000,
      "percentage": 50,
      "savingsPercentage": "45.0",
      "transactions": [
        {
          "transactionId": "66cc789012345abcdef56791",
          "amount": 2000000,
          "type": "expense",
          "description": "Tiền thuê nhà",
          "category": "Nhà ở",
          "date": "2025-08-01T09:00:00.000Z"
        },
        {
          "transactionId": "66cc789012345abcdef56792",
          "amount": 1200000,
          "type": "expense",
          "description": "Tiền điện nước",
          "category": "Tiện ích",
          "date": "2025-08-05T16:00:00.000Z"
        },
        {
          "transactionId": "66cc789012345abcdef56793",
          "amount": 800000,
          "type": "expense",
          "description": "Mua thực phẩm",
          "category": "Ăn uống",
          "date": "2025-08-10T11:30:00.000Z"
        },
        {
          "transactionId": "66cc789012345abcdef56794",
          "amount": 400000,
          "type": "expense",
          "description": "Xăng xe",
          "category": "Di chuyển",
          "date": "2025-08-12T08:15:00.000Z"
        }
      ],
      "jarInfo": {
        "name": "Cần thiết",
        "color": "#28a745",
        "icon": "🏠",
        "category": "Necessity"
      }
    },
    {
      "jarId": "66cc444444444abcdef44444",
      "jarName": "Vui chơi",
      "jarCategory": "Entertainment",
      "allocatedAmount": 1600000,
      "actualSpent": 0,
      "actualIncome": 0,
      "savings": 1600000,
      "percentage": 10,
      "savingsPercentage": "100.0",
      "transactions": [],
      "jarInfo": {
        "name": "Vui chơi",
        "color": "#ffc107",
        "icon": "🎮",
        "category": "Entertainment"
      }
    },
    {
      "jarId": "66cc555555555abcdef55555",
      "jarName": "Cho đi",
      "jarCategory": "Giving",
      "allocatedAmount": 800000,
      "actualSpent": 0,
      "actualIncome": 0,
      "savings": 800000,
      "percentage": 5,
      "savingsPercentage": "100.0",
      "transactions": [],
      "jarInfo": {
        "name": "Cho đi",
        "color": "#A23B72",
        "icon": "❤️",
        "category": "Giving"
      }
    }
  ],
  "categorySpending": [
    {
      "category": "Nhà ở",
      "amount": 2000000,
      "percentage": "33.9"
    },
    {
      "category": "Giáo dục",
      "amount": 1500000,
      "percentage": "25.4"
    },
    {
      "category": "Tiện ích",
      "amount": 1200000,
      "percentage": "20.3"
    },
    {
      "category": "Ăn uống",
      "amount": 800000,
      "percentage": "13.6"
    },
    {
      "category": "Di chuyển",
      "amount": 400000,
      "percentage": "6.8"
    }
  ],
  "formatted": {
    "userIncome": "16.000.000 ₫",
    "totalAllocated": "16.000.000 ₫",
    "totalSpent": "5.900.000 ₫",
    "totalSavings": "10.100.000 ₫",
    "carryOverFromPreviousMonth": "2.500.000 ₫",
    "carryOverToNextMonth": "12.600.000 ₫",
    "jars": [
      {
        "jarId": "66cc111111111abcdef11111",
        "jarName": "Tự do tài chính",
        "jarCategory": "Investment",
        "allocatedAmount": 4000000,
        "actualSpent": 0,
        "actualIncome": 0,
        "savings": 4000000,
        "percentage": 25,
        "savingsPercentage": "100.0",
        "allocatedAmountFormatted": "4.000.000 ₫",
        "actualSpentFormatted": "0 ₫",
        "actualIncomeFormatted": "0 ₫",
        "savingsFormatted": "4.000.000 ₫"
      },
      {
        "jarId": "66cc222222222abcdef22222",
        "jarName": "Giáo dục",
        "jarCategory": "Education",
        "allocatedAmount": 1600000,
        "actualSpent": 1500000,
        "actualIncome": 0,
        "savings": 100000,
        "percentage": 10,
        "savingsPercentage": "6.3",
        "allocatedAmountFormatted": "1.600.000 ₫",
        "actualSpentFormatted": "1.500.000 ₫",
        "actualIncomeFormatted": "0 ₫",
        "savingsFormatted": "100.000 ₫"
      },
      {
        "jarId": "66cc333333333abcdef33333",
        "jarName": "Cần thiết",
        "jarCategory": "Necessity",
        "allocatedAmount": 8000000,
        "actualSpent": 4400000,
        "actualIncome": 0,
        "savings": 3600000,
        "percentage": 50,
        "savingsPercentage": "45.0",
        "allocatedAmountFormatted": "8.000.000 ₫",
        "actualSpentFormatted": "4.400.000 ₫",
        "actualIncomeFormatted": "0 ₫",
        "savingsFormatted": "3.600.000 ₫"
      },
      {
        "jarId": "66cc444444444abcdef44444",
        "jarName": "Vui chơi",
        "jarCategory": "Entertainment",
        "allocatedAmount": 1600000,
        "actualSpent": 0,
        "actualIncome": 0,
        "savings": 1600000,
        "percentage": 10,
        "savingsPercentage": "100.0",
        "allocatedAmountFormatted": "1.600.000 ₫",
        "actualSpentFormatted": "0 ₫",
        "actualIncomeFormatted": "0 ₫",
        "savingsFormatted": "1.600.000 ₫"
      },
      {
        "jarId": "66cc555555555abcdef55555",
        "jarName": "Cho đi",
        "jarCategory": "Giving",
        "allocatedAmount": 800000,
        "actualSpent": 0,
        "actualIncome": 0,
        "savings": 800000,
        "percentage": 5,
        "savingsPercentage": "100.0",
        "allocatedAmountFormatted": "800.000 ₫",
        "actualSpentFormatted": "0 ₫",
        "actualIncomeFormatted": "0 ₫",
        "savingsFormatted": "800.000 ₫"
      }
    ],
    "categories": [
      {
        "category": "Nhà ở",
        "amount": 2000000,
        "percentage": "33.9",
        "amountFormatted": "2.000.000 ₫"
      },
      {
        "category": "Giáo dục",
        "amount": 1500000,
        "percentage": "25.4",
        "amountFormatted": "1.500.000 ₫"
      },
      {
        "category": "Tiện ích",
        "amount": 1200000,
        "percentage": "20.3",
        "amountFormatted": "1.200.000 ₫"
      },
      {
        "category": "Ăn uống",
        "amount": 800000,
        "percentage": "13.6",
        "amountFormatted": "800.000 ₫"
      },
      {
        "category": "Di chuyển",
        "amount": 400000,
        "percentage": "6.8",
        "amountFormatted": "400.000 ₫"
      }
    ]
  },
  "colors": {
    "primary": "#2E86AB",
    "secondary": "#A23B72",
    "success": "#28a745",
    "danger": "#dc3545",
    "warning": "#ffc107",
    "info": "#17a2b8",
    "dark": "#333333",
    "muted": "#6c757d",
    "light": "#f8f9fa"
  }
}
```

## 2. Monthly Reports List Response

```json
[
  {
    "_id": "66cc123456789abcdef01234",
    "userId": "66cc987654321abcdef98765",
    "month": 8,
    "year": 2025,
    "userIncome": 16000000,
    "totalAllocated": 16000000,
    "totalSpent": 5900000,
    "totalSavings": 10100000,
    "carryOverFromPreviousMonth": 2500000,
    "carryOverToNextMonth": 12600000,
    "isFinalized": false,
    "finalizedAt": null,
    "createdAt": "2025-08-26T09:00:00.000Z",
    "updatedAt": "2025-08-26T09:00:00.000Z"
  },
  {
    "_id": "66cc123456789abcdef01235",
    "userId": "66cc987654321abcdef98765",
    "month": 7,
    "year": 2025,
    "userIncome": 15000000,
    "totalAllocated": 15000000,
    "totalSpent": 12300000,
    "totalSavings": 2700000,
    "carryOverFromPreviousMonth": 1800000,
    "carryOverToNextMonth": 4500000,
    "isFinalized": true,
    "finalizedAt": "2025-08-01T10:00:00.000Z",
    "createdAt": "2025-07-26T09:00:00.000Z",
    "updatedAt": "2025-08-01T10:00:00.000Z"
  }
]
```

## 3. Error Response Examples

### 404 - Report Not Found

```json
{
  "error": "Monthly report not found",
  "message": "No report found for year 2025, month 9",
  "status": 404
}
```

### 400 - Report Already Finalized

```json
{
  "error": "Monthly report already exists and is finalized",
  "message": "Cannot modify finalized report for year 2025, month 7",
  "status": 400
}
```

### 500 - Server Error

```json
{
  "error": "Internal server error",
  "message": "Database connection failed",
  "status": 500
}
```

## 4. Frontend Usage Examples

### Fetch Report Data

```javascript
const fetchReportData = async (year, month) => {
  try {
    const response = await fetch(
      `/api/finance/reports/${year}/${month}/pdf-data`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching report data:", error);
    throw error;
  }
};

// Usage
fetchReportData(2025, 8)
  .then((data) => {
    console.log("Report data:", data);
    // Use data to generate PDF or display in UI
  })
  .catch((error) => {
    console.error("Failed to fetch report:", error);
  });
```

### Generate Report

```javascript
const generateReport = async (year, month) => {
  try {
    const response = await fetch("/api/finance/reports/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ year, month }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const report = await response.json();
    return report;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};
```

### Finalize Report

```javascript
const finalizeReport = async (year, month) => {
  try {
    const response = await fetch(
      `/api/finance/reports/${year}/${month}/finalize`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error finalizing report:", error);
    throw error;
  }
};
```

## 5. CSS Styling Examples

### Report Container Styles

```css
.report-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Arial", sans-serif;
  background: #fff;
}

.report-header {
  background: #2e86ab;
  color: white;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 30px;
}

.report-header h1 {
  font-size: 24px;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.report-header h2 {
  font-size: 18px;
  margin: 0;
  font-weight: normal;
}

.user-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 30px;
}

.user-info h3 {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 15px 0;
}

.user-info p {
  margin: 5px 0;
  font-size: 11px;
  color: #333;
}

.summary-section {
  margin-bottom: 30px;
}

.summary-section h3 {
  font-size: 16px;
  color: #2e86ab;
  font-weight: bold;
  margin: 0 0 20px 0;
}

.summary-cards {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.summary-cards .card {
  flex: 1;
  min-width: 150px;
  padding: 15px 10px;
  border-radius: 8px;
  color: white;
  text-align: center;
}

.summary-cards .card span {
  display: block;
  font-size: 10px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-cards .card strong {
  display: block;
  font-size: 12px;
  font-weight: bold;
}

.jars-section,
.category-section {
  margin-bottom: 30px;
}

.jars-section h3,
.category-section h3 {
  font-size: 16px;
  color: #2e86ab;
  font-weight: bold;
  margin: 0 0 20px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

table th {
  background: #a23b72;
  color: white;
  padding: 8px;
  font-size: 10px;
  font-weight: bold;
  text-align: left;
}

table td {
  padding: 6px 8px;
  font-size: 9px;
  color: #333;
  border-bottom: 1px solid #eee;
}

table tr:nth-child(even) {
  background: #f8f9fa;
}

.carry-over {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.carry-over span {
  font-size: 11px;
  color: #333;
}

@media print {
  .report-container {
    max-width: none;
    margin: 0;
    padding: 40px;
  }

  .summary-cards {
    display: block;
  }

  .summary-cards .card {
    display: inline-block;
    width: 30%;
    margin: 1%;
  }
}
```

## 6. TypeScript Interfaces

```typescript
interface ReportInfo {
  year: number;
  month: number;
  createdAt: string;
  isFinalized: boolean;
  finalizedAt: string | null;
}

interface User {
  name: string;
  email: string;
  income: number;
}

interface Summary {
  userIncome: number;
  totalAllocated: number;
  totalSpent: number;
  totalSavings: number;
  carryOverFromPreviousMonth: number;
  carryOverToNextMonth: number;
}

interface JarInfo {
  name: string;
  color: string;
  icon: string;
  category: string;
}

interface Transaction {
  transactionId: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  category: string;
  date: string;
}

interface JarReport {
  jarId: string;
  jarName: string;
  jarCategory: string;
  allocatedAmount: number;
  actualSpent: number;
  actualIncome: number;
  savings: number;
  percentage: number;
  savingsPercentage: string;
  transactions: Transaction[];
  jarInfo: JarInfo | null;
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: string;
}

interface FormattedJar extends JarReport {
  allocatedAmountFormatted: string;
  actualSpentFormatted: string;
  actualIncomeFormatted: string;
  savingsFormatted: string;
}

interface FormattedCategory extends CategorySpending {
  amountFormatted: string;
}

interface FormattedData {
  userIncome: string;
  totalAllocated: string;
  totalSpent: string;
  totalSavings: string;
  carryOverFromPreviousMonth: string;
  carryOverToNextMonth: string;
  jars: FormattedJar[];
  categories: FormattedCategory[];
}

interface Colors {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  dark: string;
  muted: string;
  light: string;
}

interface MonthlyReportPDFData {
  reportInfo: ReportInfo;
  user: User;
  summary: Summary;
  jarsReport: JarReport[];
  categorySpending: CategorySpending[];
  formatted: FormattedData;
  colors: Colors;
}

interface MonthlyReportListItem {
  _id: string;
  userId: string;
  month: number;
  year: number;
  userIncome: number;
  totalAllocated: number;
  totalSpent: number;
  totalSavings: number;
  carryOverFromPreviousMonth: number;
  carryOverToNextMonth: number;
  isFinalized: boolean;
  finalizedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```
