import { ActorStorageInterface, Actor } from '@cloudflare/actors';

export interface CounterState {
  count: number;
  lastUpdated: string;
}

export class CounterActor extends Actor<CounterState> {
  private storage: ActorStorageInterface<CounterState>;

  constructor(state: DurableObjectState) {
    super();
    this.storage = new ActorStorageInterface<CounterState>(state);
  }

  async initialize(): Promise<void> {
    const existingState = await this.storage.get();
    if (!existingState) {
      await this.storage.put({
        count: 0,
        lastUpdated: new Date().toISOString()
      });
    }
  }

  async increment(): Promise<CounterState> {
    const state = await this.storage.get() || { count: 0, lastUpdated: new Date().toISOString() };
    state.count += 1;
    state.lastUpdated = new Date().toISOString();
    await this.storage.put(state);
    return state;
  }

  async decrement(): Promise<CounterState> {
    const state = await this.storage.get() || { count: 0, lastUpdated: new Date().toISOString() };
    state.count -= 1;
    state.lastUpdated = new Date().toISOString();
    await this.storage.put(state);
    return state;
  }

  async getCount(): Promise<CounterState> {
    const state = await this.storage.get() || { count: 0, lastUpdated: new Date().toISOString() };
    return state;
  }

  async reset(): Promise<CounterState> {
    const state = {
      count: 0,
      lastUpdated: new Date().toISOString()
    };
    await this.storage.put(state);
    return state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      await this.initialize();

      switch (path) {
        case '/increment':
          if (request.method === 'POST') {
            const state = await this.increment();
            return new Response(JSON.stringify(state), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          break;

        case '/decrement':
          if (request.method === 'POST') {
            const state = await this.decrement();
            return new Response(JSON.stringify(state), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          break;

        case '/reset':
          if (request.method === 'POST') {
            const state = await this.reset();
            return new Response(JSON.stringify(state), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          break;

        case '/count':
          if (request.method === 'GET') {
            const state = await this.getCount();
            return new Response(JSON.stringify(state), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          break;
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response(`Error: ${error}`, { status: 500 });
    }
  }
}