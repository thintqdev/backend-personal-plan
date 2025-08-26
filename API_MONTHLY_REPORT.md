# Monthly Report API Documentation

## Overview

API cho quản lý báo cáo tài chính hàng tháng, bao gồm việc tạo báo cáo, theo dõi thu chi theo jar, và cung cấp dữ liệu để tạo PDF report.

**Base URL:** `http://localhost:3003/api/finance/reports`

---

## 📊 Data Models

### MonthlyReport

```json
{
  "_id": "string",
  "userId": "string",
  "month": 8,
  "year": 2025,
  "userIncome": 16000000,
  "totalAllocated": 16000000,
  "totalSpent": 5900000,
  "totalSavings": 10100000,
  "carryOverFromPreviousMonth": 0,
  "carryOverToNextMonth": 10100000,
  "jarsReport": [
    /* JarReport array */
  ],
  "isFinalized": false,
  "finalizedAt": null,
  "createdAt": "2025-08-26T09:00:00.000Z",
  "updatedAt": "2025-08-26T09:00:00.000Z"
}
```

### JarReport

```json
{
  "jarId": "66cc123456789abcdef01234",
  "jarName": "Tự do tài chính",
  "jarCategory": "Investment",
  "allocatedAmount": 4000000,
  "actualSpent": 0,
  "actualIncome": 0,
  "savings": 4000000,
  "percentage": 25,
  "savingsPercentage": "100.0",
  "transactions": [
    /* Transaction array */
  ],
  "jarInfo": {
    "name": "Tự do tài chính",
    "color": "#2E86AB",
    "icon": "💰",
    "category": "Investment"
  }
}
```

### Transaction (within JarReport)

```json
{
  "transactionId": "66cc789012345abcdef56789",
  "amount": 500000,
  "type": "expense",
  "description": "Mua sách đầu tư",
  "category": "Giáo dục",
  "date": "2025-08-15T10:00:00.000Z"
}
```

---

## 🔗 API Endpoints

### 1. Get Monthly Reports List

**GET** `/api/finance/reports`

Lấy danh sách các báo cáo hàng tháng với filter.

#### Query Parameters

| Parameter | Type   | Required | Description                 |
| --------- | ------ | -------- | --------------------------- |
| year      | number | No       | Năm báo cáo (2024, 2025...) |
| month     | number | No       | Tháng báo cáo (1-12)        |
| limit     | number | No       | Giới hạn số lượng kết quả   |

#### Response

```json
[
  {
    "_id": "66cc123456789abcdef01234",
    "month": 8,
    "year": 2025,
    "userIncome": 16000000,
    "totalAllocated": 16000000,
    "totalSpent": 5900000,
    "totalSavings": 10100000,
    "isFinalized": false,
    "createdAt": "2025-08-26T09:00:00.000Z"
  }
]
```

#### Example Usage

```javascript
// Lấy tất cả báo cáo
fetch("/api/finance/reports");

// Lấy báo cáo năm 2025
fetch("/api/finance/reports?year=2025");

// Lấy báo cáo tháng 8/2025
fetch("/api/finance/reports?year=2025&month=8");

// Lấy 5 báo cáo gần nhất
fetch("/api/finance/reports?limit=5");
```

---

### 2. Get Specific Monthly Report

**GET** `/api/finance/reports/{year}/{month}`

Lấy báo cáo chi tiết của một tháng cụ thể.

#### Path Parameters

| Parameter | Type   | Required | Description          |
| --------- | ------ | -------- | -------------------- |
| year      | number | Yes      | Năm báo cáo          |
| month     | number | Yes      | Tháng báo cáo (1-12) |

#### Response

```json
{
  "_id": "66cc123456789abcdef01234",
  "userId": "66cc987654321abcdef98765",
  "month": 8,
  "year": 2025,
  "userIncome": 16000000,
  "totalAllocated": 16000000,
  "totalSpent": 5900000,
  "totalSavings": 10100000,
  "carryOverFromPreviousMonth": 0,
  "carryOverToNextMonth": 10100000,
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
      "transactions": []
    }
  ],
  "isFinalized": false,
  "finalizedAt": null
}
```

---

### 3. Generate Monthly Report

**POST** `/api/finance/reports/generate`

Tạo báo cáo cho tháng hiện tại hoặc tháng được chỉ định.

#### Request Body

```json
{
  "year": 2025, // Optional, default: current year
  "month": 8 // Optional, default: current month
}
```

#### Response

```json
{
  "_id": "66cc123456789abcdef01234",
  "month": 8,
  "year": 2025,
  "userIncome": 16000000,
  "totalAllocated": 16000000,
  "totalSpent": 5900000,
  "totalSavings": 10100000,
  "jarsReport": [
    /* detailed jar reports */
  ],
  "isFinalized": false
}
```

#### Example Usage

```javascript
// Tạo báo cáo tháng hiện tại
fetch("/api/finance/reports/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({}),
});

// Tạo báo cáo cho tháng 7/2025
fetch("/api/finance/reports/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    year: 2025,
    month: 7,
  }),
});
```

