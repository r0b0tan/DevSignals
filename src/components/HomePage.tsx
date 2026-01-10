import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyze, type AnalysisResult } from '../analysis';
import { validateUrl, fetchHtml } from '../fetch';
import { Dashboard } from './Dashboard';
import { saveAnalysis } from './ComparisonView';

type State =
  | { status: 'idle' }
  | { status: 'running'; progress: number; currentStep: string }
  | { status: 'error'; message: string }
  | { status: 'done'; result: AnalysisResult };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function HomePage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [state, setState] = useState<State>({ status: 'idle' });
  const [fetchCount, setFetchCount] = useState(3);

  async function run() {
    const validation = validateUrl(url);
    if (!validation.ok) {
      setState({ status: 'error', message: validation.error });
      return;
    }

    setState({ status: 'running', progress: 0, currentStep: 'Starting analysis...' });

    try {
      const samples: string[] = [];

      for (let i = 0; i < fetchCount; i++) {
        setState({
          status: 'running',
          progress: (i / fetchCount) * 100,
          currentStep: `Fetching sample ${i + 1} of ${fetchCount}...`
        });
        if (i > 0) await delay(300);
        samples.push(await fetchHtml(validation.url));
      }

      setState({ status: 'running', progress: 100, currentStep: 'Analyzing structure and semantics...' });
      await delay(200);

      const result = analyze(samples, validation.url);

      saveAnalysis(validation.url, result);

      setState({ status: 'done', result });
    } catch (e) {
      setState({
        status: 'error',
        message: e instanceof Error ? e.message : 'Fetch failed',
      });
    }
  }

  return (
    <Dashboard
      state={state}
      url={url}
      onUrlChange={setUrl}
      onSubmit={run}
      onCompare={() => navigate('/compare')}
      fetchCount={fetchCount}
      onFetchCountChange={setFetchCount}
    />
  );
}
