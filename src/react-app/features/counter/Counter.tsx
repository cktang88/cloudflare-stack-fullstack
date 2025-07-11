import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Loader2 } from 'lucide-react';

interface CounterState {
  count: number;
  lastUpdated: string;
}

export function Counter() {
  const [counterId] = useState('demo-counter');
  const [counterState, setCounterState] = useState<CounterState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCounter = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/counter/${counterId}`);
      if (!response.ok) throw new Error('Failed to fetch counter');
      const data = await response.json();
      setCounterState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateCounter = async (action: 'increment' | 'decrement' | 'reset') => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/counter/${counterId}/${action}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(`Failed to ${action} counter`);
      const data = await response.json();
      setCounterState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounter();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cloudflare Actors Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            ) : (
              counterState?.count ?? 0
            )}
          </div>
          {counterState && (
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(counterState.lastUpdated).toLocaleString()}
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => updateCounter('increment')}
            disabled={loading}
            variant="default"
          >
            Increment
          </Button>
          <Button
            onClick={() => updateCounter('decrement')}
            disabled={loading}
            variant="secondary"
          >
            Decrement
          </Button>
          <Button
            onClick={() => updateCounter('reset')}
            disabled={loading}
            variant="outline"
          >
            Reset
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          <p>This counter is persisted using Cloudflare Actors (Durable Objects).</p>
          <p>The state survives across page refreshes and is globally consistent.</p>
        </div>
      </CardContent>
    </Card>
  );
}