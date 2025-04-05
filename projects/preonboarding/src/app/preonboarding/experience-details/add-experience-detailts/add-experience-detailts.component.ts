import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../http-services/http.service';
import { IRole, IJobtype, IEmpExperience } from '../../../models/experience.model';
import { Ipersonal } from '../../../models/personal-details.model';
import { Select } from 'primeng/select';
@Component({
  selector: 'app-add-experience-detailts',
  imports: [CommonModule, Select, ReactiveFormsModule, ],
  templateUrl: './add-experience-detailts.component.html',
  styleUrl: './add-experience-detailts.component.scss'
})
export class AddExperienceDetailtsComponent {
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  JobroleDetails = [] as IRole[];
  JobemploymenttypeDetails = [] as IJobtype[];
  currentDate: Date = new Date();
  isInvalidToDate: boolean = false;
  selectedfieldsexperience = {} as any;
  // posttotalExperience = {} as any;
  isCurrentdateDisable: boolean = false;
  isCurrentdateDisableupdate: boolean = false;
  disableFromandtovalidationbutton: boolean = false;
  showErrorforpdf: boolean = false;
  showErrorforsize: boolean = false;
  isFutureDate: boolean = false;
  a = true;
  b = false;
  file: any;
  Experiencedoc!: File
  getempexpdata = [] as any;
  isDisabletoDate: boolean = false;
  isfileselected: boolean = true;
  ExpenseViewURL!: any;
  ExpenseImageUrl!: any;
  postEmployeeExperience = {} as IEmpExperience;//variable to get the employee experiences
  prosempdata = {} as any;
  ExperienceDetails !: File;
  selectedValueJobRoleExpirencedropUpdate: string = '';
  selectedValueExperiencedropUpdateInitial: string = '';//to post the data
  selectedValuecontactnumberCountryCodeInitial: string = '';
  selectedValueCountryCodedropUpdate: string = '';
  selectedValuecontactnumberCountrydropdown: string = '';//previously setected value
  selectedValueJobRoledrop: string = '';//to post the data
  selectedValueJobRoledropUpdate: string = '';//to post the data
  selectedValueReportstodropUpdate: string = '';//to post the data
  selectedValueemployeementtypedropUpdate: string = '';
  selectedValueEmployementtypedropInitial: string = '';//to post the data
  allempdata = [] as Ipersonal[];
  empdata = {} as any;
  optionsFound: boolean = true;
  StatusMsg: any;
  islistedItem: boolean = true;
  pouptext1: any;
  Status: any
  toatlexp = {} as any;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  isItemIntheList(isitem: boolean) {
    console.log(isitem);
    this.islistedItem = isitem;
  }
  updateOptionsFound(found: boolean) {
    this.optionsFound = found;
  }
  isEditing: boolean = false;
  constructor(
    private http: HttpService, private fb: FormBuilder,
    config: NgbModalConfig, private modalService: NgbModal
  ) {
    config.backdrop = 'static';
    config.keyboard = false;

  }
  ngOnInit(): void {
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getemploymenttype();
  }


  formatDate(data: any): any {
    if (data) {
      return moment(data).format('YYYY-MM-DD');
    }
    return data
  }


  //function to check the check box
  onclickcheckbox() {
    if (this.postEmployeeExperience.isPresent == false) {
      this.isDisabletoDate = true;
      this.postEmployeeExperience.toDate = null;
      this.postEmployeeExperience.isPresent == false;
    }
    else if (this.postEmployeeExperience.isPresent == true) {
      this.isDisabletoDate = false;
      this.postEmployeeExperience.isPresent == true;
    }
    else if (this.postEmployeeExperience.isPresent == undefined) {
      this.isDisabletoDate = true;
      this.postEmployeeExperience.toDate = null;
      this.postEmployeeExperience.isPresent == true;
    }
  }

  onExperienceSelected(event: any) {
    let file = event.target.files[0];
    console.log(this.Experiencedoc);
    let d: Date = new Date()
    this.Experiencedoc = this.renameFile(file, `${this.empinfo.employeeId}_${d.getTime()}_${file.name}`)
  }

