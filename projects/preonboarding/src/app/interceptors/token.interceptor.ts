import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Get the token from localStorage
  const token = localStorage.getItem('prospectiveusertoken');
  // Clone the request and add the token if available
  const authRequest = token ? req.clone({ setHeaders: {Authorization: `Bearer ${token}`}}) : req;
  // Pass the modified request to the next handler
  return next(authRequest);
};
