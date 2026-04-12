import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'you@company.com' })
  email!: string;

  @ApiProperty({ example: 'Jane Cooper' })
  fullName!: string;

  @ApiProperty({ example: 'CorrectHorseBatteryStaple1' })
  password!: string;
}
