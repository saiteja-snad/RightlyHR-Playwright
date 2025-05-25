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
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-organizationchart',
  imports: [CommonModule, Select, FormsModule, OrganizationChartModule, DateformatPipe,
     NoDataFoundComponent, DataLoaderContentComponent, TranslateModule],
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

  constructor(private http: HttpService, private sanitizer: DomSanitizer, public rbac: RbacService) { }

  ngOnInit(): void {
    this.employeedata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllEmployeeDetails()
    this.getAllEmployeeDetailsformanger();
    if (this.selectedEmployeeId === null) {
      this.getOrghierarchy(this.employeedata.employeeId)
    }
  }

  // function to get the data of employees by hierarchy
  getAllEmployeeDetails() {
    const satus = ['Active', 'Trainee Active'];
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${satus}`).subscribe({
      next: (res: any) => {
        this.activeEmplist = res.map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId
        }));
      },
    });
  }

  mangeractiveEmplist = [] as any;
  getAllEmployeeDetailsformanger() {
    const EmployeeId = this.employeedata.employeeId;
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
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

  // Helper function to flatten the hierarchical data
  // downloadToExcel(): void {
  //   if (!this.data || this.data.length === 0) {
  //       console.error('No data available to export!');
  //       return;
  //   }

  //   const flattenedData: any[] = [];
  //   const seenNames = new Set<string>(); // Track unique names
  //   this.flattenHierarchy(this.data, flattenedData, seenNames);

  //   const worksheet = XLSX.utils.json_to_sheet(flattenedData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Organization Chart');
  //   XLSX.writeFile(workbook, 'organization-chart.xlsx');
  // }

  // private flattenHierarchy(
  //   nodes: TreeNode[],
  //   flattenedData: any[],
  //   seenNames: Set<string>,
  //   parentName: string = ''
  // ): void {
  //   nodes.forEach((node) => {
  //       const { name, doj, title, compensationamount, department,imageUrl } = node.data;
  //       if (!seenNames.has(name)) {
  //           flattenedData.push({
  //               Name: name,
  //               DOJ: doj,
  //               Title: title,
  //               Compensation: compensationamount,
  //               Department: department,
  //               Manager: parentName,
  //               image:imageUrl
  //           });
  //           seenNames.add(name);
  //       }
  //       if (node.children) {
  //           this.flattenHierarchy(node.children, flattenedData, seenNames, name);
  //       }
  //   });
  // }

  async downloadToExcel(): Promise<void> {
    if (!this.data || this.data.length === 0) {
      console.error('No data available to export!');
      return;
    }
    const flattenedData: any[] = [];
    const seenNames = new Set<string>();
    this.flattenHierarchy(this.data, flattenedData, seenNames);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Organization Chart');
    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'DOJ', key: 'doj', width: 15 },
      { header: 'Title', key: 'title', width: 20 },
      { header: 'Compensation', key: 'compensation', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Manager', key: 'manager', width: 20 },
      { header: 'Image', key: 'image', width: 10 },
    ];
    for (let i = 0; i < flattenedData.length; i++) {
      const emp = flattenedData[i];
      worksheet.addRow({
        name: emp.Name,
        doj: emp.DOJ,
        title: emp.Title,
        compensation: emp.Compensation,
        department: emp.Department,
        manager: emp.Manager,
      });
      // Add the image to the sheet
      if (emp.image) {
        const base64 = await this.getBase64FromUrl(emp.image);
        const imageId = workbook.addImage({
          base64: base64,
          extension: 'png',
        });
        worksheet.addImage(imageId, {
          tl: { col: 6, row: i + 1 },
          ext: { width: 60, height: 60 },
        });
      }
    }
    const buffer = await workbook.xlsx.writeBuffer();
    FileSaver.saveAs(new Blob([buffer]), 'organization-chart-with-images.xlsx');
  }

  // Utility function to get base64 from image URL
  private async getBase64FromUrl(imageUrl: string): Promise<string> {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private flattenHierarchy(
    nodes: TreeNode[],
    flattenedData: any[],
    seenNames: Set<string>,
    parentName: string = ''
  ): void {
    nodes.forEach((node) => {
      const { name, doj, title, compensationamount, department, imageUrl } = node.data;
      if (!seenNames.has(name)) {
        flattenedData.push({
          Name: name,
          DOJ: doj,
          Title: title,
          Compensation: compensationamount,
          Department: department,
          Manager: parentName,
          image: imageUrl,
        });
        seenNames.add(name);
      }
      if (node.children) {
        this.flattenHierarchy(node.children, flattenedData, seenNames, name);
      }
    });
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
    chartElement.setAttribute('style', `width: ${originalWidth}px; height: ${originalHeight}px; overflow: visible;`);
    html2canvas(chartElement as HTMLElement, {
      width: originalWidth,
      height: originalHeight,
      scale: 2,
      useCORS: true,
    }).then((canvas) => {
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

  onSelectprofilePicDownload(employee: any): Observable<any> {
    return this.http.DownloadDataWithQuery('FileSystem/Downloadfile', employee).pipe(
      map((res: any) => {
        const blob = new Blob([res['body']], { type: 'image/png' });
        const objectURL = URL.createObjectURL(blob);
        return this.sanitizer.bypassSecurityTrustUrl(objectURL);
      }),
      catchError(() => of('images/alternate.png')) // Use default image on error
    );
  }

  getOrghierarchy(employeeId?: any) {
    this.dataload = true;
    if (!employeeId) {
      employeeId = this.employeedata.employeeId;
    }
    this.subscription = this.http.getData(`Employeedata/getOrganizationalhierarchybyid/${employeeId}`).subscribe({
      next: (response: any) => {
        this.dataload = false
        if (response.length > 0) {
          this.dataload = false
          this.data = response || [];
          this.isDataPresent = false;
          this.data.forEach((employee: any) => {
            this.onSelectprofilePicDownload(employee.data.image).subscribe((imageUrl: any) => {
              employee.data.imageUrl = imageUrl;
            });
            employee.children?.forEach((child: any) => {
              this.onSelectprofilePicDownload(child.data.image).subscribe((imageUrl: any) => {
                child.data.imageUrl = imageUrl;
              });
            });
          });
        } else {
          this.data = []
          this.isDataPresent = true;
          this.dataload = false
        }
      }, error: (error: any) => {
        this.dataload = false
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