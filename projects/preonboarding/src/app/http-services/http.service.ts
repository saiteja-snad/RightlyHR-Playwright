import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class HttpService {
  ApiUrl = environment.ApiUrl;

  constructor(private http: HttpClient, private router: Router,) { }

  getData(url: string) {
    return this.http.get(`${this.ApiUrl}${url}`);
  }

  //function to call the post the url
  postData(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);
  }

  putData(url: string, data: any) {
    return this.http.put(`${this.ApiUrl}${url}`, data);
  }

  // to get the ip
  getIpAddress() {
    return this.http.get('https://jsonip.com/');
  }

  uploadFileWithQuery(url: string, directoryPath: string, file: any) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(
      `${this.ApiUrl}${url}?directoryPath=${directoryPath}`,
      formData
    );
  }

  DownloadDataWithQuery(url: string, directoryPath: string) {
    const options = {
      observe: 'response' as const,
      responseType: 'blob' as const,
    };
    return this.http.get(
      `${this.ApiUrl}${url}?fileName=${directoryPath}`,
      options
    );
  }

  uploadfile(url: string, data: any) {
    const formData = new FormData();
    formData.append('Img', data.Img);
    formData.append('EmployeeId', data.EmployeeId);
    return this.http.post(`${this.ApiUrl}${url}`, formData);
  }

  deleteData(arg0: string, sdata: { status: string; id: number; employeeId: number; degree: string; university: string; specialization: string; gpa: number; degreeStartDate: any; degreeEndDate: any; }) {
    throw new Error('Method not implemented.');
  }

  logOut() {
    localStorage.removeItem('prospectiveusertoken')
    this.router.navigate(['/login'])
  }
}