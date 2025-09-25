"use client";
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, Campaign, RegionalPerformance } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { Table } from '../../src/components/ui/table';
import { MapPin, DollarSign, TrendingUp, MousePointerClick } from 'lucide-react';

// --- START: DYNAMIC IMPORT ---
// Dynamically import BubbleMap with SSR turned off
const BubbleMap = dynamic(() => import('../../src/components/ui/bubble-map').then(mod => mod.BubbleMap), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] bg-gray-800 rounded-lg flex items-center justify-center p-6 border border-gray-700">
      <p className="text-gray-400">Loading Map...</p>
    </div>
  ),
});
// --- END: DYNAMIC IMPORT ---


// Approximate coordinates for regions in the dataset
const regionCoordinates: { [key: string]: { lat: number; lng: number } } = {
  'Abu Dhabi': { lat: 24.4539, lng: 54.3773 },
  'Dubai': { lat: 25.2048, lng: 55.2708 },
  'Sharjah': { lat: 25.3463, lng: 55.4209 },
  'Riyadh': { lat: 24.7136, lng: 46.6753 },
  'Doha': { lat: 25.2854, lng: 51.5310 },
  'Kuwait City': { lat: 29.3759, lng: 47.9774 },
  'Manama': { lat: 26.2285, lng: 50.5860 },
};

export default function RegionView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const aggregatedRegionalData = useMemo(() => {
    if (!marketingData?.campaigns) return [];

    const regionMap: { [key: string]: Omit<RegionalPerformance, 'region'> } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.regional_performance.forEach(region => {
        if (!regionMap[region.region]) {
          regionMap[region.region] = { country: region.country, impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0, ctr: 0, conversion_rate: 0, cpc: 0, cpa: 0, roas: 0 };
        }
        const stats = regionMap[region.region];
        stats.impressions += region.impressions;
        stats.clicks += region.clicks;
        stats.conversions += region.conversions;
        stats.spend += region.spend;
        stats.revenue += region.revenue;
      });
    });

    return Object.entries(regionMap)
      .map(([region, data]) => {
        const coords = regionCoordinates[region] || { lat: 0, lng: 0 };
        const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
        const conversion_rate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
        const cpc = data.clicks > 0 ? data.spend / data.clicks : 0;
        const cpa = data.conversions > 0 ? data.spend / data.conversions : 0;
        const roas = data.spend > 0 ? data.revenue / data.spend : 0;
        return {
          region,
          ...data,
          ...coords,
          ctr,
          conversion_rate,
          cpc,
          cpa,
          roas,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [marketingData?.campaigns]);
  
  const topRegionByRevenue = aggregatedRegionalData.length > 0 ? aggregatedRegionalData[0].region : 'N/A';

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8 sm:py-12">
          <div className="px-4 sm:px-6 lg:px-8 text-center">
            {error ? (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
                Error loading data: {error}
              </div>
            ) : (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Regional Performance</h1>
            )}
          </div>
        </section>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {marketingData && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <CardMetric title="Top Region by Revenue" value={topRegionByRevenue} icon={<MapPin className="h-5 w-5" />} />
                <CardMetric title="Total Revenue" value={`$${marketingData.marketing_stats.total_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<DollarSign className="h-5 w-5" />} className="text-green-400" />
                <CardMetric title="Total Spend" value={`$${marketingData.marketing_stats.total_spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<DollarSign className="h-5 w-5" />} />
                <CardMetric title="Total Clicks" value={marketingData.marketing_stats.total_clicks.toLocaleString()} icon={<MousePointerClick className="h-5 w-5" />} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <BubbleMap
                  title="Revenue by Region"
                  data={aggregatedRegionalData.map(r => ({ label: r.region, lat: r.lat, lng: r.lng, value: r.revenue }))}
                  formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  color="#10B981"
                />
                <BubbleMap
                  title="Spend by Region"
                  data={aggregatedRegionalData.map(r => ({ label: r.region, lat: r.lat, lng: r.lng, value: r.spend }))}
                  formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  color="#F59E0B"
                />
              </div>

              <Table
                title="Regional Performance Breakdown"
                columns={[
                  { key: 'region', header: 'Region', sortable: true, sortType: 'string' },
                  { key: 'country', header: 'Country', sortable: true, sortType: 'string' },
                  { key: 'revenue', header: 'Revenue', align: 'right', sortable: true, sortType: 'number', render: (v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
                  { key: 'spend', header: 'Spend', align: 'right', sortable: true, sortType: 'number', render: (v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
                  { key: 'roas', header: 'ROAS', align: 'right', sortable: true, sortType: 'number', render: (v) => `${v.toFixed(2)}x` },
                  { key: 'conversions', header: 'Conversions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                  { key: 'clicks', header: 'Clicks', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                ]}
                data={aggregatedRegionalData}
                defaultSort={{ key: 'revenue', direction: 'desc' }}
              />
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}