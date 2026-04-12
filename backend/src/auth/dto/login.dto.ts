import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'you@company.com' })
  email!: string;

  @ApiProperty({ example: 'CorrectHorseBatteryStaple1' })
  password!: string;
}
