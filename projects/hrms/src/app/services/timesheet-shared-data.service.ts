import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimesheetSharedDataService {
  private projectDetails: any[] = [];
  private clientDetails: any[] = [];
  private departmentDetails: any[] = [];
  private tmandRmDetails: any[] = [];

  constructor(private http: HttpService) {}

  getProjectData(): Observable<any> {
    return this.http.getData(`Project`);
  }

  getClientData(): Observable<any> {
    return this.http.getData(`Client/GetAll`);
  }

  getDepartmentData(): Observable<any> {
    return this.http.getData(`Department`);
  }

  getTmandRMData(): Observable<any> {
    return this.http.getData(`JobDetails/getAllReportingnTeamManagers`);
  }

  formatTmRmList(data: any[]): any[] {
    return data.map((emp: any) => ({
      ...emp,
      fullName: emp.fusionEmpId
        ? `${emp.fusionEmpId} - ${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`
        : `${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`,
    }));
  }

  getAllEmployeeDetails(
    http: HttpService,
    currentEmployeeId: number,
    filters: { clientId?: any; projectId?: any; departmentId?: any; reportingId?: any }
  ): Observable<any> {
    const { clientId, projectId, departmentId, reportingId } = filters;
    const statuses = 'Active, Trainee Active, Active Contract';
    return http.getProjectResources(
      `ProjectResource/employees`,
      clientId,
      projectId,
      departmentId,
      reportingId,
      statuses
    );
  }

  formatEmployeeList(employees: any[], currentEmployeeId: number): any[] {
    return employees
      .filter((emp: any) => emp.employeeId !== currentEmployeeId)
      .map((emp: any) => ({
        value: emp.employeeId,
        label: emp.fusionEmpId
          ? `${emp.fusionEmpId} - ${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`
          : `${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`,
      }));
  }
}
