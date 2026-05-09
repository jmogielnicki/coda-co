'use client';

import { useState, useMemo } from 'react';
import type {
  Plan,
  ProductWithRating,
  Review,
  Service,
  VendorReview,
  VendorWithRating,
} from '@/lib/types';

type Tab = 'products' | 'vendors' | 'services' | 'reviews' | 'vendorReviews' | 'plans';

interface Props {
  products: ProductWithRating[];
  vendors: VendorWithRating[];
  services: Service[];
  reviews: Review[];
  vendorReviews: VendorReview[];
  plans: Plan[];
}

function Badge({ label, color }: { label: string; color: 'tr' | 'sg' | 'neutral' }) {
  const cls =
    color === 'tr'
      ? 'bg-tr-p text-tr-d'
      : color === 'sg'
      ? 'bg-sg-p text-sg-d'
      : 'bg-pl2 text-cm';
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function BoolCell({ value }: { value: boolean }) {
  return (
    <span className={value ? 'text-sg-d font-medium' : 'text-cl'}>
      {value ? 'Yes' : 'No'}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-tr font-medium tabular-nums">
      {rating.toFixed(1)}
      <span className="text-cl font-normal"> ★</span>
    </span>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="py-10 text-center text-cm text-sm">
        No records match your filters.
      </td>
    </tr>
  );
}

// ── Products ─────────────────────────────────────────────────────────────────

const PRODUCT_TYPES = ['urns', 'jewelry', 'shrouds', 'planning', 'memorial', 'humor'] as const;

function ProductsTab({ products }: { products: ProductWithRating[] }) {
  const [search, setSearch] = useState('');
  const [productType, setProductType] = useState('');
  const [verified, setVerified] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q) && !p.seller.toLowerCase().includes(q) && !p.id.includes(q)) return false;
      if (productType && p.productType !== productType) return false;
      if (verified === 'yes' && !p.verified) return false;
      if (verified === 'no' && p.verified) return false;
      return true;
    });
  }, [products, search, productType, verified]);

  return (
    <>
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search title, seller, ID…" />
        <Select value={productType} onChange={setProductType} label="Type">
          <option value="">All types</option>
          {PRODUCT_TYPES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Select value={verified} onChange={setVerified} label="Verified">
          <option value="">Any</option>
          <option value="yes">Verified</option>
          <option value="no">Unverified</option>
        </Select>
        <RecordCount count={filtered.length} total={products.length} />
      </FilterBar>

      <TableWrap>
        <table className="w-full text-sm">
          <thead>
            <Tr header>
              <Th>ID</Th>
              <Th>Title</Th>
              <Th>Seller</Th>
              <Th>Type</Th>
              <Th>Price</Th>
              <Th>Status</Th>
              <Th>Rating</Th>
              <Th>Reviews</Th>
              <Th>Verified</Th>
              <Th>Location</Th>
            </Tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <EmptyRow cols={10} />
            ) : (
              filtered.map((p) => (
                <Tr key={p.id}>
                  <Td mono>{p.id}</Td>
                  <Td>{p.title}</Td>
                  <Td>{p.seller}</Td>
                  <Td>
                    <Badge label={p.productType} color="tr" />
                  </Td>
                  <Td mono>${p.price}</Td>
                  <Td>{p.status}</Td>
                  <Td><Stars rating={p.rating} /></Td>
                  <Td mono>{p.reviewCount}</Td>
                  <Td><BoolCell value={p.verified} /></Td>
                  <Td>{p.location}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrap>
    </>
  );
}

// ── Vendors ───────────────────────────────────────────────────────────────────

const VENDOR_KINDS = ['unknown', 'goods', 'services', 'both'] as const;

function VendorsTab({ vendors }: { vendors: VendorWithRating[] }) {
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');
  const [verified, setVerified] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vendors.filter((v) => {
      if (q && !v.name.toLowerCase().includes(q) && !v.location.toLowerCase().includes(q) && !v.id.includes(q)) return false;
      if (kind && v.kind !== kind) return false;
      if (verified === 'yes' && !v.verified) return false;
      if (verified === 'no' && v.verified) return false;
      return true;
    });
  }, [vendors, search, kind, verified]);

  return (
    <>
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, location, ID…" />
        <Select value={kind} onChange={setKind} label="Kind">
          <option value="">All kinds</option>
          {VENDOR_KINDS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </Select>
        <Select value={verified} onChange={setVerified} label="Verified">
          <option value="">Any</option>
          <option value="yes">Verified</option>
          <option value="no">Unverified</option>
        </Select>
        <RecordCount count={filtered.length} total={vendors.length} />
      </FilterBar>

      <TableWrap>
        <table className="w-full text-sm">
          <thead>
            <Tr header>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Kind</Th>
              <Th>Location</Th>
              <Th>Rating</Th>
              <Th>Reviews</Th>
              <Th>Verified</Th>
              <Th>Member&nbsp;Since</Th>
            </Tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <EmptyRow cols={8} />
            ) : (
              filtered.map((v) => (
                <Tr key={v.id}>
                  <Td mono>{v.id}</Td>
                  <Td>{v.name}</Td>
                  <Td>
                    <Badge label={v.kind} color="sg" />
                  </Td>
                  <Td>{v.location}</Td>
                  <Td><Stars rating={v.rating} /></Td>
                  <Td mono>{v.reviewCount}</Td>
                  <Td><BoolCell value={v.verified} /></Td>
                  <Td mono>{v.memberSince ?? '—'}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrap>
    </>
  );
}

// ── Services ──────────────────────────────────────────────────────────────────

function ServicesTab({ services }: { services: Service[] }) {
  const [search, setSearch] = useState('');
  const [serviceType, setServiceType] = useState('');

  const types = useMemo(
    () => Array.from(new Set(services.map((s) => s.serviceType))).sort(),
    [services],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter((s) => {
      if (q && !s.title.toLowerCase().includes(q) && !s.vendorId.toLowerCase().includes(q) && !s.id.includes(q)) return false;
      if (serviceType && s.serviceType !== serviceType) return false;
      return true;
    });
  }, [services, search, serviceType]);

  return (
    <>
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search title, vendor, ID…" />
        <Select value={serviceType} onChange={setServiceType} label="Type">
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
        <RecordCount count={filtered.length} total={services.length} />
      </FilterBar>

      <TableWrap>
        <table className="w-full text-sm">
          <thead>
            <Tr header>
              <Th>ID</Th>
              <Th>Vendor</Th>
              <Th>Type</Th>
              <Th>Title</Th>
              <Th>Location</Th>
              <Th>Pricing</Th>
              <Th>Price</Th>
              <Th>Status</Th>
            </Tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <EmptyRow cols={8} />
            ) : (
              filtered.map((s) => (
                <Tr key={s.id}>
                  <Td mono>{s.id}</Td>
                  <Td mono>{s.vendorId}</Td>
                  <Td><Badge label={s.serviceType} color="sg" /></Td>
                  <Td max>{s.title}</Td>
                  <Td>{s.locationType}</Td>
                  <Td>{s.pricingModel}</Td>
                  <Td mono>{s.price != null ? `$${s.price}` : '—'}</Td>
                  <Td>{s.status}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrap>
    </>
  );
}

// ── Reviews ───────────────────────────────────────────────────────────────────

function ReviewsTab({ reviews }: { reviews: Review[] }) {
  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('');

  const productIds = useMemo(
    () => Array.from(new Set(reviews.map((r) => r.productId))).sort(),
    [reviews]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reviews.filter((r) => {
      if (q && !r.reviewer.toLowerCase().includes(q) && !r.body.toLowerCase().includes(q) && !r.id.includes(q)) return false;
      if (productId && r.productId !== productId) return false;
      return true;
    });
  }, [reviews, search, productId]);

  return (
    <>
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search reviewer, body, ID…" />
        <Select value={productId} onChange={setProductId} label="Product">
          <option value="">All products</option>
          {productIds.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </Select>
        <RecordCount count={filtered.length} total={reviews.length} />
      </FilterBar>

      <TableWrap>
        <table className="w-full text-sm">
          <thead>
            <Tr header>
              <Th>ID</Th>
              <Th>Product ID</Th>
              <Th>Reviewer</Th>
              <Th>Location</Th>
              <Th>Date</Th>
              <Th>Rating</Th>
              <Th>Body</Th>
            </Tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <EmptyRow cols={7} />
            ) : (
              filtered.map((r) => (
                <Tr key={r.id}>
                  <Td mono>{r.id}</Td>
                  <Td mono>{r.productId}</Td>
                  <Td>{r.reviewer}</Td>
                  <Td>{r.location}</Td>
                  <Td mono>{r.date}</Td>
                  <Td><Stars rating={r.rating} /></Td>
                  <Td max>{r.body}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrap>
    </>
  );
}

function VendorReviewsTab({ vendorReviews }: { vendorReviews: VendorReview[] }) {
  const [search, setSearch] = useState('');
  const [vendorId, setVendorId] = useState('');

  const vendorIds = useMemo(
    () => Array.from(new Set(vendorReviews.map((r) => r.vendorId))).sort(),
    [vendorReviews]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vendorReviews.filter((r) => {
      if (q && !r.reviewer.toLowerCase().includes(q) && !r.body.toLowerCase().includes(q) && !r.id.includes(q)) return false;
      if (vendorId && r.vendorId !== vendorId) return false;
      return true;
    });
  }, [vendorReviews, search, vendorId]);

  return (
    <>
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search reviewer, body, ID…" />
        <Select value={vendorId} onChange={setVendorId} label="Vendor">
          <option value="">All vendors</option>
          {vendorIds.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </Select>
        <RecordCount count={filtered.length} total={vendorReviews.length} />
      </FilterBar>

      <TableWrap>
        <table className="w-full text-sm">
          <thead>
            <Tr header>
              <Th>ID</Th>
              <Th>Vendor ID</Th>
              <Th>Reviewer</Th>
              <Th>Location</Th>
              <Th>Date</Th>
              <Th>Rating</Th>
              <Th>Body</Th>
            </Tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <EmptyRow cols={7} />
            ) : (
              filtered.map((r) => (
                <Tr key={r.id}>
                  <Td mono>{r.id}</Td>
                  <Td mono>{r.vendorId}</Td>
                  <Td>{r.reviewer}</Td>
                  <Td>{r.location}</Td>
                  <Td mono>{r.date}</Td>
                  <Td><Stars rating={r.rating} /></Td>
                  <Td max>{r.body}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrap>
    </>
  );
}

// ── Plans ─────────────────────────────────────────────────────────────────────

function PlansTab({ plans }: { plans: Plan[] }) {
  const [targetType, setTargetType] = useState('');

  const filtered = useMemo(
    () => plans.filter((p) => !targetType || p.targetType === targetType || p.targetType === 'both'),
    [plans, targetType]
  );

  return (
    <>
      <FilterBar>
        <Select value={targetType} onChange={setTargetType} label="Type">
          <option value="">All types</option>
          <option value="goods">Goods</option>
          <option value="services">Services</option>
        </Select>
        <RecordCount count={filtered.length} total={plans.length} />
      </FilterBar>

      <TableWrap>
        <table className="w-full text-sm">
          <thead>
            <Tr header>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Target Type</Th>
              <Th>Price</Th>
              <Th>Period</Th>
              <Th>Popular</Th>
              <Th>Transaction Fee</Th>
              <Th>Features</Th>
            </Tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <EmptyRow cols={8} />
            ) : (
              filtered.map((p) => (
                <Tr key={`${p.id}-${p.targetType}`}>
                  <Td mono>{p.id}</Td>
                  <Td>{p.name}</Td>
                  <Td>
                    <Badge label={p.targetType} color={p.targetType === 'goods' ? 'tr' : 'sg'} />
                  </Td>
                  <Td mono>{p.price === null ? 'Free' : `$${p.price}`}</Td>
                  <Td>{p.period ?? '—'}</Td>
                  <Td><BoolCell value={p.popular} /></Td>
                  <Td>{p.transactionFee}</Td>
                  <Td max>{p.features.join(' · ')}</Td>
                </Tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrap>
    </>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-pl border-b border-pl2">
      {children}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-8 px-3 text-sm rounded border border-pl2 bg-white text-ch placeholder:text-cl focus:outline-none focus:border-tr-l w-56"
    />
  );
}

function Select({ value, onChange, label, children }: { value: string; onChange: (v: string) => void; label: string; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="h-8 px-2 text-sm rounded border border-pl2 bg-white text-ch focus:outline-none focus:border-tr-l"
    >
      {children}
    </select>
  );
}

function RecordCount({ count, total }: { count: number; total: number }) {
  return (
    <span className="ml-auto text-xs text-cl tabular-nums">
      {count === total ? `${total} records` : `${count} of ${total}`}
    </span>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      {children}
    </div>
  );
}

function Tr({ children, header }: { children: React.ReactNode; header?: boolean }) {
  if (header) {
    return (
      <tr className="border-b border-pl2 bg-pl">
        {children}
      </tr>
    );
  }
  return (
    <tr className="border-b border-pl2 hover:bg-tr-p/40 transition-colors">
      {children}
    </tr>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-cl whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, mono, max }: { children: React.ReactNode; mono?: boolean; max?: boolean }) {
  return (
    <td className={`px-4 py-2.5 text-ch align-top ${mono ? 'font-mono text-xs' : ''} ${max ? 'max-w-xs truncate' : 'whitespace-nowrap'}`}>
      {children}
    </td>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DatabaseViewer({ products, vendors, services, reviews, vendorReviews, plans }: Props) {
  const [tab, setTab] = useState<Tab>('products');

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'products', label: 'Products', count: products.length },
    { id: 'vendors', label: 'Vendors', count: vendors.length },
    { id: 'services', label: 'Services', count: services.length },
    { id: 'reviews', label: 'Reviews', count: reviews.length },
    { id: 'vendorReviews', label: 'Vendor reviews', count: vendorReviews.length },
    { id: 'plans', label: 'Plans', count: plans.length },
  ];

  return (
    <div className="rounded-lg border border-pl2 bg-white overflow-hidden shadow-sm">
      {/* Tab bar */}
      <div className="flex border-b border-pl2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-medium transition-colors relative ${
              tab === t.id
                ? 'text-tr border-b-2 border-tr -mb-px bg-tr-p/30'
                : 'text-cm hover:text-ch hover:bg-pl'
            }`}
          >
            {t.label}
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full tabular-nums ${
                tab === t.id ? 'bg-tr-p text-tr-d' : 'bg-pl2 text-cl'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'products' && <ProductsTab products={products} />}
      {tab === 'vendors' && <VendorsTab vendors={vendors} />}
      {tab === 'services' && <ServicesTab services={services} />}
      {tab === 'reviews' && <ReviewsTab reviews={reviews} />}
      {tab === 'vendorReviews' && <VendorReviewsTab vendorReviews={vendorReviews} />}
      {tab === 'plans' && <PlansTab plans={plans} />}
    </div>
  );
}
