import type { GolfCourse, TeeTime } from "@/types/golf";
import type { Booking } from "@/types/booking";

/**
 * Point d'extension majeur du projet : l'UI ne parle jamais directement
 * à localStorage. Une V2 pourra brancher une vraie API sans réécrire l'UI.
 */
export interface GolfRepository {
  getCourses(): Promise<GolfCourse[]> | GolfCourse[];
  getCourseBySlug(slug: string): Promise<GolfCourse | null> | GolfCourse | null;
  getCourseById(id: string): Promise<GolfCourse | null> | GolfCourse | null;
  getTeeTimes(golfId: string, date: string): Promise<TeeTime[]> | TeeTime[];
  getTeeTime(id: string): Promise<TeeTime | null> | TeeTime | null;
  updateTeeTime(teeTime: TeeTime): Promise<void> | void;
  createTeeTime(teeTime: TeeTime): Promise<void> | void;
  deleteTeeTime(id: string): Promise<void> | void;
  createBooking(booking: Booking): Promise<void> | void;
  getBooking(id: string): Promise<Booking | null> | Booking | null;
  resetDemoData(): Promise<void> | void;
}
