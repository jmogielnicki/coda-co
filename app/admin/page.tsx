import type { Metadata } from 'next';
import { products } from '@/lib/data/products';
import { vendors } from '@/lib/data/vendors';
import { reviews } from '@/lib/data/reviews';
import { goodsPlans, servicePlans } from '@/lib/data/plans';
import { DatabaseViewer } from '@/components/admin/DatabaseViewer';

export const metadata: Metadata = {
  title: 'Database Viewer — Admin | CodaCo',
};

export default function AdminPage() {
  const plans = [...goodsPlans, ...servicePlans];

  return (
    <div className="min-h-screen bg-pl2">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-7">
          <p className="text-xs font-medium uppercase tracking-widest text-tr mb-1.5">Admin</p>
          <h1 className="font-serif text-4xl text-ch">Database Viewer</h1>
          <p className="text-cm text-sm mt-1.5">
            Read-only view of all mock data sources.{' '}
            <span className="text-cl">No authentication — development only.</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {[
            { label: 'Products', count: products.length, color: 'bg-tr-p border-tr-l/40' },
            { label: 'Vendors', count: vendors.length, color: 'bg-sg-p border-sg-l/40' },
            { label: 'Reviews', count: reviews.length, color: 'bg-pl border-pl2' },
            { label: 'Plans', count: plans.length, color: 'bg-pl border-pl2' },
          ].map(({ label, count, color }) => (
            <div key={label} className={`rounded-lg border px-4 py-3 ${color}`}>
              <p className="text-2xl font-serif text-ch tabular-nums">{count}</p>
              <p className="text-xs text-cm mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <DatabaseViewer
          products={products}
          vendors={vendors}
          reviews={reviews}
          plans={plans}
        />
      </div>
    </div>
  );
}
