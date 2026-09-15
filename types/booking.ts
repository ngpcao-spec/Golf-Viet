export type Booking = {
  id: string;
  golfId: string;
  teeTimeId: string;
  date: string;
  time: string;
  players: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  status: "confirmed";
};
