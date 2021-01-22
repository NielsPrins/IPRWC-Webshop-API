import { IsNumber, Length } from 'class-validator';

export default class Product {
  @Length(10, 10)
  id: string;

  @Length(0, 50)
  title: string;

  @Length(0, 300)
  description: string;

  image: string;

  @IsNumber({
    maxDecimalPlaces: 2,
  })
  price: string;
}
