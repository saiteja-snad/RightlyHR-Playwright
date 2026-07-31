import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApprovalStatusCount } from '../Interfaces/timoff-model';
import moment from 'moment';
import { TenantService } from './tenant.service';
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  communicationService!: BehaviorSubject<any>;
  currentDate: Date = new Date();
  dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  };

  formattedDate = this.currentDate
  .toLocaleDateString('en-US', this.dateOptions)
  .replace(',', '');

  tirggerCountSignal = signal<{
    compOff: boolean;
    wfh: boolean;
    employeeId: number;
    permission: boolean;
    remote: boolean;
    global: boolean;
  }>({
    compOff: false,
    wfh: false,
    employeeId: 0,
    permission: false,
    remote: false,
    global: false,
  });
  tirggerPendingApprovalCountSignal = signal<{
    compOff: boolean;
    wfh: boolean;
    permission: boolean;
    separation: boolean;
    recall: boolean;
    expenses: boolean;
    nodue: boolean;
    timeoff: boolean;
    onboarding : boolean
  }>({
    compOff: false,
    wfh: false,
    permission: false,
    separation: false,
    recall: false,
    expenses: false,
    nodue: false,
    timeoff: false,
    onboarding : false
  });
  desklocationIdSubject = new BehaviorSubject<string | null>(null);
  desksublocationIdSubject = new BehaviorSubject<string | null>(null);
  assetslocationIdSubject = new BehaviorSubject<string | null>(null);
  assetssublocationIdSubject = new BehaviorSubject<string | null>(null);
  assetscategoryIdSubject = new BehaviorSubject<string | null>(null);
  assetssubcategeoryIdSubject = new BehaviorSubject<string | null>(null);
  assetsdaterangeIdSubject = new BehaviorSubject<string | null>(null);
  reviewCycleTriggerSignal = signal<boolean>(false);
  wfhTriggerSignal = signal<boolean>(false);
  permissionTriggerSignal = signal<boolean>(false);
  compOffTriggerSignal = signal<number>(0);
  cardsregisterSignal = signal<boolean>(false);
  constructor(private http: HttpClient, private tenantService: TenantService) {
    this.communicationService = new BehaviorSubject(null);
  }

  loginErrorSignal = signal<string>('');

  get ApiUrl(): string {
    
    return this.tenantService.currentApiUrl;
  }
  activeTabSubject = new BehaviorSubject<boolean>(false);
  activeTabStatus$ = this.activeTabSubject.asObservable();

  eventAddedSource = new Subject<void>();
  eventAdded$ = this.eventAddedSource.asObservable();
  // Function to notify that an event has been added
  notifyEventAdded() {
    this.eventAddedSource.next();
  }

  //state mangement
  private clickingonresourceSource = new BehaviorSubject<boolean>(false);
  clickingonresource$ = this.clickingonresourceSource.asObservable();

  notifyresource() {
    this.clickingonresourceSource.next(true);
  }

  //setting cards count
  private CardcountsSource = new BehaviorSubject<{ [key: string]: number }>({});
  counts$ = this.CardcountsSource.asObservable();
  updateCount(counts: { [key: string]: number }) {
    this.CardcountsSource.next(counts);
  }
  // Function to set the communication service data for basic info
  basicDetailes = new Subject<void>();
  basicDetailesadded$ = this.basicDetailes.asObservable();
  setBasicDetails() {
    this.basicDetailes.next();
  }

  // Function to set the communication service data for basic info
  profliepicDetailes = new Subject<void>();
  profliepicadd$ = this.profliepicDetailes.asObservable();
  setprofileDetails() {
    this.profliepicDetailes.next();
  }

  //funtion to call add desk
  deskadded = new Subject<void>();
  deskDetailesadded$ = this.deskadded.asObservable();
  setnewdeskDetails() {
    this.deskadded.next();
  }

  // Function to set the communication service data for basic info
  assetsadded = new Subject<void>();
  assetDetailesadded$ = this.assetsadded.asObservable();
  setnewassetsDetails() {
    this.assetsadded.next();
  }

  // Function to set the communication service data for basic info
  expensescount = new Subject<void>();
  expensesprocesscount$ = this.expensescount.asObservable();
  setnewcountDetails() {
    this.expensescount.next();
  }
  expensescountOnBehalfof = new Subject<void>();
  expensesprocesscountOnBehalfof$ = this.expensescountOnBehalfof.asObservable();
  setnewcountDetailsforonBehalfof() {
    this.expensescountOnBehalfof.next();
  }

  clientcount = new Subject<void>();
  clientcountfuntion$ = this.clientcount.asObservable();
  setnewcountDetailsfornewclient() {
    this.clientcount.next();
  }

  projectcount = new Subject<void>();
  projectcountfuntion$ = this.projectcount.asObservable();
  setnewcountDetailsfornewprojectcount() {
    this.projectcount.next();
  }

  projectphasecount = new Subject<void>();
  projectcountfuntionphases$ = this.projectphasecount.asObservable();
  setnewcountfornewprojectphasecount() {
    this.projectphasecount.next();
  }

  projectresourcecount = new Subject<void>();
  projectcountresource$ = this.projectresourcecount.asObservable();
  setnewcountfornewresourcecount() {
    this.projectresourcecount.next();
  }

  projectdocumentscount = new Subject<void>();
  projectcountdocuments$ = this.projectdocumentscount.asObservable();
  setnewcountfornewdocumentscount() {
    this.projectdocumentscount.next();
  }

  //Function to set the communication service data for basic info
  separationDetailes = new Subject<void>();
  separationDetailesadded$ = this.separationDetailes.asObservable();
  setseparationDetails() {
    this.separationDetailes.next();
  }

  // function for employeid timesheet
  private selectedEmployeeIdTimesheet = new BehaviorSubject<any>(null);
  // Observable for components to subscribe to
  selectedEmployeeIdTimesheet$ =
    this.selectedEmployeeIdTimesheet.asObservable();
  // Method to update the employeeId
  setEmployeeIdTimesheet(id: any, phaseId: number, request: any): void {
    this.selectedEmployeeIdTimesheet.next({ id, phaseId, request });
  }
  //holidays year
  public selectedYearSubject = new BehaviorSubject<number | null>(null);
  selectedYear$ = this.selectedYearSubject.asObservable();

  //holidays year
  setSelectedYear(year: number) {
    this.selectedYearSubject.next(year);
  }

  private triggerSignal = signal(false);
  readonly trigger = this.triggerSignal;
  triggerActionSignal() {
    this.triggerSignal.set(true);
  }

  resetTriggerSignal() {
    this.triggerSignal.set(false);
  }

  updateTabStatus(isActive: boolean) {
    this.activeTabSubject.next(isActive);
  }

  // set attendancelocking count
  private refreshTrigger = new Subject<void>();
  refresh$ = this.refreshTrigger.asObservable();
  triggerRefresh() {
    this.refreshTrigger.next();
  }

  // OnBehalf Of
  onBehalfOfTriggerSignal = signal<number>(0);
  desklocationId$ = this.desklocationIdSubject.asObservable();
  desksublocationId$ = this.desksublocationIdSubject.asObservable();

  // OnBehalfOf WFH
  onBehlafOfWFHSignal = signal<boolean>(false);
  onBehlafOfRemoteLoginSignal = signal<boolean>(false);
  onBehlafOfExpensesSignal = signal<boolean>(false);


  onBehalfOfWFHSelectedEmp$ = new BehaviorSubject<any>(null);
  onBehalfOfRemoteLoginSelectedEmp$ = new BehaviorSubject<any>(null);
  onBehalfOfExpensesSelectedEmp$ = new BehaviorSubject<any>(null);
  onBehalfOfSelectedEmpDetails$ = new BehaviorSubject<any>(null);

  setOnBehalfOfExpensesSelectedEmp(emp: any): void {
    this.onBehalfOfExpensesSelectedEmp$.next(emp);
    this.onBehlafOfExpensesSignal.set(true);
    console.log('Selected On Behalf Of Expenses Employee:', emp);
  }

