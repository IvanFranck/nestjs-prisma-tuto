import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class GenericValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const errors: string[] = [];

    // validations...

    // comment savoir quels champs valider ?
    // comment savoir quelles règles appliquer ?
    //

    return value;
  }
}
