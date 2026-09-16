import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Home } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card
        title="Page not found"
        className="max-w-md w-full text-center py-6"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            That page doesn’t exist on mohPA.
          </p>
          <div className="pt-2 flex justify-center">
            <Link to="/">
              <Button variant="primary" size="sm" leftIcon={<Home className="w-4 h-4" />}>
                Back to dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