// http.service.ts (add inside the service class)
private _onBehalfExpensesUpdated$ = new BehaviorSubject<number | null>(null);
public onBehalfExpensesUpdated$ = this._onBehalfExpensesUpdated$.asObservable();

setOnBehalfExpensesUpdated(empId: number | null) {
  // push empId (or null) to notify subscribers
  this._onBehalfExpensesUpdated$.next(empId ?? null);
}


  // function for employeid TIMEOFF
  private selectedEmployeeIdTimeoff = new BehaviorSubject<any>(null);

  // Observable for components to subscribe to
  selectedEmployeeIdTimeoff$ = this.selectedEmployeeIdTimeoff.asObservable();

  // Method to update the employeeId
  setEmployeeIdTimeoff(id: any): void {
    this.selectedEmployeeIdTimeoff.next(id);
  }

  // Add this getter 👇
  getCurrentEmployeeIdTimeoff(): any {
    return this.selectedEmployeeIdTimeoff.getValue();
  }

  private selectedEmployeeIdExpenses = new BehaviorSubject<any>(null);
  // Observable for components to subscribe to
  selectedEmployeeIdExpenses$ = this.selectedEmployeeIdExpenses.asObservable();
  // Method to update the employeeId
  setEmployeeIdExpenses(id: any): void {
    this.selectedEmployeeIdExpenses.next(id);
    console.log('Selected Employee Expenses ID:', id);
  }

  // function for employeid COMPOFF
  private selectedEmployeeIdCompOff = new BehaviorSubject<any>(null);
  // Observable for components to subscribe to
  selectedEmployeeIdCompOff$ = this.selectedEmployeeIdCompOff.asObservable();
  // Method to update the employeeId
  setEmployeeIdCompOff(id: any): void {
    this.selectedEmployeeIdCompOff.next(id);
  }

  private selectedEmployeeIdExpensesforonbehalf = new BehaviorSubject<string | null>(null);
  // Observable for components to subscribe to
  selectedEmployeeIdExpensesforonbehalf$ = this.selectedEmployeeIdExpensesforonbehalf.asObservable();
  // Method to update the employeeId
  setEmployeeIdExpensesforonbehalf(id:any | null): void {
    this.selectedEmployeeIdExpensesforonbehalf.next(id);
    console.log('Selected Employee Expenses ID:', id);
  }

  // function for employeid wfh
  private selectedEmployeeIdWFH = new BehaviorSubject<any>(null);
  // Observable for components to subscribe to
  selectedEmployeeIdWFH$ = this.selectedEmployeeIdWFH.asObservable();
  // Method to update the employeeId
  setEmployeeIdWFH(id: any): void {
    this.selectedEmployeeIdWFH.next(id);
  }

  // function for employeid remote login
  private selectedEmployeeIdRemoteLogin = new BehaviorSubject<any>(null);
  // Observable for components to subscribe to
  selectedEmployeeIdRemoteLogin$ =
    this.selectedEmployeeIdRemoteLogin.asObservable();
  // Method to update the employeeId
  setEmployeeIdRemoteLogin(id: any): void {
    this.selectedEmployeeIdRemoteLogin.next(id);
  }

  // function for employeid permission
  private selectedEmployeeIdPermission = new BehaviorSubject<any>(null);
  // Observable for components to subscribe to
  selectedEmployeeIdPermission$ =
    this.selectedEmployeeIdPermission.asObservable();
  // Method to update the employeeId
  setEmployeeIdPermission(id: any): void {
    this.selectedEmployeeIdPermission.next(id);
  }

  // function for employeid regularization
  private selectedEmployeeIdRegularization = new BehaviorSubject<any>(null);
  // Observable for components to subscribe to
  selectedEmployeeIdRegularization$ =
    this.selectedEmployeeIdRegularization.asObservable();
  // Method to update the employeeId
  setEmployeeIdRegularization(id: any): void {
    this.selectedEmployeeIdRegularization.next(id);
  }

  // function for employeid itsupport team ticket
  private refreshSubject = new Subject<void>();
  refreshRequested$ = this.refreshSubject.asObservable();
  // Method to update the employeeId
  requestRefresh() {
    this.refreshSubject.next();
  }

  //function to update the desk Updatelocation
  deskUpdateLocationId(id: string | null) {
    this.desklocationIdSubject.next(id);
  }

  //function to update the desk sublocation
  deskUpdateSubLocationId(id: string | null) {
    this.desksublocationIdSubject.next(id);
  }

  assetslocationId$ = this.assetslocationIdSubject.asObservable();
  assetssublocationId$ = this.assetssublocationIdSubject.asObservable();
  assetscategoryId$ = this.assetscategoryIdSubject.asObservable();
  assetssubcategeoryId$ = this.assetssubcategeoryIdSubject.asObservable();
  assetsdaterangeId$ = this.assetsdaterangeIdSubject.asObservable();
  //function to update the desk Updatelocation
  assetsUpdateLocationId(id: string | null) {
    this.assetslocationIdSubject.next(id);
  }

  //function to update the desk sublocation
  assetsUpdateSubLocationId(id: string | null) {
    this.assetssublocationIdSubject.next(id);
  }
  //function to update the desk sublocation
  assetsUpdateCatageoryId(id: string | null) {
    this.assetscategoryIdSubject.next(id);
  }
    //function to update the desk sublocation
  assetsUpdateSubCatageoryId(id: string | null) {
    this.assetssubcategeoryIdSubject.next(id);
  }
    // ---------- FROM DATE ----------
  private fromDateSubject = new BehaviorSubject<string | null>(null);
  fromDate$ = this.fromDateSubject.asObservable();

  assetsUpdateFromDate(date: string | null) {
    this.fromDateSubject.next(date);
  }

  // ---------- TO DATE ----------
  private toDateSubject = new BehaviorSubject<string | null>(null);
  toDate$ = this.toDateSubject.asObservable();

  assetsUpdateToDate(date: string | null) {
    this.toDateSubject.next(date);
  }

