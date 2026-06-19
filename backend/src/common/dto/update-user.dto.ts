import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsArray, IsString } from "class-validator";

export class UpdateRoleDto {
  @ApiProperty({ example: "admin", enum: ["user", "admin"] })
  @IsIn(["user", "admin"])
  role: "user" | "admin";
}

export class UpdateDevicesDto {
  @ApiProperty({
    example: ["DEVICE_ESP32_01", "DEVICE_ESP32_02"],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  deviceIds: string[];
}
