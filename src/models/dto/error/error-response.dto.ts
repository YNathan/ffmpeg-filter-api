import { ApiModel, ApiModelProperty } from "swagger-express-ts";

@ApiModel({
  description: "Error message",
  name: "ErrorResponseDto",
})
export class ErrorResponseDto {
  @ApiModelProperty({
    description: "name of the error",
    required: true,
  })
  name: string;

  @ApiModelProperty({
    description: "HTTP Response Code",
    required: true,
  })
  statusCode: number;

  @ApiModelProperty({
    description: "Internal error code",
    required: true,
  })
  errorCode: number;

  @ApiModelProperty({
    description: "error message text",
    required: true,
  })
  message: string;
}
