import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
}

interface LeaveRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveDays: number;
  reason: string;
  leaveType: string;
  status: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  employeeName = '';
  email = '';
  department = '';
  employees: Employee[] = [];
  leaves: LeaveRecord[] = [];
  selectedEmployeeId = 0;
  startDate = '';
  endDate = '';
  leaveType = 'ANNUAL';
  reason = '';

  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.loadEmployees();
    this.loadLeaves();
  }

  addEmployee() {
    if (!this.employeeName || !this.email || !this.department) {
      alert('請完整填寫員工資料');
      return;
    }
    const employee = {
      name: this.employeeName,
      email: this.email,
      department: this.department,
    };

    this.http.post('http://localhost:8081/api/employees', employee).subscribe({
      next: () => {
        alert('員工新增成功');
        this.employeeName = '';
        this.email = '';
        this.department = '';
        this.loadEmployees();
      },
      error: () => {
        alert('新增失敗，請確認輸入資料');
      },
    });
  }

  addLeave() {
    if (this.selectedEmployeeId === 0 || !this.startDate || !this.endDate || !this.reason) {
      alert('請完整填寫請假資料');
      return;
    }
    if (this.endDate < this.startDate) {
      alert('結束日期不能早於開始日期');
      return;
    }
    const leave = {
      employeeId: this.selectedEmployeeId,
      startDate: this.startDate,
      endDate: this.endDate,
      leaveType: this.leaveType,
      reason: this.reason,
    };

    this.http.post('http://localhost:8081/api/leaves', leave).subscribe({
      next: () => {
        alert('請假申請送出成功');
        this.selectedEmployeeId = 0;
        this.startDate = '';
        this.endDate = '';
        this.leaveType = 'ANNUAL';
        this.reason = '';
        this.loadLeaves();
      },
      error: () => {
        alert('送出失敗，請確認資料');
      },
    });
  }

  loadEmployees() {
    this.http.get<Employee[]>('http://localhost:8081/api/employees').subscribe((data) => {
      this.employees = data;
    });
  }

  loadLeaves() {
    this.http.get<LeaveRecord[]>('http://localhost:8081/api/leaves').subscribe((data) => {
      this.leaves = data;
    });
  }

  updateLeaveStatus(leaveId: number, status: string) {
    this.http.patch(`http://localhost:8081/api/leaves/${leaveId}/status`, { status }).subscribe({
      next: () => {
        alert('請假狀態更新成功');
        this.loadLeaves();
      },
      error: () => {
        alert('更新失敗，此請假可能已經審核過');
      },
    });
  }

  getLeaveStatusText(status: string) {
    if (status === 'PENDING') {
      return '待審核';
    }

    if (status === 'APPROVED') {
      return '已核准';
    }

    return '已拒絕';
  }
  getLeaveTypeText(type: string) {
    if (type === 'ANNUAL') {
      return '年假';
    }

    if (type === 'SICK') {
      return '病假';
    }

    if (type === 'PERSONAL') {
      return '事假';
    }

    return '未設定';
  }
}
