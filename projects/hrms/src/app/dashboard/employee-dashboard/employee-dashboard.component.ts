import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgbPopoverModule, NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { AccordionModule } from 'primeng/accordion';
import { Calendar } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { DatePicker } from 'primeng/datepicker';
import { Skeleton } from 'primeng/skeleton';
import { TabList, TabsModule } from 'primeng/tabs';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IdayLogs } from '../../Attendance/attendance-view/attendance-modal';
import { DashAttIconComponent } from '../../icons/dash-att-icon/dash-att-icon.component';
import { FingerPrintIconComponent } from '../../icons/finger-print-icon/finger-print-icon.component';
import { LeaveIconComponent } from '../../icons/leave-icon/leave-icon.component';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { ProfileIconComponent } from '../../icons/profile-icon/profile-icon.component';
import { WfhIconComponent } from '../../icons/wfh-icon/wfh-icon.component';
import { AttendanceResponse, Permission } from '../../Interfaces/dashboard.modal';
import { Ipersonal } from '../../Interfaces/personal-modal';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuOrderService } from '../../services/theme-service/menu-order.service';
import { QuickLinkRouteDef, QUICK_LINK_DEFAULT_ROUTES, resolveQuickLinkRouteDef, resolveQuickLinksFromSourceRoute, resolveQuickLinksSourceDef } from '../../shared/quick-links/quick-links.registry';
@Component({
  selector: 'app-employee-dashboard',
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, NgbPopoverModule, ModuleInfoIconComponent,
    ChartModule, DateformatPipe, Skeleton, AccordionModule, DashAttIconComponent, FingerPrintIconComponent, LeaveIconComponent,
    WfhIconComponent, ProfileIconComponent, NoDataFoundComponent, DatePicker, TabList, Calendar, TabsModule, DragDropModule, ScrollingModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class EmployeeDashboardComponent implements AfterViewInit {
  greetingMessage = '';
  employeedata: any;
  currentTime: Date = new Date();
  loading = false;
  avaliabletlyloading = false;
  showAvailabilityMessage = false;
  weaklyloghrsloader = false;
  subscription: any;
  private intervalId: any;
  empinfo = {} as Ipersonal;
  destroy$: Subject<boolean> = new Subject<boolean>();
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
  Weeklyworklogsinfo = 'Shows a weekly summary of the hours that are logged, making it easy to track their work and productivity.';
  TodaysTimeEntryinfo = 'Provides an overview of today’s time entry, showing logged hours, active work time, and the previous day’s duration.';
  leavesConsumedinfo = 'Provides an overview of consumed leave balances categorized by leave type.';
  attendancoverviewinfo = 'Displays your attendance details for the selected date, including duty status, first in time, last out time, and the previous day’s log duration.'
  // legendList = [
  //   { key: 'inOffice', label: 'In Office', color: '#1E90FF' },
  //   { key: 'halfDay', label: 'Half Day', color: '#FFD700' },
  //   { key: 'wfh', label: 'WFH', color: '#FF1493' },
  //   { key: 'absent', label: 'Absent', color: '#FF0000' },
  //   { key: 'leave', label: 'Leave', color: '#8A2BE2' },
  //   { key: 'remote', label: 'Remote', color: '#EA362C' },
  //   { key: 'weekend', label: 'Weekend', color: '#32CD32' },
  //   { key: 'holiday', label: 'Holiday', color: '#FFA500' },
  //   { key: 'yetToLogin', label: 'Yet To Login', color: '#94A3B8' },
  // ];
  legendList = [
  { key: 'yetToLogin', label: 'Yet To Login', color: '#94A3B8' },
    { key: 'inOffice', label: 'In Office', color: '#1E90FF' },
    { key: 'absent', label: 'Absent', color: '#FF0000' },
    { key: 'halfDay', label: 'Half Day', color: '#FFD700' },
    { key: 'wfh', label: 'WFH', color: '#FF1493' },
    { key: 'remote', label: 'Remote', color: '#EA362C' },
    { key: 'leave', label: 'Leave', color: '#8A2BE2' },
    { key: 'weekend', label: 'Weekend', color: '#32CD32' },
    { key: 'holiday', label: 'Holiday', color: '#FFA500' },
  ];
  weeklyWorkLogs: any[] = [];
  todayDurationLabel: string = "00:00:00";
  previousDurationLabel: string = "00:00:00";
  todayDurationPercent: number = 0;
  offCanvasData: any;
  OffCanvasemployeeList: any;
  ChartDataLabels = ChartDataLabels;
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
  active = 'Active';
  activeCount: number = 0;
  activeEmplist = [] as any;
  getEmployeeInfo = [] as any;
  todayMaxdate!: Date
  regularization_list: Permission[] = [];
  attendanceselectedDate!: Date;
  previousMonthStartDate: any;
  employeeOverviewInfo = 'Displays the organization’s employee count by current status, including Active, Probation, Active Trainees, Prospective, and Prospective Trainees.';
  punchPairs = [] as IdayLogs[];
  logsDuration!: string;
  breakDuration!: string
  permissions_list: Permission[] = [];
  isScreenLessThan1600 = window.innerWidth < 1600;

  quickMenuItems = [
  {
    label: 'My Info',
    link: '/myinfo/personal/basic-info',
    icon: '/dashboard-icon/personal-information.png',
  },
  {
    label: 'Holidays',
    link: '/holidays/public-holidays',
    icon: '/main-menu-icons/holiday-icon.png',
  },
  {
    label: 'Leaves',
    link: '/time-off/leaves/waiting-for-approval',
    icon: '/time-off-icon/leaves-icon.png',
  },
  {
    label: 'Permissions',
    link: '/time-off/premissions/waiting-for-approval',
    icon: '/time-off-icon/permissions-icon.png',
  },
  {
    label: 'Policies',
    link: '/policies/companypolicies',
    icon: '/main-menu-icons/policies-icon.png',
  },
  {
    label: 'Calendar',
    link: '/calendar-view',
    icon: '/dashboard-icon/calendar.png',
  },
    {
    label: 'Timesheets',
    link: '/project-management/timesheet',
    icon: '/main-menu-icons/project-management-timesheet.png',
  },
    {
    label: 'Expenses',
    link: '/claimsandexpenses/expenses',
    icon: '/main-menu-icons/expenses-icon.png',
  },
    {
    label: 'Personalization',
    link: '/theme/selection',
    icon: '/main-menu-icons/themes-color-icon.png',
  },
];

quickLinks: QuickLinkRouteDef[] = [];
  readonly defaultQuickLinkRoutes = new Set(QUICK_LINK_DEFAULT_ROUTES);
  selectedQuickLinkRoutes = new Set<string>();
  readonly quickLinksDropListId = 'dashboard-quick-links';
  readonly quickLinksConnectedDropListIds = ['sidenav-main-drop', 'sidenav-ellipses-drop'];

quickLinksInfo =
  'Provides quick access to commonly used pages and actions across the portal.';

  @ViewChild('quickLinksScroll', { static: false })
  private quickLinksScroll?: ElementRef<HTMLElement>;

  quickLinksCanScrollLeft = false;
  quickLinksCanScrollRight = false;

  get showQuickLinksLeftArrow(): boolean {
    return this.quickLinks.length > 9 && this.quickLinksCanScrollLeft;
  }

  get showQuickLinksRightArrow(): boolean {
    return this.quickLinks.length > 9 && this.quickLinksCanScrollRight;
  }

  constructor(
    private http: HttpService,
    private router: Router,
    public modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    public rbac: RbacService,
    private accessNav: AccessNavigationService,
    private menuOrderService: MenuOrderService
  ) { }
  ngOnInit(): void {
    this.intialLoading = true;
    this.setIconBasedOnTime();
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
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
    this.initQuickLinks();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateQuickLinksScrollState());
  }

  private async initQuickLinks(): Promise<void> {
    await this.menuOrderService.ensureLoaded();
    const savedRoutes = this.menuOrderService.getQuickLinksRoutes();
    const routes = savedRoutes.length > 0 ? this.resolveInitialQuickLinkRoutes(savedRoutes) : QUICK_LINK_DEFAULT_ROUTES;
    this.quickLinks = this.hydrateQuickLinks(routes);
    this.selectedQuickLinkRoutes.clear();
    setTimeout(() => this.updateQuickLinksScrollState());
  }

  private resolveInitialQuickLinkRoutes(savedRoutes: string[]): string[] {
    const legacyDefaults = QUICK_LINK_DEFAULT_ROUTES.slice(0, 6);
    const legacySet = new Set(legacyDefaults);
    const savedSet = new Set(savedRoutes);

    const isLegacyDefault =
      savedRoutes.length === legacyDefaults.length &&
      legacyDefaults.every((route) => savedSet.has(route)) &&
      savedRoutes.every((route) => legacySet.has(route));

    if (!isLegacyDefault) return savedRoutes;

    const merged = [...savedRoutes];
    QUICK_LINK_DEFAULT_ROUTES.forEach((route) => {
      if (!savedSet.has(route)) merged.push(route);
    });
    return merged;
  }

  private hydrateQuickLinks(routes: string[]): QuickLinkRouteDef[] {
    const ordered: QuickLinkRouteDef[] = [];
    const placed = new Set<string>();

    routes.forEach((route) => {
      const normalizedRoute = this.resolveDefaultQuickLinkRoute(route);
      const def = resolveQuickLinkRouteDef(normalizedRoute);
      if (!def) return;
      if (!this.canAccessQuickLink(def)) return;
      if (placed.has(def.route)) return;
      ordered.push(def);
      placed.add(def.route);
    });

    return ordered;
  }

  onQuickLinksDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.quickLinks, event.previousIndex, event.currentIndex);
      this.saveQuickLinks();
      setTimeout(() => this.updateQuickLinksScrollState());
      return;
    }

    const dragged = event.item?.data ?? event.previousContainer.data?.[event.previousIndex];
    const next = this.buildQuickLinksFromDraggedItem(dragged);
    if (next.length === 0) return;

    const existing = new Set(this.quickLinks.map((q) => q.route));
    const toAdd = next.filter((q) => !existing.has(q.route));
    if (toAdd.length === 0) return;

    const insertIndex = Math.min(Math.max(event.currentIndex, 0), this.quickLinks.length);
    this.quickLinks.splice(insertIndex, 0, ...toAdd);
    this.saveQuickLinks();
    setTimeout(() => this.updateQuickLinksScrollState());
  }

  get selectedQuickLinksCount(): number {
    return this.selectedQuickLinkRoutes.size;
  }

  get hasRemovableQuickLinks(): boolean {
    return this.quickLinks.some((item) => this.isQuickLinkRemovable(item.route));
  }

  isQuickLinkRemovable(route: string): boolean {
    return !this.defaultQuickLinkRoutes.has(route);
  }

  isQuickLinkSelected(route: string): boolean {
    return this.selectedQuickLinkRoutes.has(route);
  }

  toggleQuickLinkSelection(route: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isQuickLinkRemovable(route)) return;

    if (this.selectedQuickLinkRoutes.has(route)) this.selectedQuickLinkRoutes.delete(route);
    else this.selectedQuickLinkRoutes.add(route);
  }

  openQuickLink(route: string, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const actualRoute = this.accessNav.navigateToAccessedRoute(route) || route;
    this.router.navigateByUrl(actualRoute);
  }

  isPendingApprovalsQuickLink(item: QuickLinkRouteDef): boolean {
    return item.parentRoute === '/pending-approvals' && item.label.startsWith('PA-');
  }

  getPendingApprovalsQuickLinkSuffix(label: string): string {
    return label.startsWith('PA-') ? label.slice(3) : label;
  }

  removeSelectedQuickLinks(): void {
    if (this.selectedQuickLinkRoutes.size === 0) return;
    this.quickLinks = this.quickLinks.filter((item) => !this.selectedQuickLinkRoutes.has(item.route));
    this.selectedQuickLinkRoutes.clear();
    this.saveQuickLinks();
    setTimeout(() => this.updateQuickLinksScrollState());
  }

  private buildQuickLinksFromDraggedItem(dragged: any): QuickLinkRouteDef[] {
    const draggedRoute = typeof dragged?.route === 'string' ? dragged.route : '';
    if (!draggedRoute) return [];

    const expandedRoutes = resolveQuickLinksFromSourceRoute(draggedRoute, {
      allowWFH: !!(this.empinfo as any)?.allowWFH,
      allowRemoteLogin: !!(this.empinfo as any)?.allowRemoteLogin
    });
    const routesToResolve = expandedRoutes.length > 0 ? expandedRoutes : [this.resolveDefaultQuickLinkRoute(draggedRoute)];

    return routesToResolve
      .map((route) => resolveQuickLinkRouteDef(route))
      .filter((def): def is QuickLinkRouteDef => !!def)
      .filter((def) => this.canAccessQuickLink(def));
  }

  private canAccessQuickLink(def: QuickLinkRouteDef): boolean {
    if (!this.rbac.allowedToAccess(`${def.permission.feature}.${def.permission.action}`)) return false;
    if (!def.parentRoute) return true;

    const parent = resolveQuickLinksSourceDef(def.parentRoute);
    if (!parent?.permission) return true;

    return this.rbac.allowedToAccess(`${parent.permission.feature}.${parent.permission.action}`);
  }

  private resolveDefaultQuickLinkRoute(moduleRoute: string): string {
    if (moduleRoute === '/myinfo') return '/myinfo/personal/basic-info';
    if (moduleRoute === '/holidays') return '/holidays/public-holidays';
    if (moduleRoute === '/skill-management') return '/skill-management/dashboard';
    if (moduleRoute === '/policies') return '/policies/companypolicies';
    if (moduleRoute === '/events') return '/events/upcoming';
    if (moduleRoute === '/claimsandexpenses') return '/claimsandexpenses/expenses';
    if (moduleRoute === '/theme') return '/theme/selection';
    if (moduleRoute === '/assets-management') return '/assets-management/available-assets';
    if (moduleRoute === '/card-management') return '/card-management/details';
    if (moduleRoute === '/desk') return '/desk/management/available-desks';
    if (moduleRoute === '/calendar-view') return '/calendar-view';
    return moduleRoute;
  }

  removeQuickLink(route: string): void {
    const idx = this.quickLinks.findIndex((q) => q.route === route);
    if (idx === -1) return;
    this.quickLinks.splice(idx, 1);
    this.saveQuickLinks();
  }

  private saveQuickLinks(): void {
    const employeeId = this.menuOrderService.getCurrentEmployeeId();
    if (!employeeId) return;
    this.menuOrderService.saveQuickLinks(employeeId, this.quickLinks.map((q) => q.route));
  }

  onQuickLinksScroll(): void {
    this.updateQuickLinksScrollState();
  }

  scrollQuickLinks(direction: 'left' | 'right', event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const el = this.quickLinksScroll?.nativeElement;
    if (!el) return;

    const delta = this.getQuickLinksScrollDelta(el) * (direction === 'left' ? -1 : 1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
    setTimeout(() => this.updateQuickLinksScrollState(), 200);
  }

  private getQuickLinksScrollDelta(el: HTMLElement): number {
    const list = el.querySelector('.quick-links-drop-list') as HTMLElement | null;
    const firstItem = el.querySelector('.quick-links-content') as HTMLElement | null;

    const itemWidth = firstItem?.getBoundingClientRect().width ?? 112;
    const listStyle = list ? window.getComputedStyle(list) : null;
    const gapValue = listStyle?.columnGap || listStyle?.gap || '0';
    const gap = Number.parseFloat(gapValue) || 0;

    return Math.max(el.clientWidth * 0.85, itemWidth + gap);
  }

  private updateQuickLinksScrollState(): void {
    const el = this.quickLinksScroll?.nativeElement;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    if (maxScrollLeft <= 0) {
      this.quickLinksCanScrollLeft = false;
      this.quickLinksCanScrollRight = false;
      return;
    }

    this.quickLinksCanScrollLeft = el.scrollLeft > 2;
    this.quickLinksCanScrollRight = el.scrollLeft < maxScrollLeft - 2;
  }

  checkScreenSize() {
    this.isScreenLessThan1600 = window.innerWidth < 1600;
    this.updateQuickLinksScrollState();
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
            photo: this.getImageUrl(emp.profilePic)
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

  getLeaveChipStyle(color: string) {
    if (!color) return {};
    return {
      'border-color': color,
      'color': color,
      'background-color': this.hexToRgba(color, 0.05) // 5% opacity
    };
  }

  getPermissionDurationChips(permissionDuration: string | string[] | null | undefined): string[] {
    if (Array.isArray(permissionDuration)) {
      return permissionDuration
        .map((duration) => duration?.trim())
        .filter((duration): duration is string => !!duration);
    }

    if (typeof permissionDuration !== 'string') return [];

    return permissionDuration
      .split(',')
      .map((duration) => duration.trim())
      .filter((duration) => duration.length > 0);
  }

  hexToRgba(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
