import { IsNumber, Length } from 'class-validator';

export default class OrderLine {
  @Length(10, 10)
  order_id: string;

  @Length(10, 10)
  product_id: string;

  @IsNumber()
  quantity: number;
}
