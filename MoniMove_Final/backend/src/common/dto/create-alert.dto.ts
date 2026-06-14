import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';

export class CreateAlertDto {
  @ApiProperty({ example: 'DEVICE_ESP32_01', description: 'ID thiết bị IoT' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ example: 'Ngã đổ', description: 'Loại cảnh báo' })
  @IsString()
  @IsNotEmpty()
  alertType: string;

  @ApiProperty({ example: 'Thiết bị bị ngã với góc nghiêng 65°', description: 'Nội dung cảnh báo' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ example: 'critical', enum: ['critical', 'warning', 'info'] })
  @IsOptional()
  @IsIn(['critical', 'warning', 'info'])
  severity?: 'critical' | 'warning' | 'info';

  @ApiPropertyOptional({ example: 1718000000000, description: 'Unix timestamp ms' })
  @IsOptional()
  @IsNumber()
  timestamp?: number;

  @ApiPropertyOptional({ description: 'Tọa độ GPS khi xảy ra sự cố' })
  @IsOptional()
  location?: { lat: number; lng: number };

  @ApiPropertyOptional({ description: 'Email SOS để gửi thông báo khẩn cấp' })
  @IsOptional()
  @IsString()
  sosEmail?: string;
}
