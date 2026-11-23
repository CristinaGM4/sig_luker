import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SessionService } from './session.service';
import { isPrivateApi } from './pagination';
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionService);
  const token = session.token();
  const privateRequest = isPrivateApi(request.url);
  const authenticated =
    token && privateRequest
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;
  return next(authenticated).pipe(
    catchError((error: unknown) => {
      if (
        privateRequest &&
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        session.token() === token
      )
        session.clear();
      return throwError(() => error);
    }),
  );
};
