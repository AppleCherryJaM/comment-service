import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Matches,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'JohnDoe',
    description: 'Alphanumeric user name (latin letters and digits)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'User name must contain only latin letters and digits',
  })
  userName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'https://myhomepage.com', required: false })
  @IsOptional()
  @IsUrl()
  homePage?: string;

  @ApiProperty({
    description: 'Captcha ID returned by GET /api/captcha',
    required: false,
  })
  @IsOptional()
  @IsString()
  captchaId?: string;

  @ApiProperty({ description: 'User input for captcha code', required: false })
  @IsOptional()
  @IsString()
  captchaCode?: string;

  @ApiProperty({ example: 'Hello <strong>World</strong>!' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    description: 'Parent comment ID if replying to an existing comment',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;

  @ApiProperty({
    description: 'File URL if file was uploaded',
    required: false,
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ description: 'File type (IMAGE or TXT)', required: false })
  @IsOptional()
  @IsString()
  fileType?: string;
}
