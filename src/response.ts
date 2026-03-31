export interface ResponseMeta {
  requestId?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
  rateLimitLimit?: number;
  rateLimitRemaining?: number;
  rateLimitReset?: number;
  dataSource?: string;
}

export interface VyncoResponse<T> {
  data: T;
  meta: ResponseMeta;
}

export function parseResponseMeta(headers: Headers): ResponseMeta {
  const meta: ResponseMeta = {};

  const requestId = headers.get("x-request-id");
  if (requestId) meta.requestId = requestId;

  const creditsUsed = headers.get("x-credits-used");
  if (creditsUsed) meta.creditsUsed = parseInt(creditsUsed, 10);

  const creditsRemaining = headers.get("x-credits-remaining");
  if (creditsRemaining) meta.creditsRemaining = parseInt(creditsRemaining, 10);

  const rateLimitLimit = headers.get("x-ratelimit-limit");
  if (rateLimitLimit) meta.rateLimitLimit = parseInt(rateLimitLimit, 10);

  const rateLimitRemaining = headers.get("x-ratelimit-remaining");
  if (rateLimitRemaining) meta.rateLimitRemaining = parseInt(rateLimitRemaining, 10);

  const rateLimitReset = headers.get("x-ratelimit-reset");
  if (rateLimitReset) meta.rateLimitReset = parseInt(rateLimitReset, 10);

  const dataSource = headers.get("x-data-source");
  if (dataSource) meta.dataSource = dataSource;

  return meta;
}
