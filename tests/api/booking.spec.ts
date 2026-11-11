import { test, expect } from '../../src/fixtures/test';
import { buildBooking } from '../../src/api/BookingClient';

test.describe('Booking API', () => {
  test('health check responds @smoke', async ({ request }) => {
    const res = await request.get('/ping');
    expect(res.status()).toBe(201);
  });

  test('create then read a booking @smoke', async ({ bookings }) => {
    const payload = buildBooking();
    const created = await bookings.create(payload);

    expect(created.bookingid).toBeGreaterThan(0);
    expect(created.booking).toEqual(payload);

    const res = await bookings.get(created.bookingid);
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(payload);
  });

  test('filter by name finds the new booking', async ({ bookings }) => {
    const payload = buildBooking();
    const { bookingid } = await bookings.create(payload);

    const res = await bookings.list({ firstname: payload.firstname, lastname: payload.lastname });
    expect(res.ok()).toBeTruthy();
    const ids = ((await res.json()) as { bookingid: number }[]).map((b) => b.bookingid);
    expect(ids).toContain(bookingid);
  });

  test('update requires auth, and works with a token', async ({ bookings }) => {
    const { bookingid, booking } = await bookings.create(buildBooking());
    const changed = { ...booking, totalprice: 999, additionalneeds: 'Late checkout' };

    const denied = await bookings.update(bookingid, changed, 'invalid-token');
    expect(denied.status()).toBe(403);

    const token = await bookings.authToken();
    const ok = await bookings.update(bookingid, changed, token);
    expect(ok.status()).toBe(200);
    expect(await ok.json()).toEqual(changed);
  });

  test('delete removes the booking', async ({ bookings }) => {
    const { bookingid } = await bookings.create(buildBooking());
    const token = await bookings.authToken();

    const del = await bookings.delete(bookingid, token);
    expect(del.status()).toBe(201); // Restful-Booker quirk: 201, not 204. Documented, not a bug in our test.

    const gone = await bookings.get(bookingid);
    expect(gone.status()).toBe(404);
  });
});
