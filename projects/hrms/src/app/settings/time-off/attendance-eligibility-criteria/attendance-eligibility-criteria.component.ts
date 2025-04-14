import { Component, OnDestroy, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { Subject, Subscription } from 'rxjs';
import { IEligibilityCriteria, Ipermissions, IPermissionsvalue, IPermissionType } from '../../../Interfaces/timoff-model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendance-eligibility-criteria',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './attendance-eligibility-criteria.component.html',
  styleUrl: './attendance-eligibility-criteria.component.scss'
})
export class AttendanceEligibilityCriteriaComponent implements OnInit, OnDestroy {
  subscription!: Subscription
  permissionsForm!: FormGroup;
  attendanceForm !:FormGroup
  eligibilityCriterias = [] as IEligibilityCriteria[]
  permissionsType = [] as IPermissionType[]
  permissionsvalue = [] as IPermissionsvalue[]
  regularizationvalue=[] as IPermissionsvalue[]
  isactive!: boolean;
  Status: any;
  selectedpermission!: IPermissionType;
  selectedpermissiondetled!: number
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedattencedetled!:number;
  @ViewChild('compOff') compOff!: TemplateRef<string>;
  @ViewChild('workFromHome') workFromHome!: TemplateRef<string>;
  @ViewChild('permission') permission!: TemplateRef<string>;

  displayTemplate = signal<TemplateRef<string>>(this.compOff);
  constructor(
    private httpService: HttpService,
    private fb: FormBuilder,
    private http: HttpService,
  ) { }
  ngOnInit(): void {
    this.getEligibitlyCriterias("CompOffEligibilityCriteria")
    this.displayTemplate.set(this.compOff);
    this.fromdataintalition()
   this.getdatabyentriy()
   this.getPermissionTypes();
   this.getregularizationTypes();
  }

  fromdataintalition() {
    this.permissionsForm = this.fb.group({
      name: [null, Validators.required]

    });
    this.attendanceForm=this.fb.group({
      name: [null, Validators.required]
    })
  }



  getEligibitlyCriterias(eligibilityType: string) {
    this.subscription = this.httpService.getData(eligibilityType).subscribe({
      next: (data: unknown) => {
        this.eligibilityCriterias = data as unknown as IEligibilityCriteria[]
      },
      error: (reason: any) => console.log(reason),
      complete: () => { }
    })

  }

  getdatabyentriy(){
    const params='Permissions'
    const param=["maxHoursPerDay" , 'maxHoursPerMonth']
    this.subscription = this.httpService
    .getDatabyentriyvalue(`entityAttributeValues/getv1`, params,param).subscribe({
      next: (data: any) => {
        console.log(data)
        this.permissionsvalue = data as IPermissionsvalue[]
        console.log(this.permissionsvalue)

      }, error(err: any) {
        console.log("errors", err)
      },
    });

  }

  getPermissionTypes(){
    this.subscription =this.http.getData(`entityAttributeValues?entity=${'Regularization'}`).subscribe({
      next:(data: any) =>{
        console.log(data)
          this.permissionsvalue = data as IPermissionsvalue[]
        }, error(err:any) {
          console.log("errors", err)
        },
    })
  }
  getregularizationTypes(){
    const params = 'AttendanceRegularization'
    const param = ["maxRegularizePerDay", 'maxRegularizePerMonth']
    this.subscription = this.httpService
    .getDatabyentriyvalue(`entityAttributeValues/getv1`, params,param).subscribe({
      next: (data: any) => {
        console.log(data)
        this.regularizationvalue = data as IPermissionsvalue[]
        console.log(this.regularizationvalue)

      }, error(err: any) {
        console.log("errors", err)
      },
    });
  }

  getdatabytype(): void {
    //params
    const params = "Permissions"

    this.subscription = this.httpService
      .getDatabytype(`PermissionTypes`, params).subscribe({
        next: (data: any) => {
          console.log(data)
          this.permissionsType = data as IPermissionType[]

        }, error(err: any) {
          console.log("errors", err)
        },
      });
  }

  getdatabyattendce(): void {
    //params
    const params = "Regularization"

    this.subscription = this.httpService
      .getDatabytype(`PermissionTypes`, params).subscribe({
        next: (data: any) => {
          console.log(data)
          this.permissionsType = data as IPermissionType[]

        }, error(err: any) {
          console.log("errors", err)
        },
      });
  }



