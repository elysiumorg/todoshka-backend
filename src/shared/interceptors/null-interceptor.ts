import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class NullInterceptor implements NestInterceptor {
  constructor(private name: string) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((value) => {
        if (value === null)
          throw new NotFoundException(`${this.name} not found`);
        return value;
      }),
    );
  }
}
