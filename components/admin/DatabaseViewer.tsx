'use client';

import { useState, useMemo } from 'react';
import type { Product, Vendor, Review, Plan } from '@/lib/types';

type Tab = 'products' | 'vendors' | 'reviews' | 'plans';

interface Props {
  products: Product[];
  vendors: Vendor[];
  reviews: Review[];
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

const PRODUCT_CATEGORIES = ['urns', 'jewelry', 'shrouds', 'planning', 'memorial', 'humor'] as const;

function ProductsTab({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [verified, setVerified] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q) && !p.seller.toLowerCase().includes(q) && !p.id.includes(q)) return false;
      if (category && p.category !== category) return false;
      if (verified === 'yes' && !p.verified) return false;
      if (verified === 'no' && p.verified) return false;
      return true;
    });
  }, [products, search, category, verified]);

  return (
    <>
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search title, seller, ID…" />
        <Select value={category} onChange={setCategory} label="Category">
          <option value="">All categories</option>
          {PRODUCT_CATEGORIES.map((c) => (
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
              <Th>Category</Th>
              <Th>Price</Th>
              <Th>Rating</Th>
              <Th>Reviews</Th>
              <Th>Verified</Th>
              <Th>Location</Th>
            </Tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <EmptyRow cols={9} />
            ) : (
              filtered.map((p) => (
                <Tr key={p.id}>
                  <Td mono>{p.id}</Td>
                  <Td>{p.title}</Td>
                  <Td>{p.seller}</Td>
                  <Td>
                    <Badge label={p.category} color="tr" />
                  </Td>
                  <Td mono>${p.price}</Td>
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

const VENDOR_TYPES = ['doula', 'attorney', 'cleaner', 'celebrant', 'organizer', 'grief', 'home-funeral', 'green-burial'] as const;

function VendorsTab({ vendors }: { vendors: Vendor[] }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [verified, setVerified] = useState('');
  const [accepting, setAccepting] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vendors.filter((v) => {
      if (q && !v.name.toLowerCase().includes(q) && !v.location.toLowerCase().includes(q) && !v.id.includes(q)) return false;
      if (type && v.type !== type) return false;
      if (verified === 'yes' && !v.verified) return false;
      if (verified === 'no' && v.verified) return false;
      if (accepting === 'yes' && !v.accepting) return false;
      if (accepting === 'no' && v.accepting) return false;
      return true;
    });
  }, [vendors, search, type, verified, accepting]);

  return (
    <>
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, location, ID…" />
        <Select value={type} onChange={setType} label="Type">
          <option value="">All types</option>
          {VENDOR_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
        <Select value={verified} onChange={setVerified} label="Verified">
          <option value="">Any</option>
          <option value="yes">Verified</option>
          <option value="no">Unverified</option>
        </Select>
        <Select value={accepting} onChange={setAccepting} label="Accepting">
          <option value="">Any</option>
          <option value="yes">Accepting</option>
          <option value="no">Not accepting</option>
        </Select>
        <RecordCount count={filtered.length} total={vendors.length} />
      </FilterBar>

      <TableWrap>
        <table className="w-full text-sm">
          <thead>
            <Tr header>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Location</Th>
              <Th>Rating</Th>
              <Th>Reviews</Th>
              <Th>Verified</Th>
              <Th>Accepting</Th>
              <Th>Service&nbsp;Provider</Th>
              <Th>Member&nbsp;Since</Th>
            </Tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <EmptyRow cols={10} />
            ) : (
              filtered.map((v) => (
                <Tr key={v.id}>
                  <Td mono>{v.id}</Td>
                  <Td>{v.name}</Td>
                  <Td>
                    <Badge label={v.type} color="sg" />
                  </Td>
                  <Td>{v.location}</Td>
                  <Td><Stars rating={v.rating} /></Td>
                  <Td mono>{v.reviewCount}</Td>
                  <Td><BoolCell value={v.verified} /></Td>
                  <Td><BoolCell value={v.accepting} /></Td>
                  <Td><BoolCell value={v.isServiceProvider !== false} /></Td>
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
                  <Td>{r.date}</Td>
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

export function DatabaseViewer({ products, vendors, reviews, plans }: Props) {
  const [tab, setTab] = useState<Tab>('products');

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'products', label: 'Products', count: products.length },
    { id: 'vendors', label: 'Vendors', count: vendors.length },
    { id: 'reviews', label: 'Reviews', count: reviews.length },
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
      {tab === 'reviews' && <ReviewsTab reviews={reviews} />}
      {tab === 'plans' && <PlansTab plans={plans} />}
    </div>
  );
}
