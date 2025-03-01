import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongodb";

export class User implements Document {
	@ApiProperty()
	username: string;

	@ApiProperty({ description: "user password" })
	password: string;
}
