import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Home } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card
        title="404 // SECTOR NOT FOUND"
        icon={<AlertOctagon className="w-5 h-5 text-crimson-400" />}
        accent="crimson"
        className="max-w-md w-full text-center py-6"
      >
        <div className="space-y-4 font-mono">
          <div className="text-4xl text-crimson-400 font-bold">404</div>
          <p className="text-xs text-gray-400">
            The requested tactical coordinates or protocol resource cannot be resolved on the CentralSpy network.
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <Link to="/">
              <Button variant="primary" size="sm" leftIcon={<Home className="w-4 h-4" />}>
                Return to Base
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
