"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, Campaign, DevicePerformance } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Smartphone, Monitor, Tablet, DollarSign, TrendingUp, Users } from 'lucide-react';

export default function DeviceView() {
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

  // Aggregate device data from all campaigns
  const aggregatedDeviceData = useMemo(() => {
    if (!marketingData?.campaigns) return [];

    const deviceMap: { [key: string]: Omit<DevicePerformance, 'device'> } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.device_performance.forEach(device => {
        if (!deviceMap[device.device]) {
          deviceMap[device.device] = { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0, ctr: 0, conversion_rate: 0, percentage_of_traffic: 0 };
        }
        const stats = deviceMap[device.device];
        stats.impressions += device.impressions;
        stats.clicks += device.clicks;
        stats.conversions += device.conversions;
        stats.spend += device.spend;
        stats.revenue += device.revenue;
      });
    });

    return Object.entries(deviceMap)
      .map(([device, data]) => {
        // Recalculate aggregate rates
        const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
        const conversion_rate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
        return {
          device,
          ...data,
          ctr,
          conversion_rate,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [marketingData?.campaigns]);

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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Device Performance</h1>
            )}
          </div>
        </section>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {aggregatedDeviceData.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <CardMetric title="Mobile Revenue" value={`$${aggregatedDeviceData.find(d => d.device === 'Mobile')?.revenue.toLocaleString(undefined, {maximumFractionDigits: 0}) || 0}`} icon={<Smartphone className="h-5 w-5" />} className="text-green-400" />
                <CardMetric title="Desktop Revenue" value={`$${aggregatedDeviceData.find(d => d.device === 'Desktop')?.revenue.toLocaleString(undefined, {maximumFractionDigits: 0}) || 0}`} icon={<Monitor className="h-5 w-5" />} className="text-green-400" />
                <CardMetric title="Tablet Revenue" value={`$${aggregatedDeviceData.find(d => d.device === 'Tablet')?.revenue.toLocaleString(undefined, {maximumFractionDigits: 0}) || 0}`} icon={<Tablet className="h-5 w-5" />} className="text-green-400" />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                <BarChart
                  title="Revenue by Device"
                  data={aggregatedDeviceData.map(d => ({ label: d.device, value: d.revenue, color: '#10B981' }))}
                  formatValue={(value) => `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                />
                <BarChart
                  title="Spend by Device"
                  data={aggregatedDeviceData.map(d => ({ label: d.device, value: d.spend, color: '#3B82F6' }))}
                  formatValue={(value) => `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                />
                <BarChart
                  title="Conversions by Device"
                  data={aggregatedDeviceData.map(d => ({ label: d.device, value: d.conversions, color: '#8B5CF6' }))}
                  formatValue={(value) => value.toLocaleString()}
                />
              </div>

              <Table
                title="Device Performance Breakdown"
                columns={[
                  { key: 'device', header: 'Device', sortable: true, sortType: 'string' },
                  { key: 'revenue', header: 'Revenue', align: 'right', sortable: true, sortType: 'number', render: (v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
                  { key: 'spend', header: 'Spend', align: 'right', sortable: true, sortType: 'number', render: (v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
                  { key: 'conversions', header: 'Conversions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                  { key: 'clicks', header: 'Clicks', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                  { key: 'impressions', header: 'Impressions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                  { key: 'ctr', header: 'CTR', align: 'right', sortable: true, sortType: 'number', render: (v) => `${v.toFixed(2)}%` },
                  { key: 'conversion_rate', header: 'CVR', align: 'right', sortable: true, sortType: 'number', render: (v) => `${v.toFixed(2)}%` },
                ]}
                data={aggregatedDeviceData}
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