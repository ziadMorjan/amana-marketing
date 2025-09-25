"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, Campaign, WeeklyPerformance } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { LineChart } from '../../src/components/ui/line-chart'; // Updated import
import { Table } from '../../src/components/ui/table';
import { Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';

export default function WeeklyView() {
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

  const aggregatedWeeklyData = useMemo(() => {
    if (!marketingData?.campaigns) return [];

    const weeklyMap: { [key: string]: Omit<WeeklyPerformance, 'week_start' | 'week_end'> } = {};

    marketingData.campaigns.forEach(campaign => {
      campaign.weekly_performance.forEach(week => {
        if (!weeklyMap[week.week_start]) {
          weeklyMap[week.week_start] = { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 };
        }
        weeklyMap[week.week_start].impressions += week.impressions;
        weeklyMap[week.week_start].clicks += week.clicks;
        weeklyMap[week.week_start].conversions += week.conversions;
        weeklyMap[week.week_start].spend += week.spend;
        weeklyMap[week.week_start].revenue += week.revenue;
      });
    });

    return Object.entries(weeklyMap)
      .map(([week_start, data]) => ({
        week_start: new Date(week_start),
        ...data,
      }))
      .sort((a, b) => a.week_start.getTime() - b.week_start.getTime());
  }, [marketingData?.campaigns]);
  
  const totalWeeks = aggregatedWeeklyData.length;

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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Weekly Performance</h1>
            )}
          </div>
        </section>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {marketingData && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <CardMetric title="Total Weeks Tracked" value={totalWeeks} icon={<Calendar className="h-5 w-5" />} />
                <CardMetric title="Total Spend" value={`$${marketingData.marketing_stats.total_spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<DollarSign className="h-5 w-5" />} />
                <CardMetric title="Total Revenue" value={`$${marketingData.marketing_stats.total_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<TrendingUp className="h-5 w-5" />} className="text-green-400" />
                <CardMetric title="Total Conversions" value={marketingData.marketing_stats.total_conversions.toLocaleString()} icon={<Users className="h-5 w-5" />} />
              </div>

              {/* Updated Section: Using LineChart instead of BarChart */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <LineChart
                  title="Weekly Revenue"
                  data={aggregatedWeeklyData.map(week => ({
                    x: week.week_start,
                    y: week.revenue
                  }))}
                  strokeColor="#10B981"
                  formatValue={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <LineChart
                  title="Weekly Spend"
                  data={aggregatedWeeklyData.map(week => ({
                    x: week.week_start,
                    y: week.spend,
                  }))}
                  strokeColor="#8B5CF6"
                  formatValue={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
              </div>

              <Table
                title="Weekly Performance Breakdown"
                columns={[
                  { key: 'week_start', header: 'Week', sortable: true, sortType: 'date', render: (v) => v.toLocaleDateString() },
                  { key: 'impressions', header: 'Impressions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                  { key: 'clicks', header: 'Clicks', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                  { key: 'conversions', header: 'Conversions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                  { key: 'spend', header: 'Spend', align: 'right', sortable: true, sortType: 'number', render: (v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
                  { key: 'revenue', header: 'Revenue', align: 'right', sortable: true, sortType: 'number', render: (v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
                ]}
                data={aggregatedWeeklyData}
                defaultSort={{ key: 'week_start', direction: 'asc' }}
              />
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}