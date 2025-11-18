import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApprovalStatusCount } from '../Interfaces/timoff-model';
@Injectable({
  providedIn: 'root',
})

export class HttpService {
  communicationService!: BehaviorSubject<any>;
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
  }>({
    compOff: false,
    wfh: false,
    permission: false,
    separation: false,
    recall: false,
    expenses: false,
    nodue: false,
    timeoff: false,
  });
  desklocationIdSubject = new BehaviorSubject<string | null>(null);
  desksublocationIdSubject = new BehaviorSubject<string | null>(null);
  assetslocationIdSubject = new BehaviorSubject<string | null>(null);
  assetssublocationIdSubject = new BehaviorSubject<string | null>(null);
  reviewCycleTriggerSignal = signal<boolean>(false);
  wfhTriggerSignal = signal<boolean>(false);
  permissionTriggerSignal = signal<boolean>(false);
  compOffTriggerSignal = signal<boolean>(false);
  cardsregisterSignal = signal<boolean>(false);
  constructor(private http: HttpClient) {
    this.communicationService = new BehaviorSubject(null);
  }

  ApiUrl = environment.ApiUrl;
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
  selectedEmployeeIdTimesheet$ = this.selectedEmployeeIdTimesheet.asObservable();
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
  onBehalfOfTriggerSignal = signal<boolean>(false);
  desklocationId$ = this.desklocationIdSubject.asObservable();
  desksublocationId$ = this.desksublocationIdSubject.asObservable();

  // OnBehalfOf WFH
  onBehlafOfWFHSignal = signal<boolean>(false);
  onBehlafOfRemoteLoginSignal = signal<boolean>(false);

  onBehalfOfWFHSelectedEmp$ = new BehaviorSubject<any>(null);
  onBehalfOfRemoteLoginSelectedEmp$ = new BehaviorSubject<any>(null);




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
  //function to update the desk Updatelocation
  assetsUpdateLocationId(id: string | null) {
    this.assetslocationIdSubject.next(id);
  }

  //function to update the desk sublocation
  assetsUpdateSubLocationId(id: string | null) {
    this.assetssublocationIdSubject.next(id);
  }

  //to get the employee id
  employeeIdSubject = new BehaviorSubject<number>(0);
  employeeId$ = this.employeeIdSubject.asObservable();
  updateemployeeId(employeeid: number) {
    this.employeeIdSubject.next(employeeid);
  }

  //to get template on offer letter
  getTemplate(): Observable<ArrayBuffer> {
    return this.http.get('../assets/offer.docx', { responseType: 'arraybuffer', }).pipe(
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
    return this.http.post(`${this.ApiUrl}${url}?directoryPath=${directoryPath}`, formData);
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
    return this.http.get(`${this.ApiUrl}${url}?fileName=${directoryPath}`, options);
  }

  DownloadDataWithQuerydata(endpoint: string, params: any): Observable<any> {
    return this.http.post(endpoint, params, {
      observe: 'response',
      responseType: 'blob',
    });
  }
  downloadEmployeeSkillsReport(url: string, isActive: boolean, resourceStatus?: string, searchQuery?: string, fromDate?: string, toDate?: string, skillSearch?: string): Observable<Blob> {
    let apiUrl = `${this.ApiUrl}${url}?isActive=${isActive}`;

    if (resourceStatus) apiUrl += `&resourceStatus=${resourceStatus}`;
    if (searchQuery) apiUrl += `&searchQuery=${encodeURIComponent(searchQuery)}`;
    if (fromDate && toDate) apiUrl += `&fromDate=${fromDate}&toDate=${toDate}`;
    if (skillSearch) apiUrl += `&skillSearch=${encodeURIComponent(skillSearch)}`;

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
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return this.http.post(`${this.ApiUrl}${url}`, data, {
      headers,
      responseType: 'blob' as 'json',
    });
  }

  postdata(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);
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

  getstatusdesk(url: string, selectedLocationId: any, selectedSubLocationId: any, status: string,
    page: number, pageSize: number, searchQuery: string): any {
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
    status: string,
    page: number,
    pageSize: number,
    searchQuery: string
  ): any {
    const params: { [key: string]: any } = {
      locationid: selectedLocationId,
      sublocationid: selectedSubLocationId,
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

  postProbation(url: string, employeeId: number, referenceId: number, raisedbyempId: number) {
    let params = new HttpParams().set('employeeId', employeeId).set('referenceId', referenceId).set('currentApproverId', raisedbyempId);
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
    return this.http.get(`${this.ApiUrl}Employeedata/GetemployeebyemailID?emailid=${email}`);
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
    status?: string,
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

  downloadMonthlyAttendanceReport(url: string, month: string | null, year: number): Observable<Blob> {
    const apiurl = `${this.ApiUrl}${url}?month=${month}&year=${year}`;
    // Make the GET request and return the file as a Blob
    return this.http.get(apiurl, {
      responseType: 'blob', // Set response type to 'blob' to handle file download
    });
  }
  downloadTimesheetReport(url: string): Observable<HttpResponse<Blob>> {
    const apiurl = `${this.ApiUrl}${url}`;
    return this.http.get(apiurl, {
      responseType: 'blob',
      observe: 'response'  // 👈 allows access to headers
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

  getAssesnmentFormById(url: string, reviewcycleitemid: number, employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.ApiUrl}${url.replace('{reviewcycleitemid}', reviewcycleitemid.toString())}?employeeId=${employeeId}`);
  }

  getAllPendingApprovalsCount(moduleId?: number, employeeId?: number): Observable<ApprovalStatusCount[]> {
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
  setAssetCount(count: number) {
    this.assetCountSubject.next(count);
  }

  setavilableAssetCount(count: number) {
    this.avilableassetCountSubject.next(count);
  }

  setallocatedAssetCount(count: number) {
    this.allocatedassetCountSubject.next(count);
  }

  setundermatinaceAssetCount(count: number) {
    this.undermatinaceassetCountSubject.next(count);
  }

  setinactiveSubjectAssetCount(count: number) {
    this.inactiveaceassetCountSubject.next(count);
  }

  getFilteredleavesDataByID(employeeId: number, params?: any) {
    return this.http.get(`${this.ApiUrl}Timeoff/${employeeId}?year=${params}`);
  }

  getFilterCompoffDataByID(employeeId: number, params?: any) {
    return this.http.get(`${this.ApiUrl}Timeoff/getCompoffRequests/${employeeId}?year=${params}`);
  }

  getFilterRemoteLoginDataByID(employeeId: number, params?: any) {
    return this.http.get(`${this.ApiUrl}Timeoff/getRemoteLoginRequests/${employeeId}?year=${params}`);
  }

  getFilterWFHDataByID(employeeId: number, params?: any) {
    return this.http.get(`${this.ApiUrl}Timeoff/getWorkFromHomeRequests/${employeeId}?year=${params}`);
  }

  getFilterOnBehalfWFHDataByID(employeeId: number, params?: any) {
    return this.http.get(`${this.ApiUrl}Timeoff/getOnBehlfOfWorkFromHomeRequests/${employeeId}?year=${params}`);
  }

  getFilterOnBehalfRemoteLoginDataByID(employeeId: number, params?: any) {
    return this.http.get(`${this.ApiUrl}Timeoff/getOnBehlfOfRemoteLoginRequests/${employeeId}?year=${params}`);
  }

  getFilterRegularizationDataByID(employeeId: number, params?: any) {
    return this.http.get(`${this.ApiUrl}RegularizationRequests/attendance/${employeeId}?year=${params}`);
  }

  getFilterExtraHoursDataByID(employeeId: number, params?: any) {
    return this.http.get(`${this.ApiUrl}RegularizationRequests/loggedextrahours/${employeeId}?year=${params}`);
  }

  getFilterPermissionDataByID(employeeId: number, params?: any) {
    return this.http.get(`${this.ApiUrl}RegularizationRequests/${employeeId}?year=${params}`);
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

  private requestclienttimesheetdataSubject = new BehaviorSubject<any>(null);// holds last submitted request
  requestclienttimesheetdata$ = this.requestclienttimesheetdataSubject.asObservable();

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
  private dateRangeSubject = new BehaviorSubject<{ startDate: string | null; endDate: string | null } | null>(null);

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
    employeeName: null
  });
  setteamDateRange(startDate: string | null , endDate: string | null , employeeId?: string | null, employeeName?: string) {
    this.teamdateRangeSubject.next({ startDate, endDate, employeeId, employeeName });
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
  this.teamdateRangeSubject.next({ startDate: null, endDate: null, employeeId: null,employeeName: null });
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
}