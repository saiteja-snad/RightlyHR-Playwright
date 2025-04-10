import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment.dev';


@Injectable({
  providedIn: 'root',
})
export class HttpService {
  communicationService!: BehaviorSubject<any>;
  tirggerCountSignal = signal<{ compOff: boolean; wfh: boolean }>({
    compOff: false,
    wfh: false,
  });

  constructor(private http: HttpClient) {
    this.communicationService = new BehaviorSubject(null);
  }

  selectedCountryCodeSignal = signal<any>('');
  selectedCountryCode2Signal = signal<any>('');
  selectedworkcoutrycode = signal<any>('');
  selectedpersonalnumbercode = signal<any>('');

  ApiUrl = environment.ApiUrl;
  activeTabSubject = new BehaviorSubject<boolean>(false);
  activeTabStatus$ = this.activeTabSubject.asObservable();

  updateTabStatus(isActive: boolean) {
    this.activeTabSubject.next(isActive);
  }
  //to get the employee id
  employeeIdSubject = new BehaviorSubject<number>(0);
  employeeId$ = this.employeeIdSubject.asObservable();

  updateemployeeId(employeeid: number) {
    this.employeeIdSubject.next(employeeid);
  }
  //to get template on offer letter
  getTemplate(): Observable<ArrayBuffer> {
    return this.http
      .get('../assets/offer.docx', {
        responseType: 'arraybuffer',
      })
      .pipe(
        catchError((error) => {
          throw error; // You can handle the error more specifically here
        })
      );
  }

  getDatabyid(url: string, _params?: any) {
    const data_url = `${this.ApiUrl}${url}?EmployeeId=${_params}`;
    return this.http.get(data_url);
  }

  getitembyid(url: string, _params?: any) {
    const item_url = `${this.ApiUrl}${url}?Expenses_ID=${_params}`;
    return this.http.get(item_url);
  }

  getData(url: string) {
    return this.http.get(`${this.ApiUrl}${url}`);
  }

  postletters(url: string) {
    return this.http.post(`${this.ApiUrl}${url}`, {});
  }

  getDataIncludeParams(url: string, params?: any) {
    return this.http.get(`${this.ApiUrl}${url}`, { params });
  }

  getpagentiontData(url: string, params: any) {
    return this.http.get(`${this.ApiUrl}${url}`, { params });
  }

