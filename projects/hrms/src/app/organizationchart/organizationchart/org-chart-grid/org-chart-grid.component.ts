import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import { OrgChart } from 'd3-org-chart'; // specific D3 modules if building from scratch
import { OrgchartService } from './../../../services/orgchartservices/orgchart.service';
import { environment } from '../../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfileIconComponent } from "../../../icons/profile-icon/profile-icon.component";

import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { OpenModalService } from '../../../services/open-modal.service';
import { ChatIconComponent } from "../../../icons/chat-icon/chat-icon.component";
import { MailIconComponent } from "../../../icons/mail-icon/mail-icon.component";
import { FormatcontactnumberPipe } from '../../../Pipes/formatcontactnumber.pipe';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-org-chart-grid',
  imports: [CommonModule, ProfileIconComponent, FormatcontactnumberPipe, ChatIconComponent, MailIconComponent,TranslateModule],
  templateUrl: './org-chart-grid.component.html',
  styleUrl: './org-chart-grid.component.scss'
})

export class OrgChartGridComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartContainer', { static: true }) private chartContainer!: ElementRef;
  @ViewChild('employeeDetailModal', { static: true }) employeeDetailModal: any;
  @Input() data: any[] = []; // Input for your organization data
  private chart: any;
  private boundHandleClick!: (event: Event) => void;
  // Swap feature
  layoutIndex = 0;
  linkedinurl: any;
  layouts = ['right', 'bottom', 'left', 'top'];
  compactFlag = false;
  showCompensation = false;
  selectedEmployeeDetails: any = null;
  subscription!: Subscription;
  imageUrl: any;
  empdata = {} as any;
  jobRole: any;
  profilePic: any;
  jobdata: any;
  reportesto = [] as any;
  shift!: string;
  department!: string;
  Reportingmanager!: any;

  constructor(private OrgchartService: OrgchartService, private modalService: NgbModal, private http: HttpService,
    private sanitizer: DomSanitizer, private confirmation: OpenModalService,) { }

  ngOnInit(): void {
    this.OrgchartService.actions$.subscribe(({ type }) => {
      switch (type) {
        case 'swapLayout': this.swapLayout(); break;
        case 'toggleCompact': this.compact(); break;
        case 'exportImg': this.exportImg(); break;
        case 'exportFullImg': this.exportFullImg(); break;
        case 'exportSvg': this.exportSvg(); break;
        case 'expandAll': this.expandAll(); break;
        case 'collapseAll': this.collapseAll(); break;
        case 'downloadPdf': this.downloadPdf(); break;
      }
    });
    // Subscribe to compensation amount changes
    this.OrgchartService.compensationAmount$.subscribe(isCompensated => {
      this.showCompensation = isCompensated;
      this.initChart();
    });
    this.boundHandleClick = this.handleEmployeeClick.bind(this);
    window.addEventListener('orgChartEmployeeClick', this.boundHandleClick);
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private updateChart() {
    if (this.chart) {
      this.chart.data(this.data).render();
    } else {
      this.initChart();
    }
  }

  handleEmployeeClick(event: any) {
    this.selectedEmployeeDetails = event.detail;
    this.openModal(this.employeeDetailModal)
    this.getJobDetails();
    this.getEmployeeId();
  }

  getEmployeeId() {
    let employeeId = this.selectedEmployeeDetails.id;
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empdata = data;
        this.imageUrl = this.empdata.profileUrl;
        this.linkedinurl = this.empdata.linkedinUrl;
        this.onSelectprofilePicDownload(this.empdata);
      },
      error: (reason: any) => {
        console.error(reason);
      },
    });
  }

  onSelectprofilePicDownload(employee: any) {
    if (employee.profileUrl) {
      this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', employee.profileUrl).subscribe({
        next: (res: any) => {
          let blob = new Blob([res['body']], { type: 'image/png' });
          let objectURL = URL.createObjectURL(blob);
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        },
        error: (reason) => {
          //console.log(reason),
        }
      });
    }
  }

  getJobDetails() {
    let EmployeeId = this.selectedEmployeeDetails.id;
    this.subscription = this.http.getData(`JobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        let jobdetails = data;
        this.jobdata = jobdetails[0];
        this.jobRole = jobdetails[0]?.jobRole;
        this.shift = jobdetails[0]?.shiftName;
        this.department = jobdetails[0]?.departmentName;
        this.reportesto.fistname = jobdetails[0]?.firstName
        this.reportesto.middlename = jobdetails[0]?.middleName
        this.reportesto.lastname = jobdetails[0]?.lastName
        this.reportesto.middleName = jobdetails[0]?.middleName
        if (jobdetails[0]?.mName && jobdetails[0]?.fName && jobdetails[0]?.lName) {
          this.Reportingmanager = `${jobdetails[0]?.fName} ${jobdetails[0]?.mName} ${jobdetails[0]?.lName}`
        }
        else if (jobdetails[0]?.lName) {
          this.Reportingmanager = `${jobdetails[0]?.fName}  ${jobdetails[0]?.lName}`
        }
        else if (jobdetails[0]?.fName) {
          this.Reportingmanager = `${jobdetails[0]?.fName}  ${jobdetails[0]?.mName}`
        }
      },
      error: (reason: any) => {
        console.error(reason);
      }
    })
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
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

  initChart() {
    if (!this.data?.length) return;
    const tree = this.data; // 👈 extract single tree
    if (!this.chart) {
      const bodyStyles = getComputedStyle(document.body);
      const cardBorderColor = bodyStyles.getPropertyValue('--input-border-color').trim();
      const cardBgColor = bodyStyles.getPropertyValue('--body-bg-color').trim();
      const primarytextColor = bodyStyles.getPropertyValue('--primary-color').trim();
      this.chart = new OrgChart().container(this.chartContainer.nativeElement).data(tree)
        .nodeWidth(() => 300).nodeHeight(() => 110).nodeContent(({ data }: { data: any }) => {
          const imageUrl = this.getImageUrl(data.image);
          const safeData = encodeURIComponent(JSON.stringify(data));
          return `
          <div style="border: 1px solid ${cardBorderColor};border-radius: 0.5rem; background: ${cardBgColor};font-size: 12px;width: 100%;height: 110px;align-items:center;display:flex;padding:12px 16px;">
            <div style="display:flex;gap:1rem;align-items:center;">
              <div>${imageUrl ? `<img src="${imageUrl}" style="width: 4rem;height: 4rem;border-radius: 50%;object-fit: cover;" />` :
              `<svg width="64" height="64" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12.5118 24.4655C19.1242 24.4655 24.4845 19.1051 24.4845 12.4927C24.4845 5.88037 19.1242 0.519989 12.5118 0.519989C5.89944 0.519989 0.539062 5.88037 0.539062 12.4927C0.539062 19.1051 5.89944 24.4655 12.5118 24.4655Z"
                    style="fill: ${primarytextColor}" />
                <path
                    d="M16.3064 8.01786C16.3062 8.76825 16.0835 9.50173 15.6665 10.1256C15.2494 10.7494 14.6568 11.2356 13.9635 11.5226C13.2701 11.8096 12.5073 11.8846 11.7713 11.7381C11.0354 11.5916 10.3594 11.2301 9.82888 10.6995C9.29834 10.1688 8.93707 9.49272 8.79075 8.75673C8.64443 8.02075 8.71962 7.2579 9.00683 6.56465C9.29404 5.8714 9.78035 5.27888 10.4043 4.862C11.0282 4.44513 11.7618 4.22263 12.5122 4.22263C13.0105 4.22263 13.504 4.3208 13.9644 4.51154C14.4248 4.70228 14.8431 4.98185 15.1955 5.33428C15.5478 5.68672 15.8273 6.10511 16.0179 6.56556C16.2085 7.02602 16.3065 7.51951 16.3064 8.01786ZM12.5122 12.9368C11.4378 12.9354 10.3749 13.1579 9.39134 13.5902C8.40776 14.0225 7.52507 14.655 6.79956 15.4474C5.51909 16.8424 5.83261 19.0619 7.44485 20.0553C8.96932 20.9913 10.7233 21.4868 12.5122 21.4868C14.3011 21.4868 16.055 20.9913 17.5795 20.0553C19.1917 19.0619 19.505 16.8424 18.2248 15.4474C17.4993 14.655 16.6166 14.0225 15.633 13.5902C14.6494 13.1579 13.5865 12.9354 12.5122 12.9368Z"
                    fill="#FBFBFB" />
                <defs>
                    <linearGradient id="paint0_linear_9871_40771" x1="-19.3472" y1="12.0869" x2="24.8549" y2="12.0869" gradientUnits="userSpaceOnUse">
                        <stop stop-color="white" />
                        <stop offset="1" stop-color="#0B3A83" />
                    </linearGradient>
                </defs>
              </svg>`
            }
              </div>
            <div>
         <div  data-employee='${safeData}'
         onclick="window.dispatchEvent(new CustomEvent('orgChartEmployeeClick', { detail: JSON.parse(decodeURIComponent(this.getAttribute('data-employee'))) }))"
         style="font-weight: 600;color: #3C3C3C;line-break: anywhere;text-wrap: wrap;text-transform:capitalize;cursor:pointer;margin-bottom:6px;">
           <u>${data.name || ''}</u>
          </div>
               <div style="font-weight: 400;color: #909090;margin-bottom:6px;font-size: 10px;">${data.title || ''}</div>
               <div style="font-weight: 400;color: #909090;text-wrap:nowrap;margin-bottom:6px;font-size: 10px;">DOJ: ${this.formatDate(data.doj) || ''}</div>
              <div style="font-weight: 600;color: ${primarytextColor};text-transform:capitalize;">${data.department || ''}
            </div>
        </div>
    </div>
</div>`;
        })
        .render();
    } else {
      this.chart.data(tree).render();
    }
  }

  // feature functions
  compact() {
    this.compactFlag = !this.compactFlag;
    this.chart.compact(this.compactFlag).render().fit();
  }

  swapLayout() {
    const layout = this.layouts[this.layoutIndex++ % this.layouts.length];
    this.chart.layout(layout).render().fit();
  }

  exportImg() {
    this.chart.exportImg();
  }

  exportFullImg() {
    this.chart.exportImg({ full: true });
  }

  exportSvg() {
    this.chart.exportSvg();
  }

  expandAll() {
    this.chart.expandAll().render().fit();
  }

  collapseAll() {
    this.chart.collapseAll().render().fit();
  }

  downloadPdf() {
    this.chart.exportImg({
      save: false,
      onLoad: (base64: string) => {  // explicitly type it
        const pdf = new jsPDF();
        const img = new Image();
        img.src = base64;
        img.onload = () => {
          const imgWidth = 180; // adjust as you need
          const imgHeight = (img.height / img.width) * imgWidth;
          pdf.addImage(img, 'JPEG', 10, 10, imgWidth, imgHeight);
          pdf.save('chart.pdf');
        };
      },
    });
  }

  shareVia(platform: string): void {
    let shareUrl = '';
    switch (platform) {
      case 'outlook':
        if (!this.empdata?.workEmail) {
          this.confirmation.openErrorModal('Work email is not available');
          return;
        }
        const userEmail = this.empdata?.workEmail || '';
        const emailLower = userEmail.toLowerCase();
        if (emailLower.includes('@gmail.com')) {
          // Gmail user
          shareUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(userEmail)}`;
        } else {
          // Outlook / company email (default)
          shareUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(userEmail)}`;
        }
        break;

      case 'teams':
        if (!this.empdata?.workEmail) {
          this.confirmation.openErrorModal('Work email is not available');
          return;
        }
        shareUrl = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(this.empdata?.workEmail)}`;
        break;

      case 'linkedin':
        const empName = this.linkedinurl;
        if (empName) {
          shareUrl = `${empName}`;
        } else {
          console.error('Employee name not available for LinkedIn search.');
          return;
        }
        break;

      default:
        console.error('Unsupported platform:', platform);
        return;
    }
    window.open(shareUrl, '_blank');
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy?.();
    }
    if (this.boundHandleClick) {
      window.removeEventListener('orgChartEmployeeClick', this.boundHandleClick);
    }
  }
}
