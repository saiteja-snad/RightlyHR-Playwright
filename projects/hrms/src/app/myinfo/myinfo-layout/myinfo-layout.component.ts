import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ProfileInfoDetailsComponent } from '../../shared/profile-info-details/profile-info-details.component';
import { MyInfoPersonalTabsComponent } from '../../shared/myinfo-tabs/my-info-personal-tabs/my-info-personal-tabs.component';
import { MyinfoJobTabsComponent } from "../../shared/myinfo-tabs/myinfo-job-tabs/myinfo-job-tabs.component";
import { Select } from 'primeng/select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal, Iteammembers } from '../../Interface/members-model';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-myinfo-layout',
  imports: [CommonModule, RouterOutlet, Select, ProfileInfoDetailsComponent, MyInfoPersonalTabsComponent, MyinfoJobTabsComponent],
  templateUrl: './myinfo-layout.component.html',
  styleUrl: './myinfo-layout.component.scss'
})
export class MyinfoLayoutComponent implements OnInit {
  activeButton!: string;
  activeSideNav!: string;
  activeItem!: string;
  empinfo = {} as Ipersonal;
  TeamMemberArray: Iteammembers[] = [];
  subscription!: Subscription;
  rmData = [
    { name: 'Rajesh', designation: 'Software Engineer', team: 'Development', location: 'Bangalore' }]
  http: any;
  constructor(private router: Router, private modalService: NgbModal) { }
  getAllTeammembersList() {
    
    let EmployeeId = parseInt(this.empinfo.employeeId)
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe(
      (responseData: any) => {
        console.log(responseData);
        this.TeamMemberArray = responseData as Iteammembers[];

        // Initialize the selected property for each team member
        this.TeamMemberArray.forEach(member => member.selected = false);

      },
      (      error: any) => {
        console.error(error);
      }
    );
  }

  ngOnInit(): void {
    //this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
    this.getAllTeammembersList();
    // this.getEmployee();
    // this.assignHeading();
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }
  selectedEmployees: Iteammembers[] = [];
  formatEmployeeName(employee: any): string {
    const nameParts = [];
  
    if (employee.firstName) {
      nameParts.push(employee.firstName);
    }
  
    if (employee.middleName) {
      nameParts.push(employee.middleName);
    }
  
    if (employee.lastName) {
      nameParts.push(employee.lastName);
    }
  
    return nameParts.join(' ');
  }
  firstSelectedEmployee: Iteammembers | null = null;
  getSelectedTeamMembersLabel(): string {
    const selectedCount = this.selectedEmployees.length;
  
    if (selectedCount === 0) {
      return 'Select Team Members';
    } else if (selectedCount === 1) {
      return this.formatEmployeeName(this.firstSelectedEmployee);
    } else {
      return `${this.formatEmployeeName(this.firstSelectedEmployee)} +${selectedCount - 1}`;
    }
  }
}
