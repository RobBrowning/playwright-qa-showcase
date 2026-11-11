export interface CustomerDetails {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const defaultCustomer: CustomerDetails = {
  firstName: 'Test',
  lastName: 'Customer',
  postalCode: 'TA9 3AA',
};
