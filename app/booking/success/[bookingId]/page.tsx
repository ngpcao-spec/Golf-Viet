import type { Metadata } from "next";
import SuccessClient from "./SuccessClient";

export const metadata: Metadata = { title: "Đặt sân thành công — Viet Golf" };

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <SuccessClient bookingId={bookingId} />;
}
