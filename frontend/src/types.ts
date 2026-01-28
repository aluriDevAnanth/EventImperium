export type UserT = {
  username: string;
  email: string;
  _id: string;
  type: "EventUser" | "Vendor" | "Guest";
};

export interface IGuest {
  _id?: string;
  email: string;
  status: "Appected" | "Rejected" | "Pending";
}

export interface IExpense {
  _id?: string;
  name?: string;
  amount?: number;
  paymentID?: string;
}

export interface VendorReview {
  rating: number;
  review: string;
  userID: string;
}

export interface Vendor {
  _id: string;
  vendorID: string;
  name: string;
  location: string;
  availability: boolean;
  pricing: number;
  services: string;
  reviews: VendorReview[];
}

export interface Eventt {
  _id: string;
  name: string;
  des: string;
  userID: string;
  datetime: string;
  location: string;
  budget: number;
  expenses: IExpense[];
  typee: string;
  thumbnail: string;
  invitation: string;
  guests: IGuest[];
  vendors: Vendor[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Chat {
  text: string;
  sender: string;
  reciever: string;
  senderDetails: UserT;
}
