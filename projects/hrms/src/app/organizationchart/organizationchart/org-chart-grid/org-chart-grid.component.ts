import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import { OrgChart } from 'd3-org-chart'; // specific D3 modules if building from scratch
import { OrgchartService } from './../../../services/orgchartservices/orgchart.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-org-chart-grid',
  imports: [CommonModule],
  templateUrl: './org-chart-grid.component.html',
  styleUrl: './org-chart-grid.component.scss'
})

export class OrgChartGridComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartContainer', { static: true }) private chartContainer!: ElementRef;
  @Input() data: any[] = []; // Input for your organization data
  private chart: any;
  // Swap feature
  layoutIndex = 0;
  layouts = ['right', 'bottom', 'left', 'top'];
  compactFlag = false;
  showCompensation = false;

  constructor(private OrgchartService: OrgchartService) { }

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

  private getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/images/alternate.png';
    }
    if (imagePath.startsWith('http')) {
      return imagePath; // Already full URL
    }
    // Handle Azure Blob Storage paths
    if (imagePath.startsWith('Profilepics/')) {
      return `${environment.viewUrl}${imagePath}`;
    }


    // Default case - assume it's from your API
    return `${environment.ApiUrl}EmployeeData/DownloadProfilePic?filename=${imagePath}`;
  }

  initChart() {
    if (!this.data?.length) return;
    const tree = this.data; // 👈 extract single tree
    if (!this.chart) {
      this.chart = new OrgChart().container(this.chartContainer.nativeElement).data(tree)
        .nodeWidth(() => 300).nodeHeight(() => 110).nodeContent(({ data }: { data: any }) => {
          const imageUrl = this.getImageUrl(data.image);
          const showComp = this.showCompensation
          console.log(showComp, 'showCompensation');
          return `
          <div style="border: 1px solid #D3DFF2;border-radius: 0.5rem; background:#ECF1F5;font-size: 12px;width: 100%;height: 100%;align-items:center;display:flex;">
            <div style="display:flex;gap:1rem;align-items:center;padding:0.75rem;">
            <div>
              <img src="${imageUrl || '/images/alternate.png'}"  onerror="this.onerror=null;this.src='/images/alternate.png'"
               style="width: 4rem;height: 4rem;border-radius: 50%;object-fit: cover;"/>
            </div>
            <div>
            <div style="font-weight: 600;color: #3C3C3C;line-break: anywhere;text-wrap: wrap;margin-bottom:0.25rem;text-transform:capitalize;">${data.name || '-'}</div>
            <div style="font-weight: 400;color: #909090;margin-bottom:0.25rem;font-size: 10px;">${data.title || ''}</div>
            <div style="font-weight: 400;color: #909090;text-wrap:nowrap;margin-bottom:0.25rem;font-size: 10px;">DOJ:${this.formatDate(data.doj) || ''}</div>
           ${showComp ? `
              <div style="font-weight: 400;color: #909090;text-wrap:nowrap;margin-bottom:0.25rem;font-size: 10px;">
                Compensation: ${data.Compensation || 0}
              </div>` : ''}
            <div style="font-weight: 600;color: #0B3A83;text-transform:capitalize;">${data.department || ''}</div>
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

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy?.();
    }
  }
}