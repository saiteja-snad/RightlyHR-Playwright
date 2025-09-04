import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

describe('tokeninterceptorInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => tokeninterceptorInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
function tokeninterceptorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): any {
  throw new Error('Function not implemented.');
}

