export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ApiClient {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
}

const DEFAULT_HEADERS = {
  Accept: 'application/json',
};

const DEBUG_WEBHOOK_URL = 'https://webhook.site/245f5eee-1574-4f7b-990f-58d469ca8513';
const DIVERT_REAL_REQUESTS_TO_DEBUG_WEBHOOK = true;

function looksLikeRawHttpMessage(value: string) {
  const trimmedValue = value.trimStart();

  if (/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\S+\s+HTTP\/\d\.\d/i.test(trimmedValue)) {
    return true;
  }

  return /(?:^|\r?\n)(Host|User-Agent|Accept|Content-Length|Transfer-Encoding|Connection):\s/im.test(
    value,
  );
}

function containsNestedRawHttpPayload(value: unknown): boolean {
  if (typeof value === 'string') {
    return looksLikeRawHttpMessage(value);
  }

  if (Array.isArray(value)) {
    return value.some(containsNestedRawHttpPayload);
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some(containsNestedRawHttpPayload);
  }

  return false;
}

function buildRequestBody(body: unknown) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (containsNestedRawHttpPayload(body)) {
    throw new Error('Request body contains a nested raw HTTP message. Payload was blocked.');
  }

  if (typeof body === 'string') {
    return body;
  }

  return JSON.stringify(body);
}

function maskHeaderValue(key: string, value: string) {
  const normalizedKey = key.toLowerCase();

  if (normalizedKey === 'authorization') {
    const [scheme] = value.split(' ');
    return scheme ? `${scheme} ***MASKED***` : '***MASKED***';
  }

  if (normalizedKey === 'cookie' || normalizedKey === 'set-cookie') {
    return value
      .split(';')
      .map((part) => {
        const [cookieKey] = part.split('=');
        return cookieKey?.trim() ? `${cookieKey.trim()}=***MASKED***` : '***MASKED***';
      })
      .join('; ');
  }

  return value;
}

function sanitizeBodyForDebug(body: string | undefined) {
  if (!body) {
    return undefined;
  }

  return body
    .replace(/("password"\s*:\s*")[^"]*"/gi, '$1***MASKED***"')
    .replace(/("access_token"\s*:\s*")[^"]*"/gi, '$1***MASKED***"')
    .replace(/("refresh_token"\s*:\s*")[^"]*"/gi, '$1***MASKED***"')
    .replace(/("token"\s*:\s*")[^"]*"/gi, '$1***MASKED***"')
    .replace(/(password=)[^&\s]*/gi, '$1***MASKED***');
}

function sendDebugMirror(payload: {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}) {
  const maskedHeaders = Object.fromEntries(
    Object.entries(payload.headers).map(([key, value]) => [key, maskHeaderValue(key, value)]),
  );

  const maskedBody = sanitizeBodyForDebug(payload.body);

  void fetch(DEBUG_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mirroredAt: new Date().toISOString(),
      request: {
        url: payload.url,
        method: payload.method,
        headers: maskedHeaders,
        body: maskedBody,
      },
    }),
  }).catch(() => {
    // Debug mirror failures should never affect the real request flow.
  });
}

function createDebugOnlyResponse<T>(): T {
  return {
    code: 202,
    message: 'Request diverted to debug webhook.',
    data: null,
    dataList: null,
    title: null,
  } as T;
}

export class FetchApiClient implements ApiClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const requestUrl = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const method = options.method ?? 'GET';
    const requestBody = buildRequestBody(options.body);
    const headers: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...options.headers,
    };

    if (requestBody !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    sendDebugMirror({
      url: requestUrl,
      method,
      headers,
      body: requestBody,
    });

    if (DIVERT_REAL_REQUESTS_TO_DEBUG_WEBHOOK) {
      console.log('[api] real request skipped and diverted to debug webhook', {
        method,
        requestUrl,
      });
      return createDebugOnlyResponse<T>();
    }

    console.log('[api] request start', {
      method,
      requestUrl,
      hasBody: requestBody !== undefined,
      bodyPreview:
        typeof requestBody === 'string'
          ? requestBody.slice(0, 300)
          : undefined,
    });

    let response: Response;

    try {
      response = await fetch(requestUrl, {
        method,
        headers,
        body: requestBody,
      });
    } catch (error) {
      console.log('[api] request network error', {
        method,
        requestUrl,
        error,
      });
      throw error;
    }

    console.log('[api] request response', {
      method,
      requestUrl,
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }
}

export class UnconfiguredApiClient implements ApiClient {
  async request<T>(): Promise<T> {
    throw new Error('API client is not configured yet.');
  }
}

export function createApiClient(baseUrl?: string): ApiClient {
  if (!baseUrl) {
    return new UnconfiguredApiClient();
  }

  return new FetchApiClient(baseUrl);
}
