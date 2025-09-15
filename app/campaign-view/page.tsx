import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Target, DollarSign, TrendingUp, Users, Activity, Zap } from 'lucide-react';

export default async function CampaignView() {
  let marketingData: MarketingData | null = null;
  let error: string | null = null;

  try {
    marketingData = await fetchMarketingData();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load data';
    console.error('Error loading marketing data:', err);
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              {error ? (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
                  Error loading data: {error}
                </div>
              ) : (
                <h1 className="text-3xl md:text-5xl font-bold">
                  Campaign Performance
                </h1>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {marketingData && (
            <>
              {/* Campaign Overview Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <CardMetric
                  title="Total Campaigns"
                  value={marketingData.marketing_stats.total_campaigns}
                  icon={<Target className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Active Campaigns"
                  value={marketingData.marketing_stats.active_campaigns}
                  icon={<Activity className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Total Spend"
                  value={`$${marketingData.marketing_stats.total_spend.toLocaleString()}`}
                  icon={<DollarSign className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Average CTR"
                  value={`${marketingData.marketing_stats.average_ctr}%`}
                  icon={<Zap className="h-5 w-5" />}
                />
              </div>

              {/* Campaign Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Campaigns by Revenue */}
                <BarChart
                  title="Top Campaigns by Revenue"
                  data={marketingData.campaigns.slice(0, 6).map(campaign => ({
                    label: campaign.name.split(' - ')[0],
                    value: campaign.revenue,
                    color: '#10B981'
                  }))}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />

                {/* Campaign ROAS Comparison */}
                <BarChart
                  title="Campaign ROAS Comparison"
                  data={marketingData.campaigns.slice(0, 6).map(campaign => ({
                    label: campaign.name.split(' - ')[0],
                    value: campaign.roas,
                    color: '#3B82F6'
                  }))}
                  formatValue={(value) => `${value.toFixed(1)}x`}
                />
              </div>

              {/* Campaign Medium & Device Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Performance by Medium */}
                <BarChart
                  title="Campaign Performance by Medium"
                  data={(() => {
                    const mediumData: { [key: string]: { revenue: number, conversions: number } } = {};
                    marketingData.campaigns.forEach(campaign => {
                      if (!mediumData[campaign.medium]) {
                        mediumData[campaign.medium] = { revenue: 0, conversions: 0 };
                      }
                      mediumData[campaign.medium].revenue += campaign.revenue;
                      mediumData[campaign.medium].conversions += campaign.conversions;
                    });
                    
                    return Object.entries(mediumData).map(([medium, data]) => ({
                      label: medium,
                      value: data.revenue,
                      color: medium === 'Instagram' ? '#E1306C' : 
                             medium === 'Facebook' ? '#1877F2' : 
                             medium === 'Google Ads' ? '#4285F4' : '#8B5CF6'
                    }));
                  })()}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />

                {/* Campaign Conversion Rates */}
                <BarChart
                  title="Campaign Conversion Rates"
                  data={marketingData.campaigns.slice(0, 6).map(campaign => ({
                    label: campaign.name.split(' - ')[0],
                    value: campaign.conversion_rate,
                    color: '#F59E0B'
                  }))}
                  formatValue={(value) => `${value.toFixed(2)}%`}
                />
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <CardMetric
                  title="Total Impressions"
                  value={marketingData.marketing_stats.total_impressions}
                  icon={<Users className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Total Clicks"
                  value={marketingData.marketing_stats.total_clicks}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Avg Conversion Rate"
                  value={`${marketingData.marketing_stats.average_conversion_rate}%`}
                  icon={<Target className="h-5 w-5" />}
                />
              </div>

              {/* Campaign Details Table */}
              <Table
                title="Campaign Details"
                showIndex={true}
                maxHeight="500px"
                columns={[
                  {
                    key: 'name',
                    header: 'Campaign Name',
                    width: '25%',
                    render: (value) => (
                      <div className="font-medium text-white">
                        {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                      </div>
                    )
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    width: '10%',
                    align: 'center',
                    render: (value) => (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        value === 'Active' ? 'bg-green-900 text-green-300' :
                        value === 'Paused' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {value}
                      </span>
                    )
                  },
                  {
                    key: 'medium',
                    header: 'Medium',
                    width: '10%',
                    align: 'center'
                  },
                  {
                    key: 'budget',
                    header: 'Budget',
                    width: '12%',
                    align: 'right',
                    render: (value) => `$${value.toLocaleString()}`
                  },
                  {
                    key: 'spend',
                    header: 'Spend',
                    width: '12%',
                    align: 'right',
                    render: (value) => `$${value.toLocaleString()}`
                  },
                  {
                    key: 'revenue',
                    header: 'Revenue',
                    width: '12%',
                    align: 'right',
                    render: (value) => (
                      <span className="text-green-400 font-medium">
                        ${value.toLocaleString()}
                      </span>
                    )
                  },
                  {
                    key: 'conversions',
                    header: 'Conversions',
                    width: '10%',
                    align: 'right'
                  },
                  {
                    key: 'roas',
                    header: 'ROAS',
                    width: '9%',
                    align: 'right',
                    render: (value) => (
                      <span className="text-blue-400 font-medium">
                        {value.toFixed(1)}x
                      </span>
                    )
                  }
                ]}
                data={marketingData.campaigns}
              />
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