---

### 4. Finalize Monthly Report

**PUT** `/api/finance/reports/{year}/{month}/finalize`

Khóa báo cáo tháng, không cho phép chỉnh sửa sau khi khóa.

#### Path Parameters

| Parameter | Type   | Required | Description          |
| --------- | ------ | -------- | -------------------- |
| year      | number | Yes      | Năm báo cáo          |
| month     | number | Yes      | Tháng báo cáo (1-12) |

#### Response

```json
{
  "message": "Report finalized successfully",
  "report": {
    "_id": "66cc123456789abcdef01234",
    "isFinalized": true,
    "finalizedAt": "2025-08-26T10:00:00.000Z"
  }
}
```

---

### 5. ⭐ Get PDF Report Data (For Frontend)

**GET** `/api/finance/reports/{year}/{month}/pdf-data`

**🎯 Endpoint chính cho Frontend tạo PDF**

Lấy dữ liệu đã được xử lý và format sẵn để frontend tạo PDF report đẹp.

#### Path Parameters

| Parameter | Type   | Required | Description          |
| --------- | ------ | -------- | -------------------- |
| year      | number | Yes      | Năm báo cáo          |
| month     | number | Yes      | Tháng báo cáo (1-12) |

#### Complete Response Example

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
    "email": "user@example.com",
    "income": 16000000
  },
  "summary": {
    "userIncome": 16000000,
    "totalAllocated": 16000000,
    "totalSpent": 5900000,
    "totalSavings": 10100000,
    "carryOverFromPreviousMonth": 0,
    "carryOverToNextMonth": 10100000
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
    }
  ],
  "categorySpending": [
    {
      "category": "Giáo dục",
      "amount": 1500000,
      "percentage": "25.4"
    },
    {
      "category": "Ăn uống",
      "amount": 2000000,
      "percentage": "33.9"
    }
  ],
  "formatted": {
    "userIncome": "16.000.000 ₫",
    "totalAllocated": "16.000.000 ₫",
    "totalSpent": "5.900.000 ₫",
    "totalSavings": "10.100.000 ₫",
    "carryOverFromPreviousMonth": "0 ₫",
    "carryOverToNextMonth": "10.100.000 ₫",
    "jars": [
      {
        "jarName": "Tự do tài chính",
        "allocatedAmountFormatted": "4.000.000 ₫",
        "actualSpentFormatted": "0 ₫",
        "actualIncomeFormatted": "0 ₫",
        "savingsFormatted": "4.000.000 ₫",
        "savingsPercentage": "100.0"
      }
    ],
    "categories": [
      {
        "category": "Giáo dục",
        "amountFormatted": "1.500.000 ₫",
        "percentage": "25.4"
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

---

## 🎨 Frontend Integration Guide

### React Component Example

```jsx
import React, { useState, useEffect } from "react";

const MonthlyReportPDF = ({ year, month }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [year, month]);

  const fetchReportData = async () => {
    try {
      const response = await fetch(
        `/api/finance/reports/${year}/${month}/pdf-data`
      );
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!reportData) return <div>No data available</div>;

  return (
    <div className="report-container">
      {/* Header */}
      <div
        className="report-header"
        style={{ backgroundColor: reportData.colors.primary }}
      >
        <h1>BÁO CÁO TÀI CHÍNH THÁNG</h1>
        <h2>
          Tháng {reportData.reportInfo.month}/{reportData.reportInfo.year}
        </h2>
      </div>

      {/* User Info */}
      <div className="user-info">
        <h3>THÔNG TIN CHUNG</h3>
        <p>Người dùng: {reportData.user.name}</p>
        <p>Thu nhập tháng: {reportData.formatted.userIncome}</p>
        <p>Ngày tạo báo cáo: {reportData.reportInfo.createdAt}</p>
        <p>
          Trạng thái:{" "}
          {reportData.reportInfo.isFinalized ? "Đã khóa" : "Chưa khóa"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="summary-section">
        <h3>TỔNG QUAN TÀI CHÍNH</h3>
        <div className="summary-cards">
          <div
            className="card"
            style={{ backgroundColor: reportData.colors.primary }}
          >
            <span>TỔNG PHÂN BỔ</span>
            <strong>{reportData.formatted.totalAllocated}</strong>
          </div>
          <div
            className="card"
            style={{ backgroundColor: reportData.colors.danger }}
          >
            <span>TỔNG CHI TIÊU</span>
            <strong>{reportData.formatted.totalSpent}</strong>
          </div>
          <div
            className="card"
            style={{ backgroundColor: reportData.colors.success }}
          >
            <span>TỔNG TIẾT KIỆM</span>
            <strong>{reportData.formatted.totalSavings}</strong>
          </div>
        </div>
      </div>

      {/* Jars Table */}
      <div className="jars-section">
        <h3>CHI TIẾT THEO JAR</h3>
        <table>
          <thead style={{ backgroundColor: reportData.colors.secondary }}>
            <tr>
              <th>Tên Jar</th>
              <th>Phân bổ</th>
              <th>Chi tiêu</th>
              <th>Thu nhập</th>
              <th>Tiết kiệm</th>
              <th>% TK</th>
            </tr>
          </thead>
          <tbody>
            {reportData.formatted.jars.map((jar, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor:
                    index % 2 === 0 ? reportData.colors.light : "white",
                }}
              >
                <td>{jar.jarName}</td>
                <td>{jar.allocatedAmountFormatted}</td>
                <td>{jar.actualSpentFormatted}</td>
                <td>{jar.actualIncomeFormatted}</td>
                <td
                  style={{
                    color:
                      jar.savings >= 0
                        ? reportData.colors.success
                        : reportData.colors.danger,
                  }}
                >
                  {jar.savingsFormatted}
                </td>
                <td>{jar.savingsPercentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Spending */}
      <div className="category-section">
        <h3>CHI TIÊU THEO DANH MỤC</h3>
        <table>
          <thead style={{ backgroundColor: reportData.colors.secondary }}>
            <tr>
              <th>Danh mục</th>
              <th>Số tiền</th>
              <th>Tỷ lệ</th>
            </tr>
          </thead>
          <tbody>
            {reportData.formatted.categories.map((cat, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor:
                    index % 2 === 0 ? reportData.colors.light : "white",
                }}
              >
                <td>{cat.category}</td>
                <td>{cat.amountFormatted}</td>
                <td>{cat.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyReportPDF;
```

### PDF Generation with jsPDF

```javascript
import jsPDF from "jspdf";
import "jspdf-autotable";

const generatePDF = async (year, month) => {
  // Fetch data
  const response = await fetch(
    `/api/finance/reports/${year}/${month}/pdf-data`
  );
  const data = await response.json();

  // Create PDF
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text("BÁO CÁO TÀI CHÍNH THÁNG", 20, 20);
  doc.text(`Tháng ${data.reportInfo.month}/${data.reportInfo.year}`, 20, 35);

  // Add user info
  doc.setFontSize(12);
  doc.text(`Người dùng: ${data.user.name}`, 20, 50);
  doc.text(`Thu nhập tháng: ${data.formatted.userIncome}`, 20, 60);

  // Add summary table
  const summaryData = [
    ["Tổng phân bổ", data.formatted.totalAllocated],
    ["Tổng chi tiêu", data.formatted.totalSpent],
    ["Tổng tiết kiệm", data.formatted.totalSavings],
  ];

  doc.autoTable({
    head: [["Mục", "Số tiền"]],
    body: summaryData,
    startY: 70,
  });

  // Add jars table
  const jarsData = data.formatted.jars.map((jar) => [
    jar.jarName,
    jar.allocatedAmountFormatted,
    jar.actualSpentFormatted,
    jar.savingsFormatted,
    jar.savingsPercentage + "%",
  ]);

  doc.autoTable({
    head: [["Jar", "Phân bổ", "Chi tiêu", "Tiết kiệm", "% TK"]],
    body: jarsData,
    startY: doc.lastAutoTable.finalY + 10,
  });

  // Save PDF
  doc.save(`bao-cao-tai-chinh-${year}-${month}.pdf`);
};
```

---

## 📈 Data Flow

1. **User tạo transactions** → Dữ liệu được lưu theo jar
2. **System tạo monthly report** → Tính toán từ transactions trong tháng
3. **Frontend request PDF data** → Backend trả về dữ liệu đã format
4. **Frontend tạo PDF** → Sử dụng dữ liệu để render PDF đẹp

---

## 🔧 Error Handling

### Common Error Codes

- **404**: Không tìm thấy báo cáo cho tháng/năm được chỉ định
- **400**: Báo cáo đã được khóa (khi cố gắng finalize)
- **500**: Lỗi server internal

### Error Response Format

```json
{
  "error": "Monthly report not found",
  "code": 404,
  "details": "No report found for year 2025, month 8"
}
```

---

## 🎯 Frontend Requirements

### PDF Libraries Recommendation

- **jsPDF** + **jsPDF-AutoTable**: Tạo PDF với table đẹp
- **html2canvas** + **jsPDF**: Convert HTML to PDF
- **Puppeteer**: Server-side PDF generation (nếu cần)

### Styling Guidelines

- Sử dụng `colors` object từ API response
- Font size: Header (24px), Subheader (16px), Content (12px)
- Margins: 50px cho tất cả các cạnh
- Table: Alternate row colors, responsive width

### Performance Tips

- Cache report data để tránh multiple API calls
- Lazy load PDF generation
- Show loading state khi fetch data
- Error boundary cho error handling

---

## 📝 Notes

- **Currency Format**: Tất cả số tiền đã được format sẵn với định dạng VND
- **Responsive**: Data structure hỗ trợ cả mobile và desktop
- **Localization**: Tất cả text đã được chuẩn bị cho tiếng Việt
- **Colors**: Bảng màu consistent cho toàn bộ ứng dụng
- **Future-proof**: Cấu trúc dữ liệu có thể mở rộng dễ dàng
