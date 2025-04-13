import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IJobdetails } from '../../../Interfaces/job-model';
import { Iorgcategoryleaves } from '../../../Interfaces/timoff-model';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';




@Component({
  selector: 'app-leave-categoery',
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-categoery.component.html',
  styleUrl: './leave-categoery.component.scss'
})
export class LeaveCategoeryComponent implements OnInit {
  postjobdetails = {} as IJobdetails;
  subscription!: Subscription;

  postOrgPloicyDetails = {
    allowedGender: 2,
    allowedMaritalStatus: 0,
    excludeWeekends: false,
    excludeHolidays: false,
    allowedHalfDay: true,
    futureDatesAllowed: false,
    pastDateAllowed: false,
    carryForwardAllowed: false,
    encashAllowedType: false,
    noticeperiodAllowedType: false,
    noticePeriodAllowedValue: 0,
    isProbationAllowed: false,
    probationDays: 0,
    futureDatesAllowedDays: 0,
    pastDatesAllowedDays: 0,
    carryForwardAllowedValue: 0,
    encashAllowedValue: 0,
    parentId: 0,
    isApplicableProRataLeave: false,
    isOptionalHoliday: false
  } as Iorgcategoryleaves;

  postOrgPloicyDetailsArray: Iorgcategoryleaves[] = [];
  submissiondata: Iorgcategoryleaves[] = [];
  publishedddata: Iorgcategoryleaves[] = [];
  showdropdown1 = false;
  jobLocationDropDownData: any = [];
  currentYear: number = new Date().getFullYear();
  applicableYear: number = this.currentYear;
  years: number[] = [];
  searchValue: any;
  islistedItem = true;
  empdata = {} as any;
  selectDetails = {} as any
  ValuesForSublocation: any
  searchdata = '';
  showDropDown = false;
  checkedList !: any[];
  selectedSubLocation = "";
  list!: any[];
  locationid!: number;
  currentSelected = {};
  location!: number;
  currentSelected1 = {};
  checkedListShifts: string[] = [];
  shiftid!: number;

