"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, Campaign, DemographicBreakdown } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Users, User, DollarSign, MousePointerClick, TrendingUp, BarChart3 } from 'lucide-react';

export default function DemographicView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading marketing data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --- Data Processing ---

  // Calculate aggregated metrics by gender
  const genderMetrics = useMemo(() => {
    // FIX: Provide a default structure to prevent type errors
    if (!marketingData?.campaigns) {
      return {
        male: { clicks: 0, spend: 0, revenue: 0 },
        female: { clicks: 0, spend: 0, revenue: 0 },
      };
    }

    const metrics = {
      male: { clicks: 0, spend: 0, revenue: 0 },
      female: { clicks: 0, spend: 0, revenue: 0 },
    };

    marketingData.campaigns.forEach((campaign: Campaign) => {
      campaign.demographic_breakdown.forEach((demo: DemographicBreakdown) => {
        // Estimate spend and revenue based on audience percentage
        const estimatedSpend = campaign.spend * (demo.percentage_of_audience / 100);
        const estimatedRevenue = campaign.revenue * (demo.percentage_of_audience / 100);
        
        if (demo.gender.toLowerCase() === 'male') {
          metrics.male.clicks += demo.performance.clicks;
          metrics.male.spend += estimatedSpend;
          metrics.male.revenue += estimatedRevenue;
        } else if (demo.gender.toLowerCase() === 'female') {
          metrics.female.clicks += demo.performance.clicks;
          metrics.female.spend += estimatedSpend;
          metrics.female.revenue += estimatedRevenue;
        }
      });
    });
    return metrics;
  }, [marketingData?.campaigns]);

  // Aggregate data by age group for charts
  const ageGroupMetrics = useMemo(() => {
    if (!marketingData?.campaigns) return [];
    
    const ageData: { [key: string]: { spend: number, revenue: number } } = {};

    marketingData.campaigns.forEach((campaign: Campaign) => {
      campaign.demographic_breakdown.forEach((demo: DemographicBreakdown) => {
        if (!ageData[demo.age_group]) {
          ageData[demo.age_group] = { spend: 0, revenue: 0 };
        }
        ageData[demo.age_group].spend += campaign.spend * (demo.percentage_of_audience / 100);
        ageData[demo.age_group].revenue += campaign.revenue * (demo.percentage_of_audience / 100);
      });
    });

    return Object.keys(ageData).sort().map(age => ({
      age,
      ...ageData[age]
    }));
  }, [marketingData?.campaigns]);


  // Aggregate performance data for tables by gender and age group
  const performanceByGenderAndAge = useMemo(() => {
    if (!marketingData?.campaigns) return { male: [], female: [] };

    const aggregate = (gender: 'Male' | 'Female') => {
        const data: { [key: string]: { impressions: number, clicks: number, conversions: number } } = {};

        marketingData.campaigns.forEach(campaign => {
            campaign.demographic_breakdown
                .filter(d => d.gender === gender)
                .forEach(demo => {
                    if (!data[demo.age_group]) {
                        data[demo.age_group] = { impressions: 0, clicks: 0, conversions: 0 };
                    }
                    data[demo.age_group].impressions += demo.performance.impressions;
                    data[demo.age_group].clicks += demo.performance.clicks;
                    data[demo.age_group].conversions += demo.performance.conversions;
                });
        });

        return Object.keys(data).sort().map(age_group => {
            const stats = data[age_group];
            return {
                age_group,
                ...stats,
                ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions * 100).toFixed(2) + '%' : '0.00%',
                conversion_rate: stats.clicks > 0 ? (stats.conversions / stats.clicks * 100).toFixed(2) + '%' : '0.00%',
            };
        });
    };

    return {
        male: aggregate('Male'),
        female: aggregate('Female'),
    };
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
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8 sm:py-12">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {error ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
                  Error loading data: {error}
                </div>
              ) : (
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Demographic Performance</h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {marketingData && (
            <>
              {/* Gender Metrics */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Performance by Gender</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Female Metrics */}
                  <CardMetric title="Total Clicks by Females" value={genderMetrics.female.clicks.toLocaleString()} icon={<User className="h-5 w-5" />} />
                  <CardMetric title="Total Spend by Females" value={`$${genderMetrics.female.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<DollarSign className="h-5 w-5" />} />
                  <CardMetric title="Total Revenue by Females" value={`$${genderMetrics.female.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<TrendingUp className="h-5 w-5" />} className="text-green-400" />
                  
                  {/* Male Metrics */}
                  <CardMetric title="Total Clicks by Males" value={genderMetrics.male.clicks.toLocaleString()} icon={<User className="h-5 w-5" />} />
                  <CardMetric title="Total Spend by Males" value={`$${genderMetrics.male.spend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<DollarSign className="h-5 w-5" />} />
                  <CardMetric title="Total Revenue by Males" value={`$${genderMetrics.male.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<TrendingUp className="h-5 w-5" />} className="text-green-400" />
                </div>
              </div>
              
              {/* Age Group Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <BarChart
                  title="Total Spend by Age Group"
                  data={ageGroupMetrics.map(item => ({ label: item.age, value: item.spend, color: '#3B82F6' }))}
                  formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
                <BarChart
                  title="Total Revenue by Age Group"
                  data={ageGroupMetrics.map(item => ({ label: item.age, value: item.revenue, color: '#10B981' }))}
                  formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
              </div>

              {/* Age Group Tables */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Table
                  title="Performance by Female Age Groups"
                  columns={[
                    { key: 'age_group', header: 'Age Group', sortable: true, sortType: 'string' },
                    { key: 'impressions', header: 'Impressions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                    { key: 'clicks', header: 'Clicks', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                    { key: 'conversions', header: 'Conversions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                    { key: 'ctr', header: 'CTR', align: 'right', sortable: true, sortType: 'string' },
                    { key: 'conversion_rate', header: 'CVR', align: 'right', sortable: true, sortType: 'string' },
                  ]}
                  data={performanceByGenderAndAge.female}
                  defaultSort={{ key: 'age_group', direction: 'asc' }}
                />
                <Table
                  title="Performance by Male Age Groups"
                  columns={[
                    { key: 'age_group', header: 'Age Group', sortable: true, sortType: 'string' },
                    { key: 'impressions', header: 'Impressions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                    { key: 'clicks', header: 'Clicks', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                    { key: 'conversions', header: 'Conversions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                    { key: 'ctr', header: 'CTR', align: 'right', sortable: true, sortType: 'string' },
                    { key: 'conversion_rate', header: 'CVR', align: 'right', sortable: true, sortType: 'string' },
                  ]}
                  data={performanceByGenderAndAge.male}
                  defaultSort={{ key: 'age_group', direction: 'asc' }}
                />
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