  private renameFile(originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  //function to get jobtype dropdown
  getemploymenttype() {
    this.subscription = this.http.getData("PreonboardingJobtype").subscribe({
      next: (data: any) => {
        this.JobemploymenttypeDetails = data as IJobtype[]
      },
      error: (reason: any) => {
        console.log(reason);
      }
    })
  }

  //function to select the file in post 
  onChangeexperience(event: any) {
    this.isfileselected = false;
    this.file = event.target.files[0];
    let d: Date = new Date()
    this.ExperienceDetails = this.renameFile(this.file, `${this.prosempdata.employeeId}_${d.getTime()}_${this.file.name}`)
    console.log(this.ExperienceDetails);
  }

  onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = [
        'image/jpeg',
        'image/*',
        'application/pdf',
        'image/png'
      ];
      const maxSizeInBytes = 25 * 1024 * 1024; // 5MB
      if (!allowedTypes.includes(file.type)) {
        this.showErrorforpdf = true;
        this.showErrorforsize = false;
        input.value = '';
      }
      else if (file.size > maxSizeInBytes) {
        this.showErrorforsize = true;
        this.showErrorforpdf = false;
        input.value = '';
      }
      else {
        this.showErrorforpdf = false;
        this.showErrorforsize = false;
      }
    }
  }

  //function to post experience details
  postExpDetails() {
    this.postEmployeeExperience.empId = parseInt(this.prosempdata.employeeId)
    this.postEmployeeExperience.countryCode = this.selectedValuecontactnumberCountrydropdown;
    this.postEmployeeExperience.isDeleted = true
    if (this.file) {
      let filepath = `/FusionDocuments/Employee Documents/Previous Experience Documents/${this.prosempdata.employeeId}`;
      this.subscription = this.http
        .uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', filepath,
          this.file
        )
        .subscribe({
          next: (data: any) => {
            this.postEmployeeExperience.attachment = data.path;
            this.postEmployeeExperience.empId = this.prosempdata.employeeId;
            console.log(this.postEmployeeExperience);
            this.subscription = this.http.postData("PreonboardingExperience", this.postEmployeeExperience).subscribe({
              next: (data: any) => {
                console.log(data);
                this.pouptext1 = 'Data added sucessfully';
                // const modalElement = document.getElementById('successhide');
                // if (modalElement) {
                //   modalElement.classList.add('show');
                //   modalElement.style.display = 'block';
                // }
                setTimeout(() => {
                  // const modalElement = document.getElementById('successhide');
                  // if (modalElement) {
                  //   modalElement.classList.remove('show');
                  //   modalElement.style.display = 'none';
                  //   this.getexperiencedetails();
                  //   location.reload();
                  // }
                }, 9000);
                // location.reload();
              },
              error: (reason: any) => {
                console.log(reason);
                if (reason.status == 409) {
                  // this.dataFailureMsg(reason.error)
                }
                else if (reason.status == 400) {
                  // this.dataFailureMsg(reason.error.message)
                }
                else {
                  // this.dataFailureMsg("Insertion of data is failed");
                }
              },
              complete: () => "",
            });
          }
        });
    }
    else {
      this.postEmployeeExperience.empId = parseInt(this.prosempdata.employeeId)
      this.postEmployeeExperience.countryCode = this.selectedValuecontactnumberCountrydropdown;
      this.postEmployeeExperience.isDeleted = true;
      this.postEmployeeExperience.attachment = '';
      this.subscription = this.http.postData("PreonboardingExperience", this.postEmployeeExperience).subscribe({
        next: (data: any) => {
          console.log(data);
          this.pouptext1 = 'Data added sucessfully';
          setTimeout(() => {
            // const modalElement = document.getElementById('successhide');
            // if (modalElement) {
            //   modalElement.classList.remove('show');
            //   modalElement.style.display = 'none';
            // }
          }, 9000);
        },
        error: (reason: any) => {
          console.log(reason);
          if (reason.status == 409) {
            // this.dataFailureMsg(reason.error)
          }
          else if (reason.status == 400) {
            // this.dataFailureMsg(reason.error.message)
          }
          else {
            // this.dataFailureMsg("Insertion of data is failed");
          }
        },
        complete: () => "",
      });
    }
  }

  getFileName(attachmentPath: string): string {
    if (attachmentPath) {
      const splitPath = attachmentPath.split('/');
      let fileName = splitPath[splitPath.length - 1];
      if (fileName.length > 12) {
        fileName = fileName.substring(12);
      }
      return fileName;
    }
    return '';
  }

  close(): void {
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