  get(url: string, options?: any) {
    return this.http.get(url, options);
  }
  getByDownload<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.get<T>(`${this.ApiUrl}${endpoint}`, options);
  }
  postfile<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.get<T>(`${this.ApiUrl}${endpoint}`, options);
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

  uploadfile(url: string, data: any) {
    const formData = new FormData();
    formData.append('Img', data.Img);
    formData.append('EmployeeId', data.EmployeeId);
    return this.http.post(`${this.ApiUrl}${url}`, formData);
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

  getDataWithQuery(url: string, directoryPath: string) {
    return this.http.get(`${this.ApiUrl}${url}?directoryPath=${directoryPath}`);
  }
  postDatareport(url: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return this.http.post(`${this.ApiUrl}${url}`, data, {
      headers,
      responseType: 'blob' as 'json',
    });
  }

  postdata(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);
  }
  /* to the post dynamic form details*/
  postData(url: string, data: any, options: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data, options);
  }
  createExpense(url: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.ApiUrl}${url}`, data);
  }

  postProbation(
    url: string,
    employeeId: number,
    referenceId: number,
    raisedbyempId: number
  ) {
    let params = new HttpParams()
      .set('employeeId', employeeId)
      .set('referenceId', referenceId)
      .set('currentApproverId', raisedbyempId);
    return this.http.post(`${this.ApiUrl}${url}`, null, { params });
  }

  putData(url: string, data: any) {
    return this.http.put(`${this.ApiUrl}${url}`, data);
  }

  putFormsData(url: string) {
    return this.http.put(`${this.ApiUrl}${url}`, null);
  }
  getfile(url: string, filename: string) {
    return this.http.get(`${this.ApiUrl}${url}` + filename, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  fileupload(url: string, file: any) {
    const formData = new FormData();
    formData.append('ImageFile', file);
    return this.http.post(`${this.ApiUrl}${url}`, formData);
  }

  getUserDetails(email: string) {
    return this.http.get(
      `${this.ApiUrl}Employeedata/GetemployeebyemailID?emailid=${email}`
    );
  }

  getDatabytype(url: string, _params?: any) {
    const data_url = `${this.ApiUrl}${url}?type=${_params}`;
    return this.http.get(data_url);
  }

  getDatabyentriyvalue(url: string, _params?: any, _param?: any) {
    const data_url = `${this.ApiUrl}${url}?entity=${_params}&attribute=${_param}`;
    return this.http.get(data_url);
  }

  getDatabypermissions(
    url: string,
    _params?: any,
    _param?: any,
    paramvalue?: string
  ) {
    const data_url = `${this.ApiUrl}${url}?RaisedFor=${_params}&RequestedBy=${_param}&Status=${paramvalue}`;
    return this.http.get(data_url);
  }

  deleteData(url: string) {
    return this.http.delete(`${this.ApiUrl}${url}`);
  }

  getDataWithQueryParams(url: string, queryParams: any) {
    const params = new URLSearchParams();
    for (let key in queryParams) {
      params.set(key, queryParams[key]);
    }

    return this.http.get(`${this.ApiUrl}${url}?${params.toString()}`);
  }

  updateCompOffEligibilityCriteriaValues(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);
  }

  updateWFHValues(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);
  }

  updatePermissionEligibilityValues(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);
  }
  downloadMonthlyAttendanceReport(
    url: string,
    month: string | null,
    year: number
  ): Observable<Blob> {
    const apiurl = `${this.ApiUrl}${url}?month=${month}&year=${year}`;

    // Make the GET request and return the file as a Blob
    return this.http.get(apiurl, {
      responseType: 'blob', // Set response type to 'blob' to handle file download
    });
  }

  // PMS Form Submission
  // getReviewCycles(url:string, searchQuery: string, page: number, pageSize: number): Observable<any> {
  //   let params = new HttpParams()
  //     .set('searchQuery', searchQuery)
  //     .set('page', page.toString())
  //     .set('pageSize', pageSize.toString());

  //   return this.http.get<any>(`${this.ApiUrl}${url}`, { params });
  // }

  getReviewCycles(
    url: string,
    pagenum: number,
    pagesize: number,
    searchparam?: string,
    employeeId?: string,
    name?: string,
    formStatus?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', pagenum.toString())
      .set('pageSize', pagesize.toString());

    if (searchparam) params = params.set('searchparam', searchparam);
    if (employeeId) params = params.set('employeeIds', employeeId);
    if (name) params = params.set('name', name);
    if (formStatus) params = params.set('formstatus', formStatus);

    return this.http.get<any>(`${this.ApiUrl}${url}`, { params });
  }
  getReviewCyclesteam(
    url: string,
    pagenum: number,
    pagesize: number,
    searchparam?: string,
    employeeId?: string,
    name?: string,
    formStatus?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', pagenum.toString())
      .set('pageSize', pagesize.toString());

    if (searchparam) params = params.set('searchparam', searchparam);
    if (employeeId) params = params.set('assessorempid', employeeId);
    if (name) params = params.set('name', name);
    if (formStatus) params = params.set('formstatus', formStatus);

    return this.http.get<any>(`${this.ApiUrl}${url}`, { params });
  }

  getAssesnmentFormById(
    url: string,
    reviewcycleitemid: number,
    employeeId: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.ApiUrl}${url.replace(
        '{reviewcycleitemid}',
        reviewcycleitemid.toString()
      )}?employeeId=${employeeId}`
    );
  }
}
