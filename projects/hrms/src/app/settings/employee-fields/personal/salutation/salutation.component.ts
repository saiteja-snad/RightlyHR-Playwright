import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../../services/open-modal.service';
import { FormGroup,ReactiveFormsModule,FormsModule, Validators, } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Iroles } from '../../../roles-permissions/roles/roles.model';
import { HttpService } from '../../../../services/http.service';

@Component({
  selector: 'app-salutation',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './salutation.component.html',
  styleUrl: './salutation.component.scss'
})
export class SalutationComponent implements OnInit {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  fb: any;
  saluationdetails:any;
  sal:any;
  subscription: any;
updateSaluation: any;
  rolesDeletedata: any;
salDeletedata: any;

  
  
  constructor(private modalService: NgbModal,private conformationPopup: OpenModalService,private http: HttpService) { }
  
  saluationForm!: FormGroup<any>;
  updateForm!: FormGroup<any>;
  
  ngOnInit(): void {
    this.getsaluation();
    this.saluationForm = this.fb.group({
    saluation: [null, [Validators.required, Validators.minLength(3),Validators.maxLength(50)]]
    });
    this.updateForm = this.fb.group({
      titName: ['', Validators.required] // Replace with your actual field name if needed
    });
      
    }
  


  getsaluation() {
    this.subscription = this.http.getData("Title").subscribe({
       next: (data: any) => {
         console.log(data);
         this.saluationdetails = data as Iroles[]
         console.log(this.saluationdetails)
       },
       error: (reason: any) => {
         console.log(reason);
         alert("Insertion of data is failed")
       }
     })
   }

   onSubmit() {
    const request = {
      titlename: this.saluationForm.get('saluation')?.value
    };
  
    console.log('Sending request:', request); 
  
    this.subscription = this.http.postdata("Title", request).subscribe({
      next: (data: any) => {
        console.log('Response:', data);
        this.modalService.dismissAll();
        this.getsaluation(); 
        this.conformationPopup.openSuccessModal('Salutation added successfully');
      },
      error: (reason: any) => {
        console.error('Error:', reason);
        this.conformationPopup.openErrorModal('Failed to add salutation data');
      }
    });
    
  }
  close(modal: any): void {
    modal.dismiss();
    this.updateForm.reset();
  }
  openupdate(sal:any) {
    console.log(sal)
    this.saluationdetails=sal;
this.updateForm?.patchValue({titlename:sal.titlename});
this.modalService.open(this.updatepopup, { centered: true, backdrop: 'static' });
}
opendelete(sal:any) {
console.log(sal)
this.saluationdetails=sal;
this.modalService.open(this.deletepopup, { centered: true, backdrop: 'static' });
}
  updateSal(modal: any): void {
    if (this.updateForm.valid) {
      
      this.saluationdetails.titlename = this.updateForm.value.firstName;
      this.updateSaluation.isdeleted = 'Active'; 
  
      this.subscription = this.http.postdata(`Title/UPDATE`, this.rolesDeletedata).subscribe({
        next: (data: any) => {
          this.sal(); 
          this.updateForm.reset(); 
          this.modalService.dismissAll(); 
          this.conformationPopup.openSuccessModal('Salutation updated successfully');
        },
        error: (err: any) => {
          console.error('Update failed:', err);
          this.conformationPopup.openErrorModal('Update failed. Please try again.');
        }
      });
    } else {
      this.conformationPopup.openErrorModal('Form is invalid. Please check the inputs.');
    }
  }
  
  deletesal(sal: any): void {
      const deleteRequest = {
        sno: sal.sno,
        titlename: sal.titlename,
        isdeleted: 'Active' 
      };
    
      this.http.postdata('Title/delete', deleteRequest).subscribe({
        next: () => {
          this. getsaluation(); 
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('SAL data deleted successfully');
        },
        error: (err: any) => {
          console.error('Delete SAL failed:', err);
          this.conformationPopup.openErrorModal('Failed to delete SAL data');
        }
      });
    }
    
  }
  

