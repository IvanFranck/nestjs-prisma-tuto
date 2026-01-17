import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Request } from 'express';

export const GetUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>();
        
        if(!request['user']) {
            return null;
        }

        return data ? request['user'][data] : request['user'] 
    } 
)
