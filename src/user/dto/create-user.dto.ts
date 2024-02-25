import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @IsString()
  @ApiProperty({ example: 'user@nomail.com' })
  username: string
  @IsString()
  @ApiProperty({ example: '12345' })
  password: string
}
