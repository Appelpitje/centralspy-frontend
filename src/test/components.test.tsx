import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { MetricCard } from '../components/hud/MetricCard';

describe('UI Primitives', () => {
  it('renders Button with variants and loading state', () => {
    const { rerender } = render(<Button variant="primary">Deploy Soldier</Button>);
    expect(screen.getByText('Deploy Soldier')).toBeInTheDocument();

    rerender(<Button variant="primary" isLoading>Deploy Soldier</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders Badge with variants', () => {
    render(<Badge variant="ONLINE">ACTIVE NODE</Badge>);
    expect(screen.getByText('ACTIVE NODE')).toBeInTheDocument();
  });

  it('renders MetricCard with title, value, and subtitle', () => {
    render(
      <MetricCard
        title="TCP Sessions"
        value="42"
        subtitle="Live connections"
        accentColor="cyan"
      />
    );
    expect(screen.getByText('TCP Sessions')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Live connections')).toBeInTheDocument();
  });
});
