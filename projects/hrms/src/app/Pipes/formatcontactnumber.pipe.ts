import { Pipe, PipeTransform } from '@angular/core';
import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';

@Pipe({
  name: 'formatcontactnumber'
})
export class FormatcontactnumberPipe implements PipeTransform {

  transform(phoneValue: number | string, country: string): any {
  const defaultCountry: CountryCode = 'IN';
  
  try {
  
    const phoneNumber = parsePhoneNumber(phoneValue + '', country as CountryCode);
    return "+" + phoneNumber.countryCallingCode + " " + phoneNumber.nationalNumber;
  } catch (error1) {
    try {
      // If the provided country fails, fallback to US
      const phoneNumber = parsePhoneNumber(phoneValue + '', defaultCountry);
      return "+" + phoneNumber.countryCallingCode + " " + phoneNumber.nationalNumber;
    } catch (error2) {
      // If parsing fails entirely, return the raw value
      return country + phoneValue;
    }
  }
 
}

}
