import { notFound } from 'next/navigation';
import TestEnginesClient from './TestEnginesClient';

export const dynamic = 'force-dynamic';

export default function TestEnginesPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  return <TestEnginesClient />;
}