  constructor(
    private http: HttpService,
  ) {
    // Get the current year
    const currentYear = new Date().getFullYear();

    // Display one past year, the current year, and one future year
    for (let i = currentYear - 1; i <= currentYear + 1; i++) {
      this.years.push(i);
    }

  }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('fusionuser') || '{}');
    this.jobLocationList();
    this.getOrgLeavesCategories();
    this.postOrgPloicyDetails.categoryColor = '#304ffd';
    this.postOrgPloicyDetails.parentId = undefined
  }

  publishedCategories: any
  getOrgLeavesCategories() {
    this.subscription = this.http.getData('OrgLeavesCategories').subscribe({
      next: (responseData: any) => {
        this, responseData.orgcategory
        this.postOrgPloicyDetailsArray = responseData as Iorgcategoryleaves[];
        this.publishedCategories = responseData.filter((x: any) => x.status === 'Published');

        this.publishedddataa();
        this.submisssiondataa();
      },
      error: error => {
        console.error(error);
      }
    });
  }

  publishedddataa() {
    this.publishedddata = this.postOrgPloicyDetailsArray.filter(
      (details) => details.status === 'Published'
    ).reverse();
    this.publishedCount = this.publishedddata.length;
  }
  publishedCount = 0;
  submissionCount = 0;

  submisssiondataa() {
    this.submissiondata = this.postOrgPloicyDetailsArray.filter(
      (details) => details.status === 'Pending for submission'
    ).reverse();
    this.submissionCount = this.submissiondata.length;
  }
  getPublishedCategories(): Iorgcategoryleaves[] {
    // Filter 'Published' categories from the existing data
    return this.postOrgPloicyDetailsArray.filter(category => category.status === 'Published');
  }
  getPublishedCategoriesupdate(): Iorgcategoryleaves[] {
    // Filter 'Published' categories from the existing data
    return this.selectDetails.filter((category: any) => category.status === 'Published');
  }


  postOrgData(f: NgForm) {
    this.postOrgPloicyDetails.status = "Pending for submission";
    this.postOrgPloicyDetails.addedDate = new Date();
    this.postOrgPloicyDetails.lastModifiedDate = new Date();
    console.log(this.postOrgPloicyDetails);


    this.http.postdata('OrgLeavesCategories', this.postOrgPloicyDetails).subscribe({
      next: (data: any) => {
        const modalElement = document.getElementById('successhide');
        const succuesMessage = document.getElementById('successMsg')
        if (succuesMessage !== null) {
          succuesMessage.innerHTML = 'Leave category added successfully'
        }
        if (modalElement) {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
        }
        setTimeout(function () {
          location.reload();
        }, 2000);
      },
      error: (err: any) => {
        const modalElement = document.getElementById('errorhide');
        const succuesMessage = document.getElementById('errorhidemsg')
        if (succuesMessage !== null) {
          succuesMessage.innerHTML = 'A record with similar Leave category name or Leave category code already exists'
        }
        if (modalElement) {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
        }

      }
    });

  }


  postOrgDataUpdata(f: NgForm) {
    // this.selectDetails.parentId = this.selectDetails.parentId
    this.subscription = this.http.postdata(`OrgLeavesCategories/UPDATER`, this.selectDetails).subscribe({
      next: (data: any) => {
        console.log(data)
        const modalElement = document.getElementById('successhide');
        const succuesMessage = document.getElementById('successMsg')
        if (succuesMessage !== null) {
          succuesMessage.innerHTML = 'Leave category updated successfully'
        }
        if (modalElement) {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
        }
        setTimeout(function () {
          location.reload();
        }, 2000);
      },
      error: (err: any) => {
        const modalElement = document.getElementById('errorhide');
        const succuesMessage = document.getElementById('errorhidemsg')
        if (succuesMessage !== null) {
          succuesMessage.innerHTML = 'A record with similar Leave category name or Leave category code already exists'
        }
        if (modalElement) {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
        }

        // <insert code for what to do on failure>
      }
    });
  }

  closepopup() {
    const modalElement = document.getElementById('errorhide');
    const overlay = document.querySelector('.modal-backdrop');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
    }
    if (overlay) {
      document.body.removeChild(overlay);
    }
    document.body.classList.remove('modal-open');
  }

  openmain() {
    const modalElement = document.getElementById('requestdoc');
    const overlay = document.createElement('div');
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      document.body.classList.add('modal-open');
      overlay.className = 'modal-backdrop fade show';
      document.body.appendChild(overlay);
    }
  }

  onClick(data: any) {
    console.log(data);

    this.selectDetails = data
    this.selectDetails.parentId = undefined

    console.log(this.selectDetails.isOptionalHoliday);

    this.OnClickLocationedit();
  }
  //function to get SubLocation
  OnClickLocation() {
    const locationID = this.postOrgPloicyDetails.locationID;
    console.log(locationID);
    this.getSubLocationByid(locationID);
  }

  //function to get SubLocation
  OnClickLocationedit() {
    const locationID = this.selectDetails.locationID;
    console.log(locationID);
    this.getSubLocationByid(locationID);
  }

  //function to get sublocation by id
  subLocationsDropdown: any = [];
  getSubLocationByid(locationID: any) {
    this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${locationID}`).subscribe({
      next: (data: any) => {
        this.subLocationsDropdown = data.jobSubLocations;
        this.subloactionid();
      }
    })
  }


  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data.jobLocations;
      }
    })
  }


  reload() {
    window.location.reload();
  }


  confirmDiscard() {
    const modalElement = document.getElementById('conformadd');
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
    }
  }

  closeadd() {
    const modalElement = document.getElementById('conformadd');
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'none';
    }
  }

  closeaddtotal() {
    window.location.reload();
  }

  getSelectedValue(status: boolean, value: string, id: number) {
    this.locationid = id;
    console.log(id);

    this.list.forEach(item => {
      if (item.name !== value) {
        item.checked = false;
        item.subLocations.forEach((sub: any) => {
          sub.checked = false;
        });
      }
    });
    this.checkedList = [];
    this.selectedSubLocation = "";
    if (status) {
      this.checkedList.push(value);
    }
    this.currentSelected = { checked: status, name: value };
    this.shareCheckedlist();
    this.shareIndividualStatus();

  }


  shareCheckedlist() {
    console.log(this.checkedList);
  }

  shareIndividualStatus() {
    console.log(this.currentSelected);
  }

  getSelectedSubLocation(status: boolean, value: string, id: number) {
    this.location = id

    this.list.forEach(item => {
      item.subLocations.forEach((sub: any) => {
        if (sub.name !== value) {
          sub.checked = false;
        }
      });
    });
    this.getAllShifts();
    this.selectedSubLocation = "";

    if (status) {
      this.selectedSubLocation = value;
    }
    this.currentSelected1 = { checked: status, name: value };
  }

  shiftsAvailable: any;

  getAllShifts() {
    this.subscription = this.http.getData(`orgShifts/getshiftlocation?locationId=${this.locationid}&subLocationId=${this.location}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.shiftsAvailable = data;
        this.shiftsAvailable[0].orgShiftsItems.forEach((element: any) => {
          element.checked = false
        });
        console.log(this.shiftsAvailable[0].orgShiftsItems);

      }
    });
  }

  getSelectedShift(status: boolean, value: string, id: number) {
    this.shiftid = id;
    console.log(this.shiftid);

    this.checkedListShifts = [];
    if (status) {
      this.checkedListShifts.push(value);
    }
    this.currentSelected1 = { checked: status, name: value };
  }

  //Validations
  restrictInput(event: any) {
    const pattern = /[a-zA-Z ]/; // adjust this to include the characters you want to allow
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  restrictInputLeavecode(event: any) {
    const pattern = /[a-zA-Z0-9 ]/; // adjust this to include the characters you want to allow
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    } else {
      // calculate the new value
      const newValue = event.target.value + inputChar;
      const matches = newValue.match(/\d+/g);
      const numericValue = matches ? parseInt(matches.join(''), 10) : 0;

      // if the numeric value is greater than 99999999, prevent input
      if (numericValue > 99999999) {
        event.preventDefault();
      }
    }
  }


  restrictInputNumbers(event: any) {
    const pattern = /^[0-9\b]+$/; // allows only numbers
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    } else {
      // check if the new value will be between 0 and 365
      const newValue = Number(event.target.value + inputChar);
      if (newValue < 0 || newValue > 366) {
        // invalid value, prevent input
        event.preventDefault();
      }
    }
  }

  restrictInputDays(event: any) {
    const pattern = /^[0-9\-_.,!@#$%^&*()+=?'"<>:;\[\]\{\}\\|~`]*$/; // allows only numbers
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    } else {
      // check if the new value will be between 0 and 365
      const newValue = Number(event.target.value + inputChar);
      if (newValue < 0 || newValue > 65) {
        // invalid value, prevent input
        event.preventDefault();
      }
    }
  }

  subloactionid() {
    if (this.postOrgPloicyDetails.subLocation) {
      const sublocationId = this.subLocationsDropdown.find((c: any) => parseInt(c.id) === parseInt(this.postOrgPloicyDetails.subLocation));
      this.getShiftBYid(sublocationId);
    }
    else {
      const sublocationId = this.subLocationsDropdown.find((c: any) => parseInt(c.id) === parseInt(this.selectDetails.subLocation));
      this.getShiftBYid(sublocationId);
    }

  }

  //function to get the shift data in dropdown
  shiftDropdown: any = [];
  getShiftBYid(Values: any) {
    if (Values) {
      this.subscription = this.http.getData(`orgShifts/getshiftlocation?locationId=${Values.jobLocationId}&subLocationId=${Values.id}`).subscribe({
        next: (data: any) => {
          if (data.length === 0) {
            this.shiftDropdown = []
          }
          // this.shiftDropdown=data[0].orgShiftsItems
          this.shiftDropdown = data
        }
      })
    } else {
      console.log('Values is not defined');
    }
  }

  onSubmit() {
    // this.selectDetails.parentId = this.selectDetails.parentId
    this.selectDetails.status = "Published"
    this.http.postdata(`OrgLeavesCategories/UPDATER`, this.selectDetails).subscribe({
      next: (data: any) => {
        const modalElement = document.getElementById('successhide');
        const succuesMessage = document.getElementById('successMsg')
        if (succuesMessage !== null) {
          succuesMessage.innerHTML = 'Leave category published successfully'
        }
        if (modalElement) {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
        }
        setTimeout(function () {
          location.reload();
        }, 2000);
      },
      error: (err: any) => {
        console.log(err);
        alert('Updation of data failed')
        // <insert code for what to do on failure>
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
  showDropdown = false;
  selectItem(item: any) {
    // Handle the selection of an item from the dropdown list
    this.selectDetails.subLocation = item.id; // Assign selected value to selectDetails
    this.showDropdown = false; // Hide the dropdown after selection
  }

  cloneLeavecategory(details: any) {
    console.log(details);
    this.postOrgPloicyDetails.applicableYear = details.applicableYear;
    this.postOrgPloicyDetails.locationID = details.locationID;
    this.postOrgPloicyDetails.subLocation = details.subLocation;
    this.postOrgPloicyDetails.shiftId = details.shiftId;
    this.postOrgPloicyDetails.type = details.type;
    this.postOrgPloicyDetails.name = details.name;
    this.postOrgPloicyDetails.categoryCode = details.categoryCode;
    this.postOrgPloicyDetails.validity = details.validity;
    this.postOrgPloicyDetails.categoryColor = details.categoryColor;
    this.postOrgPloicyDetails.allowedGender = details.allowedGender;
    this.postOrgPloicyDetails.allowedMaritalStatus = details.allowedMaritalStatus;
    this.postOrgPloicyDetails.excludeWeekends = details.excludeWeekends;
    this.postOrgPloicyDetails.excludeHolidays = details.excludeHolidays;
    this.postOrgPloicyDetails.allowedHalfDay = details.allowedHalfDay;
    this.postOrgPloicyDetails.futureDatesAllowed = details.futureDatesAllowed;
    this.postOrgPloicyDetails.futureDatesAllowedDays = details.futureDatesAllowedDays;
    this.postOrgPloicyDetails.pastDateAllowed = details.pastDateAllowed;
    this.postOrgPloicyDetails.pastDatesAllowedDays = details.pastDatesAllowedDays;
    this.postOrgPloicyDetails.carryForwardAllowedValue = details.carryForwardAllowedValue;
    this.postOrgPloicyDetails.carryForwardAllowed = details.carryForwardAllowed;
    this.postOrgPloicyDetails.encashAllowedType = details.encashAllowedType;
    this.postOrgPloicyDetails.encashAllowedValue = details.encashAllowedValue;
    this.postOrgPloicyDetails.noticePeriodAllowedValue = details.noticePeriodAllowedValue;
    this.postOrgPloicyDetails.noticeperiodAllowedType = details.noticeperiodAllowedType;
    this.postOrgPloicyDetails.isOptionalHoliday = details.isOptionalHoliday;
    this.postOrgPloicyDetails.probationDays = details.probationDays;
    this.postOrgPloicyDetails.isProbationAllowed = details.isProbationAllowed;
    this.postOrgPloicyDetails.parentId = details.parentId || undefined;

  }



  cloning = false
  cloneLeavecategoryy() {
    this.cloning = true;
    this.postOrgPloicyDetails.applicableYear = this.selectDetails.applicableYear;
    this.postOrgPloicyDetails.locationID = this.selectDetails.locationID;
    this.postOrgPloicyDetails.subLocation = this.selectDetails.subLocation;
    this.postOrgPloicyDetails.shiftId = this.selectDetails.shiftId;
    this.postOrgPloicyDetails.type = this.selectDetails.type;
    this.postOrgPloicyDetails.name = this.selectDetails.name;
    this.postOrgPloicyDetails.categoryCode = this.selectDetails.categoryCode;
    this.postOrgPloicyDetails.parentId = this.selectDetails.parentId || undefined;
    this.postOrgPloicyDetails.validity = this.selectDetails.validity;
    this.postOrgPloicyDetails.categoryColor = this.selectDetails.categoryColor;
    this.postOrgPloicyDetails.allowedGender = this.selectDetails.allowedGender;
    this.postOrgPloicyDetails.allowedMaritalStatus = this.selectDetails.allowedMaritalStatus;
    this.postOrgPloicyDetails.excludeWeekends = this.selectDetails.excludeWeekends;
    this.postOrgPloicyDetails.excludeHolidays = this.selectDetails.excludeHolidays;
    this.postOrgPloicyDetails.allowedHalfDay = this.selectDetails.allowedHalfDay;
    this.postOrgPloicyDetails.futureDatesAllowed = this.selectDetails.futureDatesAllowed;
    this.postOrgPloicyDetails.futureDatesAllowedDays = this.selectDetails.futureDatesAllowedDays;
    this.postOrgPloicyDetails.pastDateAllowed = this.selectDetails.pastDateAllowed;
    this.postOrgPloicyDetails.pastDatesAllowedDays = this.selectDetails.pastDatesAllowedDays;
    this.postOrgPloicyDetails.carryForwardAllowedValue = this.selectDetails.carryForwardAllowedValue;
    this.postOrgPloicyDetails.carryForwardAllowed = this.selectDetails.carryForwardAllowed;
    this.postOrgPloicyDetails.encashAllowedType = this.selectDetails.encashAllowedType;
    this.postOrgPloicyDetails.encashAllowedValue = this.selectDetails.encashAllowedValue;
    this.postOrgPloicyDetails.noticePeriodAllowedValue = this.selectDetails.noticePeriodAllowedValue;
    this.postOrgPloicyDetails.noticeperiodAllowedType = this.selectDetails.noticeperiodAllowedType;
    this.postOrgPloicyDetails.isOptionalHoliday = this.selectDetails.isOptionalHoliday
    this.postOrgPloicyDetails.probationDays = this.selectDetails.probationDays;
    this.postOrgPloicyDetails.isProbationAllowed = this.selectDetails.isProbationAllowed;
  }

  isFieldsDisabled = false;
  viewLeavecategory() {
    this.isFieldsDisabled = true;
    this.postOrgPloicyDetails.applicableYear = this.selectDetails.applicableYear;
    this.postOrgPloicyDetails.locationID = this.selectDetails.locationID;
    this.postOrgPloicyDetails.subLocation = this.selectDetails.subLocation;
    this.postOrgPloicyDetails.shiftId = this.selectDetails.shiftId;
    this.postOrgPloicyDetails.type = this.selectDetails.type;
    this.postOrgPloicyDetails.name = this.selectDetails.name;
    this.postOrgPloicyDetails.categoryCode = this.selectDetails.categoryCode;
    this.postOrgPloicyDetails.validity = this.selectDetails.validity;
    this.postOrgPloicyDetails.categoryColor = this.selectDetails.categoryColor;
    this.postOrgPloicyDetails.allowedGender = this.selectDetails.allowedGender;
    this.postOrgPloicyDetails.allowedMaritalStatus = this.selectDetails.allowedMaritalStatus;
    this.postOrgPloicyDetails.excludeWeekends = this.selectDetails.excludeWeekends;
    this.postOrgPloicyDetails.excludeHolidays = this.selectDetails.excludeHolidays;
    this.postOrgPloicyDetails.allowedHalfDay = this.selectDetails.allowedHalfDay;
    this.postOrgPloicyDetails.futureDatesAllowed = this.selectDetails.futureDatesAllowed;
    this.postOrgPloicyDetails.futureDatesAllowedDays = this.selectDetails.futureDatesAllowedDays;
    this.postOrgPloicyDetails.pastDateAllowed = this.selectDetails.pastDateAllowed;
    this.postOrgPloicyDetails.pastDatesAllowedDays = this.selectDetails.pastDatesAllowedDays;
    this.postOrgPloicyDetails.carryForwardAllowedValue = this.selectDetails.carryForwardAllowedValue;
    this.postOrgPloicyDetails.carryForwardAllowed = this.selectDetails.carryForwardAllowed;
    this.postOrgPloicyDetails.encashAllowedType = this.selectDetails.encashAllowedType;
    this.postOrgPloicyDetails.encashAllowedValue = this.selectDetails.encashAllowedValue;
    this.postOrgPloicyDetails.noticePeriodAllowedValue = this.selectDetails.noticePeriodAllowedValue;
    this.postOrgPloicyDetails.noticeperiodAllowedType = this.selectDetails.noticeperiodAllowedType;
    this.postOrgPloicyDetails.probationDays = this.selectDetails.probationDays;
    this.postOrgPloicyDetails.isProbationAllowed = this.selectDetails.isProbationAllowed;
    this.postOrgPloicyDetails.parentId = this.selectDetails || undefined;;
  }

  futureDatesAllowedChanged() {
    if (!this.selectDetails.futureDatesAllowed) {
      this.selectDetails.futureDatesAllowedDays = null;
    }
  }
  pastDatesAllowedChanged() {
    if (!this.selectDetails.pastDateAllowed) {
      this.selectDetails.pastDatesAllowedDays = 0;
    }
  }
  carryForwardLeaveChanged() {
    if (!this.selectDetails.carryForwardAllowed) {
      this.selectDetails.carryForwardAllowedValue = 0;
    }
  }
  encashLeaveChanged() {
    if (!this.selectDetails.encashAllowedType) {
      this.selectDetails.encashAllowedValue = 0;
    }
  }
  noticePeriodChanged() {
    if (!this.selectDetails.notceperiodAllowedType) {
      this.selectDetails.noticePeriodAllowedValue = 0;
    }
  }
  probationPeriodChanged() {
    if (!this.selectDetails.isProbationAllowed) {
      this.selectDetails.probationDays = 0;

    }
  }
  onFutureDatesAllowedChange() {
    // If 'Future Dates Allowed' is set to 'No', reset the number of days to 0
    if (!this.postOrgPloicyDetails.futureDatesAllowed) {
      this.postOrgPloicyDetails.futureDatesAllowedDays = 0;
    }
  }
  onPastDatesAllowedChange() {
    // If 'Past Dates Allowed' is set to 'No', reset the number of days to 0
    if (!this.postOrgPloicyDetails.pastDateAllowed) {
      this.postOrgPloicyDetails.pastDatesAllowedDays = 0;
    }
  }
  onCarryForwardLeaveChange() {
    // If 'Carry Forward Leave' is set to 'No', reset the number of days to 0
    if (!this.postOrgPloicyDetails.carryForwardAllowed) {
      this.postOrgPloicyDetails.carryForwardAllowedValue = 0;
    }
  }
  onEncashLeaveChange() {
    // If 'Encash Leave' is set to 'No', reset the number of days to 0
    if (!this.postOrgPloicyDetails.encashAllowedType) {
      this.postOrgPloicyDetails.encashAllowedValue = 0;
    }
  }
  onNoticePeriodChange() {
    // If 'Notice Period' is set to 'No' and the input value is not provided, set the number of days to 0
    if (!this.postOrgPloicyDetails.noticeperiodAllowedType) {
      this.postOrgPloicyDetails.noticePeriodAllowedValue = 0;
    }
  }
  onProbationPeriodChange() {
    // If 'Notice Period' is set to 'No' and the input value is not provided, set the number of days to 0
    if (!this.postOrgPloicyDetails.isProbationAllowed) {
      this.postOrgPloicyDetails.probationDays = 0;
    }
  }
  checkaccess(rba: string): boolean {
    const access = JSON.parse(localStorage.getItem('fusionroleClaims') || '{}');
    if (access.includes(rba)) return true
    else return false

  }
}
