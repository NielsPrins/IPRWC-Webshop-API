import { Length } from 'class-validator';

export default class Order {
  @Length(10, 10)
  id: string;

  @Length(10, 10)
  user_id: string;

  status: string;

  date: Date;
}
