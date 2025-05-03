import { Pipe, PipeTransform } from '@angular/core';
import { IAllFormsData } from '../../Interfaces/dynamic-forms.model';
@Pipe({
  name: 'searchForm'
})

export class SearchFormPipe implements PipeTransform {
  transform(formssearch: IAllFormsData[], searchValue: any): IAllFormsData[] {
    if ((!formssearch) || !searchValue) {
      return formssearch;
    }
    return formssearch.filter((record: any) =>
      record.moduleName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      record.formName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      record.status?.toLowerCase().includes(searchValue.toLowerCase()) ||
      record.createdBy?.toLowerCase().includes(searchValue.toLowerCase()) ||
      record.updatedBy?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }
}