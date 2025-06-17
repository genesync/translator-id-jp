import { useEffect, useState } from 'react';
import { checkUserAccess } from '@/utils/subscription';

export function withProAccess(Component: React.FC<any>) {
  return function GuardedComponent(props: any) {
    const [allowed, setAllowed] = useState<boolean | null>(null);

    useEffect(() => {
      checkUserAccess().then(({ isPro }) => setAllowed(isPro));
    }, []);

    if (allowed === null) return <p>Loading...</p>;
    if (!allowed) return <p>Fitur ini hanya untuk pengguna Pro. <a href="/pricing">Upgrade sekarang</a>.</p>;

    return <Component {...props} />;
  };
}