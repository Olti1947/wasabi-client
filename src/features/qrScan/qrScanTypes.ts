import { Discount } from "../discount/discountTypes";

export interface UserScanInfo {
  id: number | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  discounts: Discount[] | null;
}
