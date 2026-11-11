import { type APIRequestContext, expect } from '@playwright/test';

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export interface CreatedBooking {
  bookingid: number;
  booking: Booking;
}

/**
 * Thin client for the public Restful-Booker API. Keeps endpoint knowledge in
 * one place so specs read as behaviour, not HTTP plumbing.
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  async authToken(): Promise<string> {
    // Restful-Booker documents these as its public demo admin credentials.
    const res = await this.request.post('/auth', {
      data: { username: 'admin', password: 'password123' },
    });
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { token?: string };
    expect(body.token, 'auth should return a token').toBeTruthy();
    return body.token as string;
  }

  async create(booking: Booking): Promise<CreatedBooking> {
    const res = await this.request.post('/booking', { data: booking });
    expect(res.status()).toBe(200);
    return (await res.json()) as CreatedBooking;
  }

  get(id: number) {
    return this.request.get(`/booking/${id}`);
  }

  list(params?: Record<string, string>) {
    return this.request.get('/booking', { params });
  }

  update(id: number, booking: Booking, token: string) {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: { Cookie: `token=${token}` },
    });
  }

  delete(id: number, token?: string) {
    return this.request.delete(`/booking/${id}`, {
      headers: token ? { Cookie: `token=${token}` } : {},
    });
  }
}

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const suffix = Date.now().toString(36);
  return {
    firstname: 'Showcase',
    lastname: `Tester-${suffix}`,
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-14' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
