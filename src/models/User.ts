import { IsEmail, Length } from 'class-validator';

export default class User {
  @Length(10, 10)
  id: string;

  @Length(1, 50)
  name: string;

  @Length(1, 50)
  @IsEmail()
  email: string;

  @Length(60, 60)
  password: string;
}
