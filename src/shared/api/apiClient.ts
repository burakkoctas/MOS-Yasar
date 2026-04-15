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
  'Content-Type': 'application/json',
};

export class FetchApiClient implements ApiClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const requestUrl = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const response = await fetch(requestUrl, {
      method: options.method ?? 'GET',
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
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
