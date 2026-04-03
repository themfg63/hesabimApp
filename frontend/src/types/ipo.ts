export type IpoHeader = {
  id: number;
  code: string;
  companyName: string | null;
  offeringPrice: number;
  currentPrice: number;
  currency: string;
  status: string;
};

export type IpoSummaryItem = {
  id: number;
  code: string;
  companyName: string | null;
  offeringPrice: number;
  currentPrice: number;
  totalRequestedLot: number;
  totalPurchasedLot: number;
  totalCost: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalPendingCash: number;
  fullySold: boolean;
  positionCount: number;
  currency: string;
};

export type IpoPositionRow = {
  positionId: number;
  accountId: number;
  accountName: string;
  accountType: string | null;
  positionStatus: string;
  sold: boolean;
  requestedLotCount: number;
  purchasedLotCount: number | null;
  buyPrice: number;
  salePrice: number | null;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  profitLoss: number;
  pendingCash: number;
  notes: string | null;
  soldAt: string | null;
  currency: string;
};

export type IpoPortfolioSummary = {
  totalRequestedLot: number;
  totalPurchasedLot: number;
  totalCost: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalPendingCash: number;
  currency: string;
};

export type IpoPortfolioResponse = {
  ipo: IpoHeader;
  rows: IpoPositionRow[];
  summary: IpoPortfolioSummary;
};

export type CreateIpoPayload = {
  code: string;
  companyName?: string;
  offeringPrice: number;
  currentPrice?: number;
  currency?: string;
};

export type CreateIpoPositionPayload = {
  accountId: number;
  requestedLotCount: number;
  purchasedLotCount?: number;
  buyPrice?: number;
  buyDate?: string;
  notes?: string;
};

export type UpdateIpoPositionPayload = {
  accountId?: number;
  requestedLotCount?: number;
  purchasedLotCount?: number;
  buyPrice?: number;
  buyDate?: string;
  notes?: string;
};

export type SellIpoPositionPayload = {
  salePrice: number;
};