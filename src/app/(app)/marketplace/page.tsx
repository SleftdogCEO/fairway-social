'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Listing, ListingCategory, ListingCondition } from '@/lib/types';
import {
  Search,
  Plus,
  Filter,
  DollarSign,
  Tag,
  X,
  Package,
} from 'lucide-react';

const CATEGORY_OPTIONS: { value: ListingCategory; label: string }[] = [
  { value: 'drivers', label: 'Drivers' },
  { value: 'woods', label: 'Woods' },
  { value: 'hybrids', label: 'Hybrids' },
  { value: 'irons', label: 'Irons' },
  { value: 'wedges', label: 'Wedges' },
  { value: 'putters', label: 'Putters' },
  { value: 'bags', label: 'Bags' },
  { value: 'balls', label: 'Balls' },
  { value: 'apparel', label: 'Apparel' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

const CONDITION_OPTIONS: { value: ListingCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const CONDITION_COLORS: Record<ListingCondition, string> = {
  new: 'bg-green-100 text-green-800 border-green-300',
  like_new: 'bg-blue-100 text-blue-800 border-blue-300',
  good: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  fair: 'bg-orange-100 text-orange-800 border-orange-300',
  poor: 'bg-red-100 text-red-800 border-red-300',
};

type SortOption = 'newest' | 'price_low' | 'price_high';

type ListingWithProfile = Omit<Listing, 'profiles'> & {
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
  images?: string[];
}

interface CreateListingForm {
  title: string;
  description: string;
  category: ListingCategory;
  condition: ListingCondition;
  price: string;
  location: string;
  images: File[];
}

export default function MarketplacePage() {
  const supabase = createClient();

  const [listings, setListings] = useState<ListingWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ListingCategory | ''>('');
  const [conditionFilter, setConditionFilter] = useState<ListingCondition | ''>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedListing, setExpandedListing] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateListingForm>({
    title: '',
    description: '',
    category: 'drivers',
    condition: 'good',
    price: '',
    location: '',
    images: [],
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setListings(data as ListingWithProfile[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredListings = listings
    .filter((listing) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = listing.title?.toLowerCase().includes(q);
        const matchesDesc = listing.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (categoryFilter && listing.category !== categoryFilter) return false;
      if (conditionFilter && listing.condition !== conditionFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return (a.price ?? 0) - (b.price ?? 0);
        case 'price_high':
          return (b.price ?? 0) - (a.price ?? 0);
        case 'newest':
        default:
          return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      }
    });

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const imageUrls: string[] = [];

      for (const file of formData.images) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, file);

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('listings').getPublicUrl(filePath);
          imageUrls.push(publicUrl);
        }
      }

      const { error } = await supabase.from('listings').insert({
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        price: parseFloat(formData.price),
        location: formData.location,
        images: imageUrls,
        status: 'active',
      });

      if (!error) {
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          category: 'drivers',
          condition: 'good',
          price: '',
          location: '',
          images: [],
        });
        fetchListings();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const selected = Array.from(files).slice(0, 4);
      setFormData((prev) => ({ ...prev, images: selected }));
    }
  };

  const conditionLabel = (c: ListingCondition) =>
    CONDITION_OPTIONS.find((opt) => opt.value === c)?.label ?? c;

  const categoryLabel = (c: ListingCategory) =>
    CATEGORY_OPTIONS.find((opt) => opt.value === c)?.label ?? c;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipment Marketplace</h1>
            <p className="text-gray-500 mt-1">Buy and sell golf equipment with fellow golfers</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            List Equipment
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ListingCategory | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value as ListingCondition | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
              >
                <option value="">All Conditions</option>
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
          {(searchQuery || categoryFilter || conditionFilter) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                  {categoryLabel(categoryFilter)}
                  <button onClick={() => setCategoryFilter('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {conditionFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {conditionLabel(conditionFilter)}
                  <button onClick={() => setConditionFilter('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Create Listing Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">List Equipment</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleCreateListing} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., TaylorMade Stealth 2 Driver"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Describe your equipment, condition details, why you're selling..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value as ListingCategory,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          condition: e.target.value as ListingCondition,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                    >
                      {CONDITION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, price: e.target.value }))
                        }
                        placeholder="0.00"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, location: e.target.value }))
                      }
                      placeholder="City, State"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images (up to 4)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {formData.images.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.images.length} image{formData.images.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Listing...' : 'Create Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {listings.length === 0
                ? 'No listings yet'
                : 'No listings match your filters'}
            </h3>
            <p className="text-gray-400 mb-6">
              {listings.length === 0
                ? 'Be the first to list your equipment!'
                : 'Try adjusting your search or filters.'}
            </p>
            {listings.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                List Equipment
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() =>
                  setExpandedListing(expandedListing === listing.id ? null : listing.id)
                }
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-gray-100 relative">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title ?? 'Listing image'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {listing.condition && (
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${CONDITION_COLORS[listing.condition]}`}
                    >
                      {conditionLabel(listing.condition)}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                    <span className="text-lg font-bold text-emerald-600 whitespace-nowrap">
                      ${listing.price?.toFixed(2)}
                    </span>
                  </div>
                  {listing.category && (
                    <div className="flex items-center gap-1 mb-2">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{categoryLabel(listing.category)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{listing.profiles?.full_name ?? 'Unknown Seller'}</span>
                    {listing.location && <span>{listing.location}</span>}
                  </div>

                  {/* Expanded Details */}
                  {expandedListing === listing.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                      {listing.description && (
                        <p className="text-sm text-gray-600 mb-4">{listing.description}</p>
                      )}
                      {listing.images && listing.images.length > 1 && (
                        <div className="flex gap-2 mb-4 overflow-x-auto">
                          {listing.images.slice(1).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`${listing.title} ${idx + 2}`}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                            />
                          ))}
                        </div>
                      )}
                      <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm">
                        Contact Seller
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
