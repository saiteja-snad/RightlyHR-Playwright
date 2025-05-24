import { Component, signal } from '@angular/core';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-company-settings',
  imports: [Select,NgxCountriesDropdownModule],
  templateUrl: './company-settings.component.html',
  styleUrl: './company-settings.component.scss'
})
export class CompanySettingsComponent {
  img: any;
  imageUrl: any;
  selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true,
  };
  selectedDialCode: any;
  selectedCountryCodegflag: any;
  selectedDialphoneCode: any;
  selectedCountryCodephoneflag: any;
  selectedworkcoutrycode = signal<any>('');
   electedpersonalnumbercode = signal<any>('');



   onWorkNumberInput(): void {
    // const workNumberControl = this.contactForm.get('workNumber');
    // if (workNumberControl?.value) {
    //   const formattedValue = this.formatPhoneNumber(workNumberControl.value, this.selectedCountryCodegflag);
    //   workNumberControl.setValue(formattedValue, { emitEvent: false });
    // }
  }

   onCountryChange(country: any) {
    this.selectedDialCode = country.dialling_code;
    this.selectedCountryCodegflag = country.code;
    console.log('Selected country code:', this.selectedCountryCodegflag);
    console.log('Selected country dial code:', this.selectedDialCode);
    
  }
chooseNewProfile(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const maxSize = 1024 * 1024; // 1MB
      if (!allowedTypes.includes(file.type)) {
        let message = 'Invalid file type. Only PNG, JPG, and JPEG are allowed.';
        input.value = '';
        return;
      }
      if (file.size > maxSize) {
        let message = 'Please choose a file smaller than 1MB.';
        input.value = '';
        return;
      }
      this.img = file;
      input.value = ''; // clear input if needed to allow same file re-selection
      this.onProfilepicSelected(this.img);
    }
  }


    onProfilepicSelected(img: any) {
    let file = img;
    let d: Date = new Date();
  }


  postUploadprofilePic() {
    
  }
}
