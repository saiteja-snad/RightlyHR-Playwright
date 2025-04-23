import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
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

@Component({
  selector: 'app-organizationchart',
  imports: [CommonModule, Select, FormsModule, OrganizationChartModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './organizationchart.component.html',
  styleUrl: './organizationchart.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationchartComponent {

  data: TreeNode[] = [];
  subscription!: Subscription;
  activeEmplist = [] as any;
  selectedEmployeeId: number | null = null;
  employeedata: any;
  compensationyesorno: boolean | null = null;
  compensationOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  dataload = false;
  isDataPresent = false;
  ngOnInit(): void {
    this.employeedata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllEmployeeDetails()
    if(this.selectedEmployeeId===null){
      this.getOrghierarchy(this.employeedata.employeeId)
    }
  }


  constructor(private http: HttpService,private sanitizer: DomSanitizer, public rbac: RbacService) { }

  // function to get the data of employees by hierarchy

  getAllEmployeeDetails() {

    const satus = ['active', 'Trainee Active'];
    this.subscription = this.http.getData(`Employeedata/Getallemployees?statuses=${satus}`)
      .subscribe({
        next: (res: any) => {
          this.activeEmplist = res.map((employee: any) => ({
            label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''} ${employee.lastName ?? ''}`,
            value: employee.employeeId
          }));
        },
      });
  }

  onEmployeeChange(event: any) {
    this.selectedEmployeeId = event.value.value;
    console.log(this.selectedEmployeeId)
    this.getOrghierarchy(this.selectedEmployeeId)

  }

  onSelectprofilePicDownload(employee: any) {
    console.log('Downloading file for employee:', employee);
  
    return this.http.DownloadDataWithQuery('FileSystem/Downloadfile', employee).pipe(
      map((res: any) => {
        if (res && res.body) {
          const contentType = res.headers?.get('content-type') || 'application/octet-stream';
          const blob = new Blob([res.body], { type: contentType });
  
          const contentDisposition = res.headers?.get('content-disposition');
          let filename = 'download';
  
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+?)"?$/);
            if (match && match[1]) {
              filename = match[1];
            }
          } else if (employee?.fileName) {
            filename = employee.fileName;
          }
  
          // Append extension if missing
          if (!filename.includes('.')) {
            if (contentType.includes('pdf')) filename += '.pdf';
            else if (contentType.includes('jpeg')) filename += '.jpg';
            else if (contentType.includes('png')) filename += '.png';
          }
  
          // Download as image or pdf
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
  
          return null;
        } else {
          console.error('Failed to download file: No body in response');
          return 'images/alternate.png';
        }
      }),
      catchError((error) => {
        console.error('Error downloading file:', error);
        return of('images/alternate.png');
      })
    );
  }
  
  
  
  
  
  

  getOrghierarchy(employeeId?: any) {
    this.dataload = true;
    if (!employeeId) {
      employeeId = this.employeedata.employeeId;
    }
    this.subscription = this.http.getData(`Employeedata/getOrganizationalhierarchybyid/${employeeId}`)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          if (response.length > 0) {
            this.data = response  || [];
            this.data.forEach((employee: any) => {
              this.onSelectprofilePicDownload(employee.data.image).subscribe((imageUrl: any) => {
                employee.data.imageUrl = imageUrl;
              });
              // employee.children?.forEach((child: any) => {
              //   this.onSelectprofilePicDownload(child.data.image).subscribe((imageUrl: any) => {
              //     child.data.imageUrl = imageUrl;
              //   });
              // });
            });

            this.isDataPresent = false;
          } else {
            this.data=[]
            this.isDataPresent = true;
          }
        }, error: (error: any) => {
          console.log(error);
        }, complete: () => {
          this.dataload = false;
        }
      });
  }
}