//availlableSearchCount = new BehaviorSubject<number>(0);
setAvaillableSearchCount(count: number) {
  //this.availlableSearchCount.next(count);
     this.avilableassetCountSubject.next(count);

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
      .get('../assets/offer.docx', { responseType: 'arraybuffer' })
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
  getItembyid(url: string, params?: any) {
    return this.http.get(`${this.ApiUrl}${url}`, { params });
  }

  getData(url: string) {
    return this.http.get(`${this.ApiUrl}${url}`);
  }

  getAllSignatureEmployeesData(url: string) {
    return this.http.get(`${this.ApiUrl}${url}`);
  }

  employeeSignatureAuthority(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);
  }

  deleteSignatureEmployee(url: string) {
    return this.http.post(`${this.ApiUrl}${url}`, {});
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
    return this.http.get(`${this.ApiUrl}${url}`, options);
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

  DownloadDataWithQuerydata(endpoint: string, params: any): Observable<any> {
    return this.http.post(endpoint, params, {
      observe: 'response',
      responseType: 'blob',
    });
  }
   downloadEmployeeSkillsReport(url: string, isActive: boolean, resourceStatus?: string, searchQuery?: string, fromDate?: string, toDate?: string, skillSearch?: string ,departmentIds?:string ,projectIds?:string): Observable<Blob> {
    let apiUrl = `${this.ApiUrl}${url}?isActive=${isActive}`;

    if (resourceStatus) apiUrl += `&resourceStatus=${resourceStatus}`;
    if (searchQuery)
      apiUrl += `&searchQuery=${encodeURIComponent(searchQuery)}`;
    if (fromDate && toDate) apiUrl += `&fromDate=${fromDate}&toDate=${toDate}`;
    if (skillSearch) apiUrl += `&skillSearch=${encodeURIComponent(skillSearch)}`;
    if (departmentIds) apiUrl += `&departmentIds=${encodeURIComponent(departmentIds)}`;
    if (projectIds) apiUrl += `&projectIds=${encodeURIComponent(projectIds)}`;

    return this.http.get(apiUrl, {
      responseType: 'blob',
    });
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

  postText(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data, { responseType: 'text' });
  }




  postbyId(url: string) {
    return this.http.post(`${this.ApiUrl}${url}`, {}); // empty body for POST
  }

  /* to the post dynamic form details*/
  postData(url: string, data: any, options: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data, options);
  }

  createExpense(url: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.ApiUrl}${url}`, data);
  }

  getstatusdesk(
    url: string,
    selectedLocationId: any,
    selectedSubLocationId: any,
    status: string,
    page: number,
    pageSize: number,
    searchQuery: string
  ): any {
    const params: { [key: string]: any } = {
      locationid: selectedLocationId,
      sublocationid: selectedSubLocationId,
      DeskStatus: status,
      pageNumber: page,
      pageSize: pageSize,
      searchQuery: searchQuery ? encodeURIComponent(searchQuery) : undefined,
    };
    // Build the query string dynamically, excluding null or undefined values
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined) // Exclude null/undefined values
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    // Construct the full URL
    const dataUrl = `${this.ApiUrl}${url}?${queryString}`;
    // Make the HTTP GET request
    return this.http.get(dataUrl);
  }

  getassetsdesk(
    url: string,
    selectedLocationId: any,
    selectedSubLocationId: any,
    category:any,
    subcatageory:any,
    fromDate:any,
    toDate:any,
    status: string,
    page: number,
    pageSize: number,
    searchQuery: string
  ): any {
    const params: { [key: string]: any } = {
      locationid: selectedLocationId,
      sublocationid: selectedSubLocationId,
      category:category,
      subcategory:subcatageory,
      fromDate:fromDate,
      toDate:toDate,
      status: status,
      page: page,
      pageSize: pageSize,
      searchQuery: searchQuery ? encodeURIComponent(searchQuery) : undefined,
    };
    // Build the query string dynamically, excluding null or undefined values
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined) // Exclude null/undefined values
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    // Construct the full URL
    const dataUrl = `${this.ApiUrl}${url}?${queryString}`;
    // Make the HTTP GET request
    return this.http.get(dataUrl);
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

  /* put with options */
  put(url: string, data: any, options: any) {
    return this.http.put(`${this.ApiUrl}${url}`, data, options);
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
  upadteLateLoginValues(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);
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

  getDatabyentityvalueForFieldUpdate(url: string, _params?: any, _param?: any) {
    const data_url = `${this.ApiUrl}${url}?tabName=${_params}&moduleName=${_param}`;
    return this.http.get(data_url);
  }

  getDatabypermissions(url: string, _params?: any, _param?: any, paramvalue?: string) {
    const data_url = `${this.ApiUrl}${url}?RaisedFor=${_params}&RequestedBy=${_param}&Status=${paramvalue}`;
    return this.http.get(data_url);
  }

  deleteData(url: string) {
    return this.http.delete(`${this.ApiUrl}${url}`);
  }
  //get card details
  getcardDetails(
    url: string,
    pagenum: number,
    pagesize: number,
    searchparam?: string,
    status?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', pagenum.toString())
      .set('pageSize', pagesize.toString());
    if (searchparam) params = params.set('search', searchparam);
    if (status) params = params.set('status', status);

    return this.http.get<any>(`${this.ApiUrl}${url}`, { params });
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

  downloadMonthlyAttendanceReportV2(url: string, startDate: string, endDate: string): Observable<Blob> {
    const apiurl = `${this.ApiUrl}${url}?startDate=${startDate}&endDate=${endDate}`;
    // Make the GET request and return the file as a Blob
    return this.http.get(apiurl, {
      responseType: 'blob', // Set response type to 'blob' to handle file download
    });
  }
  downloadTimesheetReport(url: string): Observable<HttpResponse<Blob>> {
    const apiurl = `${this.ApiUrl}${url}`;
    return this.http.get(apiurl, {
      responseType: 'blob',
      observe: 'response', // 👈 allows access to headers
    });
  }

    downloadTimesheetReportPost(url: string, body: any): Observable<HttpResponse<Blob>> {
    const apiurl = `${this.ApiUrl}${url}`;
    return this.http.post(apiurl, body, {
      responseType: 'blob',
      observe: 'response'
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

  getAllPendingApprovalsCount(
    moduleId?: number,
    employeeId?: number
  ): Observable<ApprovalStatusCount[]> {
    let params = new HttpParams();
    if (moduleId !== undefined && moduleId !== null) {
      params = params.set('moduleId', moduleId.toString());
    }
    if (employeeId !== undefined && employeeId !== null) {
      params = params.set('EmployeeId', employeeId.toString());
    }
    return this.http.get<ApprovalStatusCount[]>(
      `${this.ApiUrl}PendingApproval/getApprovalStatusCounts`,
      { params }
    );
  }

  deskTotalCountSubject = new BehaviorSubject<number>(0);
  deskAvailableCountSubject = new BehaviorSubject<number>(0);
  deskAllocatedCountSubject = new BehaviorSubject<number>(0);
  deskUndermaindanaenceCountSubject = new BehaviorSubject<number>(0);
  deskinactiveCountSubject = new BehaviorSubject<number>(0);
  deskWiatingforapprovalCountsubject = new BehaviorSubject<number>(0);
  setTotalDeskCount(count: number) {
    this.deskTotalCountSubject.next(count);
  }

  setAllocatedDeskCount(count: number) {
    this.deskAllocatedCountSubject.next(count);
  }

  setAvailableDeskCount(count: number) {
    this.deskAvailableCountSubject.next(count);
  }

  setundermatinaceDeskCount(count: number) {
    this.deskUndermaindanaenceCountSubject.next(count);
  }

  setinactiveSubjectDeskCount(count: number) {
    this.deskinactiveCountSubject.next(count);
  }

  setWFASubjectDeskCount(count: number) {
    this.deskWiatingforapprovalCountsubject.next(count);
  }

  assetCountSubject = new BehaviorSubject<number>(0);
  avilableassetCountSubject = new BehaviorSubject<number>(0);
  allocatedassetCountSubject = new BehaviorSubject<number>(0);
  undermatinaceassetCountSubject = new BehaviorSubject<number>(0);
  inactiveaceassetCountSubject = new BehaviorSubject<number>(0);
   blockassetCountSubject = new BehaviorSubject<number>(0);
  setAssetCount(count: number) {
    this.assetCountSubject.next(count);
  }

  setavilableAssetCount(count: any) {
    this.avilableassetCountSubject.next(count);
  }

  setallocatedAssetCount(count: any) {
    this.allocatedassetCountSubject.next(count);
  }
setAllocatedSearchCount(count: any) {
     this.allocatedassetCountSubject.next(count);
}
  setundermatinaceAssetCount(count: any) {
    this.undermatinaceassetCountSubject.next(count);
  }
  setundermatinaceSearchCount(count: any) {
     this.undermatinaceassetCountSubject.next(count);
}
 setblockAssetCount(count: any) {
    this.blockassetCountSubject.next(count);
  }

setblockSearchCount(count: any) {
     this.blockassetCountSubject.next(count);
}
  setinactiveSubjectAssetCount(count: any) {
    this.inactiveaceassetCountSubject.next(count);
  }

setinactiveSearchCount(count: any) {
     this.inactiveaceassetCountSubject.next(count);
}
  getFilteredleavesDataByID(employeeId: number, params?: any) {
    return this.http.get(`${this.ApiUrl}Timeoff/${employeeId}?year=${params}`);
  }

  getFilterCompoffDataByID(employeeId: number, params?: any) {
    return this.http.get(
      `${this.ApiUrl}Timeoff/getCompoffRequests/${employeeId}?year=${params}`
    );
  }

  getFilterRemoteLoginDataByID(employeeId: number, params?: any) {
    return this.http.get(
      `${this.ApiUrl}Timeoff/getRemoteLoginRequests/${employeeId}?year=${params}`
    );
  }

  getFilterWFHDataByID(employeeId: number, params?: any) {
    return this.http.get(
      `${this.ApiUrl}Timeoff/getWorkFromHomeRequests/${employeeId}?year=${params}`
    );
  }


  getFilterOnBehalfWFHDataByID(employeeId: number, params?: any) {
    return this.http.get(
      `${this.ApiUrl}Timeoff/getOnBehlfOfWorkFromHomeRequests/${employeeId}?year=${params}`
    );
  }

  getFilterOnBehalfRemoteLoginDataByID(employeeId: number, params?: any) {
    return this.http.get(
      `${this.ApiUrl}Timeoff/getOnBehlfOfRemoteLoginRequests/${employeeId}?year=${params}`
    );
  }

  getFilterRegularizationDataByID(employeeId: number, params?: any) {
    return this.http.get(
      `${this.ApiUrl}RegularizationRequests/attendance/${employeeId}?year=${params}`
    );
  }

  getFilterExtraHoursDataByID(employeeId: number, params?: any) {
    return this.http.get(
      `${this.ApiUrl}RegularizationRequests/loggedextrahours/${employeeId}?year=${params}`
    );
  }

  getFilterPermissionDataByID(employeeId: number, params?: any) {
    return this.http.get(
      `${this.ApiUrl}RegularizationRequests/${employeeId}?year=${params}`
    );
  }

  // to store clientid in timesheet module project management
  clientIdSubject = new BehaviorSubject<number>(0);
  clientId$ = this.clientIdSubject.asObservable();
  updateClientId(clientId: number) {
    this.clientIdSubject.next(clientId);
  }

  // Function to set the communication service data for PRoject info
  projectadded = new Subject<void>();
  projectDetailesadded$ = this.projectadded.asObservable();
  setnewprojectDetails() {
    this.projectadded.next();
  }

   probationcounts = new Subject<void>();
  probationcountfuntion$ = this.probationcounts.asObservable();
  setnewprobationDetails() {
    this.probationcounts.next();
  }
  //for contactadded  for projects and clients
  contactadded = new Subject<void>();
  contactDetailesadded$ = this.contactadded.asObservable();
  setnewcontactDetails() {
    this.contactadded.next();
  }

  requestSource = new BehaviorSubject<any>(null); // holds last submitted request
  request$ = this.requestSource.asObservable();
  setRequest(request: any) {
    this.requestSource.next(request);
  }

  private requestclienttimesheetdataSubject = new BehaviorSubject<any>(null); // holds last submitted request
  requestclienttimesheetdata$ =
    this.requestclienttimesheetdataSubject.asObservable();

  setRequestclienttimesheet(request: any) {
    this.requestclienttimesheetdataSubject.next(request);
  }

  clearRequestclienttimesheet() {
    this.requestclienttimesheetdataSubject.next(null);
  }

  //for ProjectResource  for projects and clients
  resourceadded = new Subject<void>();
  resourceDetailesadded$ = this.resourceadded.asObservable();
  setnewresourceDetails() {
    this.resourceadded.next();
  }

  //for documentsadded  for projects and clients
  documentsadded = new Subject<void>();
  documentsDetailesadded$ = this.documentsadded.asObservable();
  setnewdocumentsDetails() {
    this.documentsadded.next();
  }

  DeleteData(url: string, body?: any) {
    return this.http.delete(`${this.ApiUrl}${url}`, { body });
  }
  // DATE RANGE
  private dateRangeSubject = new BehaviorSubject<{
    startDate: string | null;
    endDate: string | null;
  } | null>(null);

  // Set date range
  setDateRange(startDate: string | null, endDate: string | null) {
    this.dateRangeSubject.next({ startDate, endDate });
  }

  // Get as observable (for subscription)
  getDateRangeObservable() {
    return this.dateRangeSubject.asObservable();
  }

  //  Get current value (synchronous)
  getCurrentDateRange() {
    return this.dateRangeSubject.getValue();
  }
  // team timesheet summery
  //  Set data (e.g., after selecting date range and employee)
  private teamdateRangeSubject = new BehaviorSubject<any>({
    startDate: null,
    endDate: null,
    employeeId: null,
    employeeName: null,
  });
  setteamDateRange(
    startDate: string | null,
    endDate: string | null,
    employeeId?: string | null,
    employeeName?: string
  ) {
    this.teamdateRangeSubject.next({
      startDate,
      endDate,
      employeeId,
      employeeName,
    });
  }

  //  Get as observable (subscribe in other component)
  getteamDateRangeObservable() {
    return this.teamdateRangeSubject.asObservable();
  }

  // Get current value synchronously (optional)
  getteamCurrentDateRange() {
    return this.teamdateRangeSubject.getValue();
  }
  clearTeamDateRange() {
    this.teamdateRangeSubject.next({
      startDate: null,
      endDate: null,
      employeeId: null,
      employeeName: null,
    });
  }

  private timesheetFiltersSubject = new BehaviorSubject<any>(null);

  setTimesheetFilters(filters: any) {
    this.timesheetFiltersSubject.next(filters);
  }

  getTimesheetFilters() {
    return this.timesheetFiltersSubject.asObservable();
  }

  clearTimesheetFilters() {
    this.timesheetFiltersSubject.next(null);
  }

  //  Example API call
  getDatEdATA(url: string) {
    return this.http.get(url);
  }

  phaseadded = new Subject<void>();
  phaseDetailesadded$ = this.phaseadded.asObservable();
  setnewPhaseDetails() {
    this.phaseadded.next();
  }
  // store department id
  private departmentIdsSource = new BehaviorSubject<number[] | null>(null);
  selectedDepartmentIds$ = this.departmentIdsSource.asObservable();

  setDepartmentIds(ids: number[]) {
    this.departmentIdsSource.next(ids);
  }

  resetProjectPagination() {
    const currentValue = this.departmentIdsSource.getValue();
    this.departmentIdsSource.next(currentValue);
  }

  // update count
pendingApprovalCount$ = new BehaviorSubject<any[]>([]);
updatePendingApprovalCounts(counts: any[]) {
  this.pendingApprovalCount$.next(counts);
}

  //store project types
  private projectTypeFilterSource = new BehaviorSubject<string[]>([]);
  projectTypeFilter$ = this.projectTypeFilterSource.asObservable();

  setProjectTypeFilter(types: string[]) {
    this.projectTypeFilterSource.next(types || []);
  }

  clearProjectTypeFilter() {
    this.projectTypeFilterSource.next([]);
  }

  // store phases statuses
  private phaseStatusFilterSource = new BehaviorSubject<string[]>([]);

  phaseStatusFilter$ = this.phaseStatusFilterSource.asObservable();

  setPhaseStatusFilter(statuses: string[]) {
    this.phaseStatusFilterSource.next(statuses || []);
  }

  clearPhaseStatusFilter() {
    this.phaseStatusFilterSource.next([]);
  }

  // store date time statuses
  private phaseDateFilterSource = new BehaviorSubject<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });

  phaseDateFilter$ = this.phaseDateFilterSource.asObservable();

  setPhaseDateFilter(filter: {
    startDate: string | null;
    endDate: string | null;
  }) {
    this.phaseDateFilterSource.next(filter);
  }

  clearPhaseDateFilter() {
    this.phaseDateFilterSource.next({ startDate: null, endDate: null });
  }

  // store Timesheet Approval Authority
  private phaseAuthorityFilterSource = new BehaviorSubject<number[]>([]);

  phaseAuthorityFilter$ = this.phaseAuthorityFilterSource.asObservable();

  setPhaseAuthorityFilter(authorityIds: number[]) {
    this.phaseAuthorityFilterSource.next(authorityIds || []);
  }

  clearPhaseAuthorityFilter() {
    this.phaseAuthorityFilterSource.next([]);
  }

  //store role in timesheet summary
  private clientTimesheetRoleFilterSource = new BehaviorSubject<number[]>([]);

  clientTimesheetRoleFilter$ =
    this.clientTimesheetRoleFilterSource.asObservable();

  setClientTimesheetRoleFilter(roleIds: number[]) {
    this.clientTimesheetRoleFilterSource.next(roleIds || []);
  }

  clearClientTimesheetRoleFilter() {
    this.clientTimesheetRoleFilterSource.next([]);
  }

  // store phase in timsheet sunnary
  private clientTimesheetPhaseFilterSource = new BehaviorSubject<number[]>([]);

  clientTimesheetPhaseFilter$ =
    this.clientTimesheetPhaseFilterSource.asObservable();

  setClientTimesheetPhaseFilter(phaseIds: number[]) {
    this.clientTimesheetPhaseFilterSource.next(phaseIds || []);
  }

  clearClientTimesheetPhaseFilter() {
    this.clientTimesheetPhaseFilterSource.next([]);
  }

    // store project in timsheet sunnary
  private clientTimesheetProjectFilterSource = new BehaviorSubject<number[]>([]);

  clientTimesheetProjectFilter$ =
    this.clientTimesheetProjectFilterSource.asObservable();

  setClientTimesheetProjectFilter(projectIds: number[]) {
    this.clientTimesheetProjectFilterSource.next(projectIds || []);
  }

  clearClientTimesheetProjectFilter() {
    this.clientTimesheetProjectFilterSource.next([]);
  }
  // Resource filters
  private resourceRoleFilterSource = new BehaviorSubject<number[]>([]);
  resourceRoleFilter$ = this.resourceRoleFilterSource.asObservable();

  setResourceRoleFilter(roleIds: number[]) {
    this.resourceRoleFilterSource.next(roleIds || []);
  }

  clearResourceRoleFilter() {
    this.resourceRoleFilterSource.next([]);
  }

  private resourcePhaseFilterSource = new BehaviorSubject<number[]>([]);
  resourcePhaseFilter$ = this.resourcePhaseFilterSource.asObservable();

  setResourcePhaseFilter(phaseIds: number[]) {
    this.resourcePhaseFilterSource.next(phaseIds || []);
  }

  clearResourcePhaseFilter() {
    this.resourcePhaseFilterSource.next([]);
  }

  private resourceAuthorityFilterSource = new BehaviorSubject<number[]>([]);
  resourceAuthorityFilter$ = this.resourceAuthorityFilterSource.asObservable();

  setResourceAuthorityFilter(authorityIds: number[]) {
    this.resourceAuthorityFilterSource.next(authorityIds || []);
  }

  clearResourceAuthorityFilter() {
    this.resourceAuthorityFilterSource.next([]);
  }

  private resourceProjectFilterSource = new BehaviorSubject<number[]>([]);
  resourceProjectFilter$ = this.resourceProjectFilterSource.asObservable();

  setResourceProjectFilter(projectIds: number[]) {
    this.resourceProjectFilterSource.next(projectIds || []);
  }

  clearResourceProjectFilter() {
    this.resourceProjectFilterSource.next([]);
  }

  // Project Timesheet Summary Filters
  private projectTimesheetDepartmentIds = new BehaviorSubject<number[]>([]);
  projectTimesheetDepartmentIds$ =
    this.projectTimesheetDepartmentIds.asObservable();

  private projectTimesheetRoleFilter = new BehaviorSubject<number[]>([]);
  projectTimesheetRoleFilter$ = this.projectTimesheetRoleFilter.asObservable();

  private projectTimesheetPhaseFilter = new BehaviorSubject<number[]>([]);
  projectTimesheetPhaseFilter$ =
    this.projectTimesheetPhaseFilter.asObservable();

  private projectTimesheetProjectFilter = new BehaviorSubject<number[]>([]);
  projectTimesheetProjectFilter$ =
    this.projectTimesheetProjectFilter.asObservable();

  private projectTimesheetFilterData = new BehaviorSubject<any>(null);
  projectTimesheetFilterData$ = this.projectTimesheetFilterData.asObservable();

  // help desk
 // ✅ 1. Create BehaviorSubject
  private ticketCountSubject = new BehaviorSubject<any>(null);

  // ✅ 2. Expose as observable
  ticketCount$ = this.ticketCountSubject.asObservable();
 empinfo = JSON.parse(localStorage.getItem('currentUser') || '{}');
  // ✅ 3. Function to call count API and update subject
  refreshTicketCounts(empId?: number) {
    let url = `HelpDeskQueries/count?empId=${this.empinfo.employeeId}`;
    if (empId !== undefined && empId !== null) {
      url += `&empId=${empId}`;
    }
    this.getData(url).subscribe({
      next: (res: any) => {
        this.ticketCountSubject.next(res);
      },
      error: (err) => {
        console.error('Count API Error:', err);
      }
    });
  }
  private messageUpdateSource = new BehaviorSubject<boolean>(false);
messageUpdate$ = this.messageUpdateSource.asObservable();

notifyMessageUpdate() {
  this.messageUpdateSource.next(true);
}


  // Setters
  setProjectTimesheetDepartmentIds(ids: number[]) {
    this.projectTimesheetDepartmentIds.next(ids);
  }

  setProjectTimesheetRoleFilter(ids: number[]) {
    this.projectTimesheetRoleFilter.next(ids);
  }

  setProjectTimesheetPhaseFilter(ids: number[]) {
    this.projectTimesheetPhaseFilter.next(ids);
  }

   setProjectTimesheetProjectFilter(ids: number[]) {
    this.projectTimesheetProjectFilter.next(ids);
  }

  setProjectTimesheetFilterData(data: any) {
    this.projectTimesheetFilterData.next(data);
  }

  // Add these methods to your HttpService

  getCurrentProjectTimesheetDepartmentIds(): number[] {
    return this.projectTimesheetDepartmentIds.getValue();
  }

  getCurrentProjectTimesheetRoleIds(): number[] {
    return this.projectTimesheetRoleFilter.getValue();
  }

  getCurrentProjectTimesheetPhaseIds(): number[] {
    return this.projectTimesheetPhaseFilter.getValue();
  }

    getCurrentProjectTimesheetProjectIds(): number[] {
    return this.projectTimesheetProjectFilter.getValue();
  }

  clearProjectTimesheetFilters() {
    this.projectTimesheetDepartmentIds.next([]);
    this.projectTimesheetRoleFilter.next([]);
    this.projectTimesheetPhaseFilter.next([]);
    this.projectTimesheetProjectFilter.next([]);
    this.projectTimesheetFilterData.next(null);
  }

  getProjectResources(
    url: string,
    clientId?: number,
    projectId?: number,
    departmentId?: number,
    reportingManagerId?: number,
    statuses?: string
  ) {
    let params = new HttpParams();
    if (clientId) {
      params = params.set('clientId', clientId);
    }
    if (projectId) {
      params = params.set('projectIds', projectId);
    }
    if (departmentId) {
      params = params.set('departmentIds', departmentId);
    }
    if (reportingManagerId) {
      params = params.set('managerIds', reportingManagerId);
    }
    if (statuses) {
      params = params.set('statuses', statuses);
    }
    return this.http.get<any>(`${this.ApiUrl}${url}`, { params });
  }
  getProjectSummary(apiUrl: string, payload: any) {
    let params = new HttpParams();

    // Handle Date Range
    if (payload.dateRange && payload.dateRange[0] && payload.dateRange[1]) {
      const startDate = moment(payload.dateRange[0]).format('YYYY-MM-DD');
      const endDate = moment(payload.dateRange[1]).format('YYYY-MM-DD');

      params = params.set('startDate', startDate);
      params = params.set('endDate', endDate);
    }

    // Multi-values (comma separated)
    if (payload.clientId?.length) {
      params = params.set('clientId', payload.clientId.join(','));
    }

    if (payload.projectId?.length) {
      params = params.set('projectIds', payload.projectId.join(','));
    }

    if (payload.departmentId?.length) {
      params = params.set('departmentIds', payload.departmentId.join(','));
    }

    if (payload.tmorrmId?.length) {
      params = params.set('managerIds', payload.tmorrmId.join(','));
    }

    return this.http.get<any>(`${this.ApiUrl}${apiUrl}`, { params });
  }
   ratecardcount = new Subject<void>();
  ratecardcountfuntion$ = this.ratecardcount.asObservable();
  setnewcountDetailsforratecard() {
    this.ratecardcount.next();
  }

    getIsFromOnBehalfOfProbation(): boolean {
    try {
      const value = localStorage.getItem('IsFromOnBehalfOfProbation');

      if (value === null || value === undefined) {
        return false; // default fallback
      }

      // Handle both JSON-stored and plain string cases
      if (value === 'true' || value === 'false') {
        return value === 'true';
      }

      return JSON.parse(value) === true;
    } catch {
      return false; // safe fallback on parse error
    }
  }
  
  getEmployeesWithBreakdown(payload: any) {
    return this.http.post(
      `${this.ApiUrl}Employeedata/employees/with-leave-categories/v3`,
      payload
    );
  }
}
