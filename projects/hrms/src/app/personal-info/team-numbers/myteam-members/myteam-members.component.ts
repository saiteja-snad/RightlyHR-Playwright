import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { Iteammembers } from '../../../Interfaces/members-model';
import { SearchfilterPipe } from "../../../Pipes/searchfilter.pipe";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-myteam-members',
  imports: [CommonModule, NoDataFoundComponent, SearchfilterPipe,FormsModule],
  templateUrl: './myteam-members.component.html',
  styleUrl: './myteam-members.component.scss'
})
export class MyteamMembersComponent {
empinfo:any
subscription!: Subscription;
searchValue=''
teamMemberArray: Iteammembers[] = [];
constructor(
  private http: HttpService,
 ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.getAllTeammembersList()

    }

    getAllTeammembersList() {
      const EmployeeId = this.empinfo.employeeId;
    
      this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe(
        (responseData: any) => {
          console.log(responseData);
    
          // Filter only those with isAccess === true
          const filteredData = (responseData as Iteammembers[]).filter(member => member['isAccess'] === true);
    
          // Set filtered array
          this.teamMemberArray = filteredData;
    
        },
        error => {
          console.error(error);
        }
      );
    }
    
    
}