  postdata() {
    if (this.permissionsForm.valid) {
      const payload: Ipermissions = {
        name: this.permissionsForm.value.name,
        isDeleted: true,
        type: 'Permissions'

      };
      this.httpService.postdata(`PermissionTypes`, payload).subscribe({
        next: (data: any) => {
          console.log(data);
          this.getdatabytype()
          this.permissionsForm.reset();


        },
        error: (reason: any) => {
          console.log(reason);
        }
      });
    }
  }

  postattendance() {
    if (this.attendanceForm.valid) {
      const payload: Ipermissions = {
        name: this.attendanceForm.value.name,
        isDeleted: true,
        type: 'Regularization'

      };
      this.httpService.postdata(`PermissionTypes`, payload).subscribe({
        next: (data: any) => {
          console.log(data);
          this. getdatabyattendce()
          this.attendanceForm.reset();

        },
        error: (reason: any) => {
          console.log(reason);


        }
      });
    }
  }

  // getTypes(PermissionTypes: string) {
  //   this.subscription = this.httpService.getData(PermissionTypes).subscribe({
  //     next: (data) => {
  //       console.log(data)
  //       this.permissionsType = data as IPermissionType[]
  //     },
  //     error: (reason) => console.log(reason),

  //   })
  // }

  
  updatename(form: FormGroup) {
    if (form.invalid) {
      return
    }

    const now = new Date();
    const formattedDate = now.toISOString().replace(/(\.\d{3})\d+Z$/, '$1');

    const payload: any = {
      id: this.selectedpermission.id,
      name: this.permissionsForm.value.name,
      isDeleted: this.selectedpermission.isDeleted,
      type: 'Permissions',
      createdAt: formattedDate,
      updatedAt: this.selectedpermission.updatedAt 
     
    }
    console.log(payload)
    this.subscription = this.httpService.putData(`PermissionTypes/${this.selectedpermission.id}`, payload).subscribe({
      next: (data: any) => {
        if (data?.id) {
         this. getdatabytype()
     
        }
        this.permissionsForm.reset();
      },
      error: (res: any) => {
        console.log(res)
        this.permissionsForm.reset();
      }
    })
  }

  updateattendce(form: FormGroup){
    if (form.invalid) {
      return
    }

    const now = new Date();
    const formattedDate = now.toISOString().replace(/(\.\d{3})\d+Z$/, '$1');

    const payload: any = {
      id: this.selectedpermission.id,
      name: this.permissionsForm.value.name,
      isDeleted: this.selectedpermission.isDeleted,
      type: 'Regularization',
      createdAt: formattedDate,
      updatedAt: this.selectedpermission.updatedAt
    }
    console.log(payload)
    this.subscription = this.httpService.putData(`PermissionTypes/${this.selectedpermission.id}`, payload).subscribe({
      next: (data: any) => {
        if (data?.id) {
         this. getdatabyattendce()
        }
        this.permissionsForm.reset();

    
      },
      error: (res: any) => {
        console.log(res)
        this.permissionsForm.reset();

      }
    })
  }

  deletpremision() {
    this.subscription = this.httpService.deleteData(`PermissionTypes/${this.selectedpermissiondetled}`).subscribe({
      next: (data: any) => {

        if (data?.id) {
          this.getdatabytype()
       
        }
        this.permissionsForm.reset();

      
      },
      error: (res: any) => {
        console.log(res)
        this.permissionsForm.reset();
      }
    })

  }

  deletattence(){
    this.subscription = this.httpService.deleteData(`PermissionTypes/${this.selectedattencedetled}`).subscribe({
      next: (data: any) => {

        if (data?.id) {
          this.getdatabyattendce()
       
        }
        this.permissionsForm.reset();

      },
      error: (res: any) => {
        console.log(res)
        this.permissionsForm.reset();
      }
    })
  }

  onInputChange() {
    this.isactive = true
  }

  onInputFocus() {
    this.isactive = true
  }

  onUpdateAction(data: IPermissionType) {
    this.selectedpermission = data;
    this.permissionsForm.patchValue({
      name: data.name,
      type:data.type
      

    })
  }
  

  resetform(){
    this.permissionsForm.reset()
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
