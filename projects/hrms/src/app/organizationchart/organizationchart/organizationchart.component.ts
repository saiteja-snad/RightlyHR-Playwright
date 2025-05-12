import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Select } from 'primeng/select';
import { RbacService } from '../../services/rbac.service';
import { HttpService } from '../../services/http.service';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import { TreeNode } from 'primeng/api'
import { OrganizationChartModule } from 'primeng/organizationchart';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { FormsModule } from '@angular/forms';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { DomSanitizer } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-organizationchart',
  imports: [CommonModule, Select, FormsModule, OrganizationChartModule, DateformatPipe, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './organizationchart.component.html',
  styleUrl: './organizationchart.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class OrganizationchartComponent implements OnInit, OnDestroy {
  data: TreeNode[] = [];
  subscription!: Subscription;
  activeEmplist = [] as any;
  selectedEmployeeId: number | null = null;
  employeedata: any;
  compensationyesorno = false;
  compensationOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];
  dataload = false;
  isDataPresent = false;

  ngOnInit(): void {
    this.employeedata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllEmployeeDetails()
    this.getAllEmployeeDetailsformanger();
    if (this.selectedEmployeeId === null) {
      this.getOrghierarchy(this.employeedata.employeeId)
    }
  }

  constructor(private http: HttpService, private sanitizer: DomSanitizer, public rbac: RbacService) { }

  // function to get the data of employees by hierarchy
  getAllEmployeeDetails() {
    const satus = ['Active', 'Trainee Active'];
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${satus}`)
      .subscribe({
        next: (res: any) => {
          this.activeEmplist = res.map((employee: any) => ({
            label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''} `,
            value: employee.employeeId
          }));
        },
      });
  }

  mangeractiveEmplist = [] as any;
  getAllEmployeeDetailsformanger() {
    const EmployeeId = this.employeedata.employeeId;
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (res: any) => {
          // console.log(response);
          this.mangeractiveEmplist = res.map((employee: any) => {
            return {
              ...employee,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
                }${employee.lastName}`,
              employeeid: employee.employeeId
            };
          });
        },
      });
  }

  onEmployeeChange(event: any) {
    this.selectedEmployeeId = event.value.value;
    this.getOrghierarchy(this.selectedEmployeeId)
  }




  downloadChart(format: 'pdf' | 'jpg'): void {
    const chartElement = document.querySelector('.organization-chart-container');
  
    if (!chartElement) {
      console.error('Chart element not found!');
      return;
    }
  
    const originalWidth = chartElement.scrollWidth;
    const originalHeight = chartElement.scrollHeight;
    const originalStyle = chartElement.getAttribute('style');
  
    chartElement.setAttribute(
      'style',
      `width: ${originalWidth}px; height: ${originalHeight}px; overflow: visible;`
    );
   
    html2canvas(chartElement as HTMLElement, {
      width: originalWidth,
      height: originalHeight,
      scale: 2,
      useCORS: true,
    })
      .then((canvas) => {
        const imageData = canvas.toDataURL('image/png');
  
        if (format === 'pdf') {
          const pdf = new jsPDF('l', 'mm', 'a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
  
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const scaleFactor = Math.min(pageWidth / canvasWidth, pageHeight / canvasHeight);
  
          const imgWidth = canvasWidth * scaleFactor;
          const imgHeight = canvasHeight * scaleFactor;
          const xOffset = (pageWidth - imgWidth) / 2;
          const yOffset = (pageHeight - imgHeight) / 2;
  
          pdf.addImage(imageData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
          pdf.save('organization-chart.pdf');
        } else if (format === 'jpg') {
          // Center the chart on a white canvas before saving
          const padding = 50;
          const newCanvas = document.createElement('canvas');
          newCanvas.width = canvas.width + padding * 2;
          newCanvas.height = canvas.height + padding * 2;
  
          const ctx = newCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'white'; // Optional background
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
            ctx.drawImage(canvas, padding, padding);
  
            const centeredImage = newCanvas.toDataURL('image/jpeg', 1.0);
            const link = document.createElement('a');
            link.href = centeredImage;
            link.download = 'organization-chart.jpg';
            link.click();
          }
        }
      })
      .catch((error: any) => {
        console.error('Error capturing chart:', error);
      })
      .finally(() => {
        if (originalStyle) {
          chartElement.setAttribute('style', originalStyle);
        } else {
          chartElement.removeAttribute('style');
        }
      });
  }
  

  getOrghierarchy(employeeId?: any) {
    this.dataload = true;
    if (!employeeId) {
      employeeId = this.employeedata.employeeId;
    }
    this.subscription = this.http.getData(`Employeedata/getOrganizationalhierarchybyid/${employeeId}`).subscribe({
      next: (response: any) => {

        if (response.length > 0) {
          this.dataload=false
          this.data = response || [];
          this.isDataPresent = false;
        } else {
          this.data = []
          this.isDataPresent = true;
        }
      }, error: (error: any) => {
        this.dataload=false
        console.log(error);
      }, complete: () => {
        this.dataload = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}