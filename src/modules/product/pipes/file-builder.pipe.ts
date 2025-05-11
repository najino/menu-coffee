import {
  HttpStatus,
  ParseFilePipe,
  ParseFilePipeBuilder,
} from '@nestjs/common';

export function FilePipeBuilder(isRequired: boolean = true): ParseFilePipe {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({ fileType: /^image\/(jpeg|png|jpg)$/ })
    .addMaxSizeValidator({
      maxSize: 5 * 1024 * 1024,
      message: 'photo must be lower than 5Mb',
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });
}
