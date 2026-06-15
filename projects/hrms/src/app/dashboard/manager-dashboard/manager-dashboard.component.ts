import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbPopoverModule, NgbModal, NgbOffcanvas, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { AccordionModule } from 'primeng/accordion';
import { Calendar } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { Chip } from 'primeng/chip';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { TabList, TabsModule } from 'primeng/tabs';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IdayLogs } from '../../Attendance/attendance-view/attendance-modal';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { ProfileIconComponent } from '../../icons/profile-icon/profile-icon.component';
import { AttendanceResponse, Permission, EmployeeStatusCount } from '../../Interfaces/dashboard.modal';
import { IDepartment } from '../../Interfaces/letters-model';
import { Ipersonal } from '../../Interfaces/personal-modal';
import { ICategoryDetails } from '../../Interfaces/timoff-model';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-manager-dashboard',
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, NgbPopoverModule, ModuleInfoIconComponent,
    ChartModule, DateformatPipe, Skeleton, AccordionModule, ProfileIconComponent, NoDataFoundComponent, 
    DatePicker, TabList, Calendar, TabsModule, Select, Chip],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ManagerDashboardComponent {
  greetingMessage = '';
  selectedEmployeeId: any;
  jobdetails: any;
  employeedata: any;
  currentTime: Date = new Date();
  loading = false;
  avaliabletlyloading = false;
  showAvailabilityMessage = false;
  hasRealEvents: boolean = false;
  weaklyloghrsloader = false;
  subscription: any;
  private intervalId: any;
  empinfo = {} as Ipersonal;
  destroy$: Subject<boolean> = new Subject<boolean>();
  teamMemberArray: any[] = [];
  getTeamMemberArray: any[] = [];
  categoryDetails = [] as ICategoryDetails[];
  currentMonth!: number;
  nextMonth!: number;
  currentYear!: number;
  searchEmployeeText: string = '';
  leavesList: any[] = [];
  totalLeaves: any = {};
  todayChartData: any;
  todayChartOptions: any;
  totalLeavesChartData: any;
  totalLeavesChartOptions: any;
  currentDate: number = new Date().getDate();
  previousDate: any;
  startOfWeek: any;
  endOfWeek: any;
  totalHours: any;
  teamMembers: any[] = [];
  teamavailabilityinfo = 'Displays your team’s current availability for the selected date, including In Office, WFH, On Leave, Half Day, Remote, and Absent statuses.';
  myteammemberinfo = 'Displays an overview of all team members in the organization, helping employees stay informed about their colleagues.';
  genderdiversityinfo = 'Displays the gender distribution of employees, giving a quick and clear view of workforce diversity.';
  Weeklyworklogsinfo = 'Shows a weekly summary of the hours that are logged, making it easy to track their work and productivity.';
  leavesConsumedinfo = 'Provides an overview of consumed leave balances categorized by leave type.';
  attendancoverviewinfo = 'Displays your attendance details for the selected date, including duty status, first in time, last out time, and the previous day’s log duration.'
  legendList = [
    { key: 'inOffice', label: 'In Office', color: '#1E90FF' },
    { key: 'halfDay', label: 'Half Day', color: '#FFD700' },
    { key: 'wfh', label: 'WFH', color: '#FF1493' },
    { key: 'absent', label: 'Absent', color: '#FF0000' },
    { key: 'leave', label: 'Leave', color: '#8A2BE2' },
    { key: 'remote', label: 'Remote', color: '#EA362C' },
    { key: 'weekend', label: 'Weekend', color: '#32CD32' },
    { key: 'holiday', label: 'Holiday', color: '#FFA500' },
    { key: 'yetToLogin', label: 'Yet To Login', color: '#94A3B8' },
  ];
  genderTotal: number = 0;
  femaleCount: number = 0;
  maleCount: number = 0;
  weeklyWorkLogs: any[] = [];
  anniversaries: any[] = [];
  todayDurationLabel: string = "00:00:00";
  previousDurationLabel: string = "00:00:00";
  todayDurationPercent: number = 0;
  offCanvasData: any;
  OffCanvasemployeeList: any;
  ChartDataLabels = ChartDataLabels;
  datalabelUnderlinePlugin = {
    id: 'datalabelUnderline',
    afterDraw: (chart: any) => {
      const ctx = chart.ctx;
      const isHorizontal = chart.config?.options?.indexAxis === 'y';
      if (!isHorizontal) return;
      
      // Check if user has permission to view employee list
      const hasViewPermission = this.rbac.allowedToAccess('Headcount by Gender View Employee List.view');
      if (!hasViewPermission) return; // Don't draw underline if no permission
      
      chart.data.datasets.forEach((dataset: any, dsIndex: number) => {
        const meta = chart.getDatasetMeta(dsIndex);
        if (meta.hidden) return;
        meta.data.forEach((element: any, dataIndex: number) => {
          const value = dataset.data[dataIndex];
          if (!value) return;
          ctx.save();
          ctx.font = 'bold 12px sans-serif';
          const textWidth = ctx.measureText(String(value)).width;
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(element.x + 8, element.y + 7);
          ctx.lineTo(element.x + 8 + textWidth, element.y + 7);
          ctx.stroke();
          ctx.restore();
        });
      });
    }
  };
  selectedDate!: Date;
  timeEntryLoader = false;
  consumedLeavesLoader = false;
  selectedWeek: Date[] | null = null;
  today = new Date();
  disabledDates: Date[] = [];
  intialLoading = false;
  iconPath: string = '';
  attendanceLoader = false;
  attendanceData: AttendanceResponse = {} as AttendanceResponse;
  currentDay!: number;
  chartLoader = false;
  employeeSelected = false;
  active = 'Active';
  activeCount: number = 0;
  activeEmplist = [] as any;
  getEmployeeInfo = [] as any;
  jobdata = {} as any;
  cardItems: any[] = [];
  todayMaxdate!: Date
  regularization_list: Permission[] = [];
  attendanceselectedDate!: Date;
  employeesStatusCount: EmployeeStatusCount = {} as EmployeeStatusCount;
  previousMonthStartDate: any;
  punchPairs = [] as IdayLogs[];
  logsDuration!: string;
  breakDuration!: string
  permissions_list: Permission[] = [];
  departmentDetails = [] as IDepartment[];
  isScreenLessThan1600 = window.innerWidth < 1600;
  // employee skill popup variables  
  selectedEmployee: any = null;
  selectedProject: any = null;
  selectedPhases: any[] = [];
  // gender offcanvas variables
  genderRawEmployees: any[] = [];
  genderOffcanvasTitle: string = '';
  genderOffcanvasList: any[] = [];
  @ViewChild('genderEmployeesList') genderOffcanvasTemplate!: TemplateRef<any>;
  // attendance offcanvas variables
  attendanceOffcanvasTitle: string = '';
  attendanceOffcanvasType: string = '';
  processedOffcanvasEmployees: any[] = [];
  @ViewChild('attendanceEmployeesList') attendanceOffcanvasTemplate!: TemplateRef<any>;

  constructor(private http: HttpService, private router: Router, public modalService: NgbModal,
    private offcanvasService: NgbOffcanvas, public rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.intialLoading = true;
    this.setIconBasedOnTime();
    this.intervalId = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeedata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const currentDate = new Date();
    const firstDayPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    this.previousMonthStartDate = `${firstDayPrevMonth.getFullYear()}-${String(firstDayPrevMonth.getMonth() + 1).padStart(2, '0')}-
    ${String(firstDayPrevMonth.getDate()).padStart(2, '0')}`;
    this.currentYear = new Date().getFullYear(); // e.g., 2025
    this.currentMonth = new Date().getMonth() + 1; // 1 (Jan) to 12 (Dec)
    this.currentDay = new Date().getDate();
    const today = new Date();
    today.setDate(today.getDate() - 1);
    this.previousDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.nextMonth = this.currentMonth === 12 ? 1 : this.currentMonth + 1;
    this.currentDate = new Date().getDate();
    this.setCurrentWeek();
    this.getDepartment();
    this.getJobDetails();
    this.getAllEmployeeDetails();
    this.getTeamManagersDetails();
    this.getAllTeammembersList();
    this.gettodayloggedtime();
    this.selectedDate = new Date(); // current date by default
    this.getteamavliabletly(this.selectedDate);
    this.getWeeklyWorkLogHours();
    this.getCategoryempDetails(this.empinfo?.employeeId);
    this.buildDisabledFutureWeekDates();
    this.intialLoading = false;
    this.getAttendenceLogsOfLoginedUser(this.employeedata.employeeId, this.currentYear, this.currentMonth, this.currentDay);
    this.getpreviousloggedtime();
    this.todayMaxdate = new Date();
    this.getAttendanceReportData();
    this.getApprovalsOverview();
  }

  setIconBasedOnTime() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
      // Morning
      this.greetingMessage = 'Good Morning';
      this.iconPath = '/dashboard-icon/morning-icon.png';
    } else if (hour >= 12 && hour < 16) {
      // Afternoon
      this.greetingMessage = 'Good Afternoon';
      this.iconPath = '/dashboard-icon/afternoon-icon.png';
    } else if (hour >= 16 && hour < 23) {
      // Evening
      this.greetingMessage = 'Good Evening';
      this.iconPath = '/dashboard-icon/sunset-icon.png';
    } else {
      // Night
      this.greetingMessage = 'Good Evening';
      this.iconPath = '/dashboard-icon/night-icon.png';
    }
  }

  getDepartment() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        this.departmentDetails = data as IDepartment[];
        this.departmentDropdownOptions = [
          { departmentName: 'All', sno: null },
          ...this.departmentDetails
        ];
      }
    });
  }

  getJobDetails() {
    this.loading = true
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`JobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.jobdetails = data[0];
        this.getGenderCountChart();
      },
      error: (data: any) => {
      }
    });
  }

  getAttendenceLogsOfLoginedUser(empId: number, currentYear: number, currentMonth: number, currentDay: number) {
    this.attendanceLoader = true;
    // Calculate start and end dates for the current day
    const startDate = moment().year(currentYear).month(currentMonth - 1).date(currentDay).format('YYYY-MM-DD');
    const endDate = startDate; // Same day for both start and end
    this.subscription = this.http.getData(`v2/AttendanceData/employee/${empId}?fromdate=${startDate}&todate=${endDate}`).subscribe({
      next: (data: any) => {
        this.attendanceLoader = false;
        this.attendanceData = data;
      },
      error: (reason) => {
        this.attendanceData = {} as AttendanceResponse;
        this.attendanceLoader = false;
      },
    });
  }

  getAllEmployeeDetails() {
    const EmployeeId = this.empinfo?.employeeId;
    const satus = ['Active', 'Trainee Active'];
    this.http.getData(`Employeedata/v3/Getallemployees?statuses=${satus}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.filter((emp: any) => emp.employeeId !== EmployeeId).map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId
        }));
      },
    });
  }

  getTeamManagersDetails() {
    const EmployeeId = this.empinfo?.employeeId;
    this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.length) {
          const myTeam = response.filter((e: any) => e.isAccess);
          this.getEmployeeInfo = myTeam.map((emp: any) => {
            const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
            const fullName = `${fusionPart}${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName ?? ''}`.trim();
            return {
              ...emp,
              fullName
            };
          });
          //  Alphabetical sorting by firstName
          this.getEmployeeInfo.sort((a: any, b: any) =>
            a.firstName.localeCompare(b.firstName, 'en', { sensitivity: 'base' })
          );
        }
      },
      error: (err) => console.error(err)
    });
  }

  getAllTeammembersList() {
    this.loading = true;
    const EmployeeId = this.empinfo?.employeeId;
    this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (responseData: any) => {
        this.loading = false;
        this.teamMembers = responseData.map((emp: any) => {
          const fullName = `${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName ?? ''}`.trim();
          return {
            id: emp.employeeId,
            name: fullName,
            role: emp.jobRole,
            photo: this.getImageUrl(emp.profilePic),
            isAccess: emp.isAccess ?? false
          };
        })
      },
      error: (err: any) => {
        this.loading = false;
        console.log(err);
      }
    });
  }

  private getImageUrl(imagePath: string): string | null {
    if (!imagePath) {
      return null;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    if (imagePath.startsWith('Profilepics/')) {
      return `${environment.viewUrl}${imagePath}`;
    }
    return `${environment.ApiUrl}EmployeeData/DownloadProfilePic?filename=${imagePath}`;
  }

  getSuffix(num: number): string {
    if (!num) return '';
    const lastDigit = num % 10;
    const lastTwo = num % 100;
    if (lastTwo >= 11 && lastTwo <= 13) return `${num}th`;
    switch (lastDigit) {
      case 1: return `${num}st`;
      case 2: return `${num}nd`;
      case 3: return `${num}rd`;
      default: return `${num}th`;
    }
  }

  onCheckemployee(employeedId: any) {
    this.selectedEmployeeId = employeedId;
    this.employeeSelected = !!employeedId;
    if (employeedId) {
      this.getCategoryempDetails(employeedId);
    } else {
      this.getCategoryempDetails(this.empinfo?.employeeId)
    }
  }

  getCategoryempDetails(empId: any) {
    this.consumedLeavesLoader = true;
    this.http.getData(`LeaveEntitlements/v2/employee/${empId}?year=${this.currentYear}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.leavesList = res.data.map((item: any) => {
            const used = (item.utilizedDays || 0) + (item.booked || 0);
            return {
              name: item.category?.name,
              allowed: item.allowedDays,
              used,
              percentage: item.allowedDays === 0 ? 0 : (used / item.allowedDays) * 100,
              color: item.category?.categoryColor
            };
          });
          // NEW: Total leaves calculation
          const totalAllowed = res.data.reduce((sum: number, x: any) => sum + x.allowedDays, 0);
          const totalUsed = res.data.reduce((sum: number, x: any) => sum + (x.utilizedDays || 0) + (x.booked || 0), 0);
          this.totalLeaves = {
            allowed: totalAllowed,
            used: totalUsed,
            percentage: totalAllowed === 0 ? 0 : (totalUsed / totalAllowed) * 100
          };
        }
        this.buildTotalLeavesChart();
        this.consumedLeavesLoader = false;
      }
    });
  }

  buildTotalLeavesChart() {
    this.totalLeavesChartData = {
      datasets: [
        {
          data: [
            this.totalLeaves.used,
            this.totalLeaves.allowed - this.totalLeaves.used
          ],
          backgroundColor: ["#0B3A83", "#E5E7EB"],
          borderWidth: 0
        }
      ]
    };
    this.totalLeavesChartOptions = {
      responsive: true,
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    };
  }

  getFullName(b: { firstName: string; middleName?: string; lastName: string }): string {
    return [b.firstName, b.middleName, b.lastName].filter(Boolean).join(' ');
  }

  // Custom carousel indicator properties
  currentCarouselIndex = 0;
  get activeIndicatorIndex() {
    return this.currentCarouselIndex % 3;
  }

  onCarouselPageChange(event: any) {
    this.currentCarouselIndex = event.page;
  }

  genderCountLoader = false;
  genderChartData: any = {};
  genderChartOptions: any = {};
  hasGenderData: boolean = false;
  selectedDepartmentId: number | null = null;
  departmentDropdownOptions: any[] = [];
  onDepartmentChange(event: any) {
    const selectedId = event.value;
    if (selectedId === null || selectedId === undefined) {
      this.getGenderCountChart();
    } else {
      this.getGenderCountChart(selectedId);
    }
  }

  getGenderCountChart(departmentDetailsid?: any) {
    this.genderCountLoader = true;
    let apiUrl = 'v2/Employeedata/DepartmentGenderCount';
    if (departmentDetailsid !== null && departmentDetailsid !== undefined) {
      apiUrl += `?deptId=${departmentDetailsid}`;
    }
    this.http.getData(apiUrl).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.genderCountLoader = false;
        this.genderTotal = data?.headCount || 0;
        const genders = data?.genders || [];
        // Proper No Data Condition
        if (!genders.length || this.genderTotal === 0) {
          this.hasGenderData = false;
          this.genderChartData = null;
          return;
        }
        this.hasGenderData = true;
        const labels = genders.map((item: any) => item.gender);
        const counts = genders.map((item: any) => item.count);
        this.genderRawEmployees = data?.employees || [];
        // ADD THIS HERE
        const maxValue = Math.max(...counts);
        let stepSize = 5;
        if (maxValue > 50) stepSize = 10;
        if (maxValue > 100) stepSize = 20;
        if (maxValue > 200) stepSize = 50;
        const suggestedMax = Math.ceil(maxValue / stepSize) * stepSize;
        const colors = labels.map((gender: string) => {
          if (gender === 'Female') return '#E91CAB';
          if (gender === 'Male') return '#1E88E5';
          return '#B146C3';
        });
        this.genderChartData = {
          labels,
          datasets: [{
            label: 'Count',
            data: counts,
            backgroundColor: colors,
            barThickness: 10,
            borderRadius: {
              topRight: 12,
              bottomRight: 12,
              topLeft: 0,
              bottomLeft: 0
            }
          }]
        };
        let isOverLabel = false;
        const hasViewPermission = this.rbac.allowedToAccess('Headcount by Gender View Employee List.view');
        this.genderChartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          layout: { padding: { right: 30 } },
          onClick: (_event: any, elements: any[]) => {
            if (!hasViewPermission || !elements.length) return;
            const dataIndex = elements[0].index;
            const gender = labels[dataIndex];
            const count = counts[dataIndex];
            if (!count) return;
            this.openGenderOffcanvas(gender, count);
          },
          onHover: (_event: any, elements: any[], chart: any) => {
            if (!isOverLabel) {
              chart.canvas.style.cursor = (hasViewPermission && elements.length) ? 'pointer' : 'default';
            }
          },
          plugins: {
            legend: { display: false },
            datalabels: {
              anchor: 'end',
              align: 'right',
              color: '#000',
              font: { weight: 'bold', size: 12 },
              formatter: (value: number) => value,
              listeners: {
                click: (context: any) => {
                  if (!hasViewPermission) return;
                  const gender = labels[context.dataIndex];
                  const count = counts[context.dataIndex];
                  if (!count) return;
                  this.openGenderOffcanvas(gender, count);
                },
                enter: (context: any) => {
                  if (!hasViewPermission) return;
                  isOverLabel = true;
                  context.chart.canvas.style.cursor = 'pointer';
                },
                leave: (context: any) => {
                  isOverLabel = false;
                  context.chart.canvas.style.cursor = 'default';
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              max: suggestedMax,
              ticks: {
                stepSize: stepSize
              },
              grid: { display: false }
            },
            y: {
              grid: { display: false }
            }
          }
        };
      },
      error: (err: any) => {
        this.genderCountLoader = false;
        this.hasGenderData = false;
        this.genderChartData = null;
        console.error('Error fetching gender chart:', err);
      }
    });
  }

  openGenderOffcanvas(gender: string, count: number) {
    if (!count) return;
    this.searchEmployeeText = '';
    this.genderOffcanvasTitle = gender;
    this.genderOffcanvasList = this.genderRawEmployees
      .filter((emp: any) => emp.gender === gender)
      .map((emp: any) => ({
        ...emp,
        profilePicUrl: emp.profilePic ? this.getImageUrl(emp.profilePic) : null
      }));
    this.offcanvasService.open(this.genderOffcanvasTemplate, { position: 'end', backdrop: 'static', keyboard: false });
  }

  getFilteredAttendanceEmployees() {
    return this.searchEmployeeText
      ? this.processedOffcanvasEmployees.filter((emp: any) => this.matchesSearch(emp))
      : this.processedOffcanvasEmployees;
  }

  getFilteredGenderEmployees() {
    return this.searchEmployeeText
      ? this.genderOffcanvasList.filter((emp: any) => this.matchesSearch(emp))
      : this.genderOffcanvasList;
  }

  openModalLarge(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static', });
  }

  onDateChange(date: Date) {
    this.getteamavliabletly(date);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  teamSummary: any = {};
  teamTotal: number = 0;
  teamChartData: any = {};
  teamChartOptions: any = {};
  getteamavliabletly(date: Date) {
    const formattedDate = this.formatDate(date);
    this.avaliabletlyloading = true;
    this.showAvailabilityMessage = false;

    setTimeout(() => {
      if (this.avaliabletlyloading) {
        this.showAvailabilityMessage = true;
      }
    }, 2000);

    this.http.getData(`v2/Employeedata/TeamAvailability/Summary/${this.empinfo.employeeId}?date=${formattedDate}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.avaliabletlyloading = false;
        this.showAvailabilityMessage = false;
        this.teamSummary = res.summary;
        this.OffCanvasemployeeList = res.employees;
        // Total = all statuses
        this.teamTotal = (this.teamSummary.inOffice || 0) + (this.teamSummary.halfDay || 0) + (this.teamSummary.wfh || 0)
          + (this.teamSummary.leave || 0) + (this.teamSummary.absent || 0) + (this.teamSummary.remote || 0)
          + (this.teamSummary.weekend || 0) + (this.teamSummary.holiday || 0) + (this.teamSummary.yetToLogin || 0);
        this.buildTeamChart();
      },
      error: (err: any) => {
        this.avaliabletlyloading = false;
        this.showAvailabilityMessage = false;
        console.error('Error fetching team availability:', err);
      }
    });
  }

  buildTeamChart() {
    const summary = this.teamSummary;
    // Keys to display (order matters)
    const keys = ["inOffice", "halfDay", "wfh", "leave", "absent", "remote", "weekend", "holiday", "yetToLogin"];
    // Convert keys into labels (formatted text)
    const labels: string[] = keys.map(x =>
      x.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
    );
    // Values for chart
    const chartData = keys.map(k => summary[k] || 0);
    // Matching colors (same order as keys)
    const colors = ["#1E90FF", "#FFD700", "#FF1493", "#8A2BE2", "#FF0000", "#EA362C", "#32CD32", "#FFA500", "#94A3B8"];
    this.teamChartData = {
      labels,
      datasets: [
        {
          data: chartData,
          backgroundColor: colors,
          borderWidth: 3,             // gap size
          borderColor: '#ffffff',    // match card background color
          hoverOffset: 0,
          borderRadius: 1,
        }
      ]
    };
    this.teamChartOptions = {
      responsive: true,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
    };
  }

  gettodayloggedtime() {
    this.timeEntryLoader = true;
    this.http.getData(`v2/AttendanceData/employee/${this.empinfo.employeeId}?year=${this.currentYear}&month=${this.currentMonth}&date=${this.currentDate}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const today = res?.data?.attendanceData?.find((x: any) => x.date === this.currentYear + '-' + this.currentMonth + '-' + this.currentDate) ?? res?.data?.attendanceData?.[0];
        const totalDuration = today?.duration?.totalDuration ?? "00:00:00";
        this.todayDurationLabel = totalDuration;
        const workedSeconds = this.timeToSeconds(totalDuration);
        const fullDaySeconds = 8 * 3600; // 8 hours
        this.todayDurationPercent = Math.min((workedSeconds / fullDaySeconds) * 100, 100);
        this.buildCircularChart();
        this.timeEntryLoader = false;
      },
      error: err => console.log(err),
    });
  }

  getpreviousloggedtime() {
    this.http.getData(`v2/AttendanceData/employee/${this.empinfo.employeeId}?fromdate=${this.previousMonthStartDate}&todate=${this.previousDate}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const attendanceData = res?.data?.attendanceData || [];
        // Find the last day with totalDuration > 00:00:00, excluding current date
        const currentDateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(this.currentDate).padStart(2, '0')}`;
        const previousDay = attendanceData.filter((x: any) => x.date !== currentDateStr && x.duration?.totalDuration !== '00:00:00').sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const totalDuration = previousDay?.duration?.totalDuration ?? "00:00:00";
        this.previousDurationLabel = totalDuration;
      },
      error: err => console.log(err),
    });
  }

  timeToSeconds(time: string | null | undefined): number {
    if (!time || !time.includes(':')) return 0;
    const parts = time.split(':').map(Number);
    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    const s = parts[2] ?? 0;
    return h * 3600 + m * 60 + s;
  }

  buildCircularChart() {
    this.todayChartData = {
      datasets: [
        {
          data: [this.todayDurationPercent, 100 - this.todayDurationPercent],
          backgroundColor: ["#0B3A83", "#E5E7EB"],
          borderWidth: 0
        }
      ]
    };
    this.todayChartOptions = {
      responsive: true,
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      interaction: {
        mode: false,
      },
      hover: {
        mode: null,
        intersect: false,
      },
      events: []
    };
  }

  setCurrentWeek() {
    const start = moment().startOf('isoWeek');
    const end = moment().endOf('isoWeek');
    this.startOfWeek = start.format('YYYY-MM-DDTHH:mm:ss');
    this.endOfWeek = end.format('YYYY-MM-DDTHH:mm:ss');
    this.selectedWeek = [start.toDate(), end.toDate()];
  }

  onWeekSelect(date: Date) {
    const start = moment(date).startOf('isoWeek');
    const end = moment(date).endOf('isoWeek');
    // Block future weeks
    if (start.isAfter(moment().startOf('isoWeek'))) {
      return;
    }
    this.startOfWeek = start.format('YYYY-MM-DDTHH:mm:ss');
    this.endOfWeek = end.format('YYYY-MM-DDTHH:mm:ss');
    this.selectedWeek = [start.toDate(), end.toDate()];
    this.getWeeklyWorkLogHours();
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  getEndOfWeek(date: Date): Date {
    const start = this.getStartOfWeek(date);
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  }

  getWeeklyWorkLogHours() {
    this.weaklyloghrsloader = true;
    this.http.getData(`v2/AttendanceData/employee/${this.empinfo.employeeId}?fromdate=${this.startOfWeek}&todate=${this.endOfWeek}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const attendance = res.data.attendanceData;
        // Prepare weeklyWorkLogs for template
        this.weeklyWorkLogs = attendance.map((item: any) => ({
          day: moment(item.date).format('dddd'),
          time: item.duration.totalDuration,
          status: item.displayStatus.status,
          statusColor: item.displayStatus.colour
        }));
        // Calculate total hours of the week
        this.totalHours = this.sumDurations(
          attendance.map((item: any) => item.duration.totalDuration)
        );
        this.weaklyloghrsloader = false;
      },
      error: (err) => {
        this.weaklyloghrsloader = false;
      }
    });
  }

  // Sum durations in HH:mm:ss format
  sumDurations(durations: string[]): string {
    let totalSeconds = 0;
    durations.forEach((time) => {
      const [h, m, s] = time.split(':').map(Number);
      totalSeconds += h * 3600 + m * 60 + s;
    });
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getDobWithCurrentYear(dob: string) {
    const date = new Date(dob);
    const today = new Date();
    // Set year as current year first
    date.setFullYear(today.getFullYear());
    // If that birthday already passed → move to next year
    if (date < today) {
      date.setFullYear(today.getFullYear() + 1);
    }
    return date;
  }

  getannuservierWithCurrentYear(dob: string) {
    const date = new Date(dob);
    const today = new Date();
    // Set anniversary to the current year first
    date.setFullYear(today.getFullYear());
    // If the anniversary already passed this year → move to next year
    if (date < today) {
      date.setFullYear(today.getFullYear() + 1);
    }
    return date;
  }

  nagvition() {
    this.router.navigate(['/myinfo/job/team-members']);
  }

  myattendance() {
    this.router.navigate(['/attendance']);
  }

  openOffcanvas(content: any, data: any) {
    this.searchEmployeeText = '';
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
    this.offCanvasData = data;
  }

  dayLogsData(Value: any, date: Date, totalduration: any, permissions: any, regularizations: any, breakDuration: any) {
    this.logsDuration = totalduration;
    this.attendanceselectedDate = date;
    this.permissions_list = permissions;
    this.regularization_list = regularizations;
    this.breakDuration = breakDuration;
    if (Value) {
      this.punchPairs = Value;
    } else {
      this.punchPairs = [];
    }
  }

  getFilteredEmployees() {
    const key = this.offCanvasData?.key;
    const list = this.OffCanvasemployeeList?.[key] || [];
    const filteredList = this.searchEmployeeText ? list.filter((emp: any) => this.matchesSearch(emp)) : list;
    return filteredList.map((emp: any) => ({
      ...emp,
      profilePicUrl: this.getImageUrl(emp.profilePic)
    }));
  }

  private matchesSearch(emp: any): boolean {
    const q = this.searchEmployeeText.toLowerCase();
    return emp.employeeName?.toLowerCase().includes(q)
      || emp.designation?.toLowerCase().includes(q)
      || emp.departmentName?.toLowerCase().includes(q);
  }

  close() {
    this.offcanvasService.dismiss();
  }

  buildDisabledFutureWeekDates() {
    const today = moment();
    const endOfCurrentWeek = moment().endOf('isoWeek');
    const maxDisableDate = moment().add(1, 'year'); // reasonable future limit
    const disabled: Date[] = [];
    let cursor = endOfCurrentWeek.clone().add(1, 'day');
    while (cursor.isSameOrBefore(maxDisableDate)) {
      disabled.push(cursor.toDate());
      cursor.add(1, 'day');
    }
    this.disabledDates = disabled;
  }

  get noEventAccess(): boolean {
    return (
      !this.rbac.allowedToAccess('Upcoming Work Anniversaries.view') &&
      !this.rbac.allowedToAccess('Upcoming Birthdays.view') &&
      !this.rbac.allowedToAccess('Today Events.view')
    );
  }

  getLeaveChipStyle(color: string) {
    if (!color) return {};
    return {
      'border-color': color,
      'color': color,
      'background-color': this.hexToRgba(color, 0.05) // 5% opacity
    };
  }

  hexToRgba(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // function of employee view of projectss and skills
  private fallbackIconPool: string[] = [
    "/icons/intelligence.png",
    "/icons/logical-thinking.png",
    "/icons/technique.png"
  ];

  private fallbackMap: Record<string, string> = {};
  private normalizeCategory(key: string): string {
    return key.replace(/\s+/g, '').toLowerCase();
  }
  private categoryAliases: Record<string, string> = {
    technicalskill: "technicalskill",
    technicalskills: "technicalskill",

    softskill: "softskill",
    softskills: "softskill",

    leadershipskill: "leadershipskill",
    leadershipskills: "leadershipskill",

    functionalskill: "functionalskill",
    functionalskills: "functionalskill"
  };

  getCategoryIcon(category: string): string {
    // Normalize
    let normalized = this.normalizeCategory(category || "");
    normalized = this.categoryAliases[normalized] || normalized;

    // If category has known icon
    if (this.categoryIcons[normalized]) {
      return this.categoryIcons[normalized];
    }

    // If fallback icon already assigned for this unknown category → reuse it
    if (this.fallbackMap[normalized]) {
      return this.fallbackMap[normalized];
    }

    // Assign next available fallback icon uniquely
    for (const icon of this.fallbackIconPool) {
      const alreadyUsed = Object.values(this.fallbackMap).includes(icon);
      if (!alreadyUsed) {
        this.fallbackMap[normalized] = icon;
        return icon;
      }
    }

    // If all fallback icons are used, start cycling
    const cycleIndex = Object.keys(this.fallbackMap).length % this.fallbackIconPool.length;
    const fallback = this.fallbackIconPool[cycleIndex];

    this.fallbackMap[normalized] = fallback;
    return fallback;
  }

  openModal(content: TemplateRef<any>, emp: any) {
    const fullEmployee = this.teamMembers.find(e => e.id === emp);
    this.selectedEmployee = {
      id: emp,
      profileImage: fullEmployee?.photo
    };
    this.getEmployeeSkillProjectDetails();
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  getSkillsByLevel(level: string, skills: any[]) {
    return skills.filter(s => s.proficiencyLevel?.toLowerCase() === level.toLowerCase());
  }

  getProficiencyClass(level: string): string {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'chip-beginner';
      case 'intermediate': return 'chip-intermediate';
      case 'expert': return 'chip-expert';
      default: return 'chip-default';
    }
  }

  loadingEmployeeData: boolean = false;
  private categoryIcons: Record<string, string> = {
    technicalskill: "/icons/technical-skills-icon.png",
    softskill: "/icons/soft-skills-icon.png",
    leadershipskill: "/icons/leadership-skills.png",
    functionalskill: "/icons/functional-skills.png"
  };

  skillCategories: any[] = [];
  getEmployeeSkillProjectDetails() {
    this.loadingEmployeeData = true;
    const empId = this.selectedEmployee.id;
    this.http.getDataIncludeParams(`EmployeeSkills/getEmployeeSkillsAndProjectsById?employeeId=${empId}`).subscribe({
      next: (res: any) => {
        this.loadingEmployeeData = false;
        if (res?.success && res?.data) {
          const allSkills = res.data.skills || [];
          const grouped: any = {};
          allSkills.forEach((skill: any) => {
            if (!skill.isActive) return;
            const category = skill.skillCategory?.trim() || "Others";
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(skill);
          });
          this.skillCategories = Object.keys(grouped).map(category => ({
            category,
            icon: this.getCategoryIcon(category),
            skills: grouped[category]
          }));
          const updatedProjects =
            res.data.projects?.map((project: any) => ({
              ...project,
              phasesCount: project?.phases?.length || 0
            })) || [];
          this.selectedEmployee = {
            ...this.selectedEmployee,
            ...res.data,
            projects: updatedProjects,
            allSkills,
            skillCategories: this.skillCategories
          };
        } else {
          this.selectedEmployee = { ...this.selectedEmployee };
        }
      },
      error: () => {
        this.loadingEmployeeData = false;
        this.selectedEmployee = { ...this.selectedEmployee };
      }
    });
  }

  get employeeStatusDisplay(): string {
    const emp = this.selectedEmployee;
    if (!emp) return '-';
    if (emp.employeeProjectStatus === 'Committed' && emp.projects?.length) {
      const lastProject = emp.projects.filter((p: any) => p.endDate).sort((a: any, b: any) =>
        new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
      if (lastProject?.endDate) {
        const formattedDate = moment(lastProject.endDate).format('MMM DD, YYYY');
        return `Committed until ${formattedDate}`;
      }
    }
    return emp.employeeProjectStatus || '-';
  }

  openModal2(content: any, project: any) {
    this.selectedProject = project;
    this.selectedPhases = project?.phases || [];
    this.modalService.open(content, { size: 'lg', backdrop: 'static', centered: true });
  }

  trackByIndex(index: number) {
    return index;
  }

  getStatusClassforPhase(status: string): string {
    if (!status) return '';
    const normalized = status.toLowerCase();
    if (normalized === 'yet to start') return 'status-yet-to-start';
    if (normalized === 'in progress') return 'status-in-progress';
    if (normalized === 'extended') return 'status-extended';
    if (normalized === 'hold') return 'status-hold';
    if (normalized === 'completed') return 'status-completed';
    if (normalized === 'closed') return 'status-closed';
    if (normalized === 'active') return 'status-active';
    return '';
  }

  closep(modal: any) {
    modal.close();
  }

  closePr(modal: NgbModalRef) {
    modal.close();
  }

  // attendancereport functions
  attendanceReportData: any;
  attendanceEmployeesList: any[] = [];
  attendanceChartData: any;
  attendanceChartOptions: any;
  hasAttendanceReportData: boolean = false;
  attendanceReportLoader: boolean = false;
  totalAttendanceCount: number = 0;
  attendanceReportDate: Date = new Date();
  maxAttendanceReportDate: Date = new Date();
  minAttendanceReportDate: Date = new Date(new Date().setDate(new Date().getDate() - 30));
  approvalsOverviewLoader: boolean = false;
  approvalsList: any[] = [];
  getAttendanceReportData() {
    this.attendanceReportLoader = true;
    const selectedDate = moment(this.attendanceReportDate || new Date());
    const formattedDate = selectedDate.format('YYYY-MM-DD');
    this.http.getData(`v2/Employeedata/ReporteesAttendanceStatus/${this.empinfo?.employeeId}?date=${formattedDate}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.attendanceReportData = res?.summary;
        this.attendanceEmployeesList = res?.employees || [];
        const summary = this.attendanceReportData;
        this.totalAttendanceCount = (summary?.onTime || 0) + (summary?.lateLogin || 0) + (summary?.earlyLogout || 0)
          + (summary?.hoursDeficit || 0) + (summary?.breakExceeded || 0) + (summary?.permission || 0);
        const values = [
          summary?.onTime || 0,
          summary?.lateLogin || 0,
          summary?.earlyLogout || 0,
          summary?.hoursDeficit || 0,
          summary?.breakExceeded || 0,
          summary?.permission || 0
        ];
        const total = values.reduce((a, b) => a + b, 0);
        this.hasAttendanceReportData = total > 0;
        this.attendanceChartData = {
          labels: ['On Time', 'Late Login', 'Early Logout', 'Hours Deficit', 'Break Exceeded Hours', 'Permissions'],
          datasets: [
            {
              data: values,
              backgroundColor: [
                '#10B981',
                '#F59E0B',
                '#EF4444',
                '#6366F1',
                '#06B6D4',
                '#8B5CF6'
              ]
            }
          ]
        };
        this.attendanceChartOptions = {
          responsive: true,
          cutout: "70%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
        };
        this.attendanceReportLoader = false;
      },
      error: () => {
        this.attendanceReportData = null;
        this.attendanceEmployeesList = [];
        this.hasAttendanceReportData = false;
        this.attendanceReportLoader = false;
      }
    });
  }

  getAttendanceEmployees(type: string) {
    return this.attendanceEmployeesList.filter((emp: any) => {
      switch (type) {
        case 'onTime': return emp.isOnTime;
        case 'lateLogin': return emp.isLateLogin;
        case 'earlyLogout': return emp.isEarlyLogout;
        case 'hoursDeficit': return emp.isHoursDeficit;
        case 'breakExceeded': return emp.isBreakHrsExceeded;
        case 'permission': return emp.hasPermission;
        default: return false;
      }
    });
  }

  openAttendanceOffcanvas(content: any, type: string, label: string, count: number) {
    if (count === 0) return;
    this.searchEmployeeText = '';
    this.attendanceOffcanvasTitle = label;
    this.attendanceOffcanvasType = type;
    this.processedOffcanvasEmployees = this.getAttendanceEmployees(type).map((emp: any) => ({
      ...emp,
      profilePicUrl: this.getImageUrl(emp.profilePic)
    }));
    this.offcanvasService.open(this.attendanceOffcanvasTemplate, { position: 'end', backdrop: 'static', keyboard: false });
  }

  onAttendanceReportDateChange(value: Date) {
    this.attendanceReportLoader = true;
    this.attendanceReportDate = value || new Date();
    this.getAttendanceReportData();
  }

  getApprovalsOverview() {
    if (!this.empinfo?.employeeId) {
      this.approvalsOverviewLoader = false;
      return;
    }
    this.approvalsOverviewLoader = true;
    const employeeId = parseInt(this.empinfo?.employeeId);
    this.http.getAllPendingApprovalsCount(undefined, employeeId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any[]) => {        
        const leaveCount = this.getCountByModuleId(data, environment.leavesModuleId);
        const wfhCount = this.getCountByModuleId(data, environment.wfhModuleId);
        const remoteCount = this.getCountByModuleId(data, environment.remoteLoginModuleId);
        const compOffCount = this.getCountByModuleId(data, environment.compoffModuleId);
        const permissionCount = this.getCountByModuleId(data, environment.permissionsModuleId);
        const regularizationCount = this.getCountByModuleId(data, environment.attendanceRegularizationModuleId);
        const extraHoursCount = this.getCountByModuleId(data, environment.extraHoursModuleId);
        const probationCount = this.getCountByModuleId(data, environment.ProbationrequestmoduleId);
        const separationCount = this.getCountByModuleId(data, environment.SeparationrequestmoduleId);
        const expensesCount = this.getCountByModuleId(data, environment.expensesModuleId);
        const timesheetCount = this.getCountByModuleId(data, environment.timesheetModuleId);
        const globalCount = this.getCountByModuleId(data, 0);
        const employeeInfoCount = this.getCountByModuleId(data, 32);
        
        this.approvalsList = [
          { name: 'Leaves', count: leaveCount, color: '#8A2BE2', route: '/pending-approvals/time-off/leaves' },
          { name: 'WFH', count: wfhCount, color: '#FF1493', route: '/pending-approvals/time-off/wfh' },
          { name: 'Remote Login', count: remoteCount, color: '#1E90FF', route: '/pending-approvals/time-off/remote' },
          { name: 'Comp-Off', count: compOffCount, color: '#06B6D4', route: '/pending-approvals/time-off/comp-off' },
          { name: 'Permissions', count: permissionCount, color: '#10B981', route: '/pending-approvals/time-off/permissions' },
          { name: 'Regularization', count: regularizationCount, color: '#F59E0B', route: '/pending-approvals/time-off/regularization-request' },
          { name: 'Extra Hours', count: extraHoursCount, color: '#EF4444', route: '/pending-approvals/time-off/extra-hours-request' },
          { name: 'Probation', count: probationCount, color: '#6366F1', route: '/pending-approvals/on-boarding/probation-request' },
          { name: 'Separation', count: separationCount, color: '#EC4899', route: '/pending-approvals/off-boarding/separation-request' },
          { name: 'Expenses', count: expensesCount, color: '#14B8A6', route: '/pending-approvals/claimsandexpenses-request' },
          { name: 'Timesheets', count: timesheetCount, color: '#F97316', route: '/pending-approvals/time-sheets' },
          { name: 'Global Permissions', count: globalCount, color: '#A855F7', route: '/on-behalf-of/global/permissions' },
          { name: 'Employee Info', count: employeeInfoCount, color: '#3B82F6', route: '/pending-approvals/employeeinfo-request' }
        ];
        this.approvalsOverviewLoader = false;
      },
      error: (err) => {
        console.error('Error fetching approvals:', err);
        this.approvalsList = [];
        this.approvalsOverviewLoader = false;
      }
    });
  }

  getCountByModuleId(data: any[], moduleId: number): number {
    const item = data.find(d => d.moduleId === moduleId);
    return item?.totalCount || 0;
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}