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
  totalLot: number;
  totalCost: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
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
  lotCount: number;
  buyPrice: number;
  salePrice: number | null;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  profitLoss: number;
  soldAt: string | null;
  currency: string;
};

export type IpoPortfolioSummary = {
  totalLot: number;
  totalCost: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
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
  lotCount: number;
  buyPrice?: number;
  buyDate?: string;
  notes?: string;
};

export type SellIpoPositionPayload = {
  salePrice: number;
};