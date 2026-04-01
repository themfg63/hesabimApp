export type Account = {
  id: number;
  accountName: string;
  accountType: string | null;
  currency: string;
};

export type CreateAccountPayload = {
  accountName: string;
  accountType?: string;
  currency?: string;
};