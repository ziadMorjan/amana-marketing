"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, Campaign } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { SearchFilter } from '../../src/components/ui/search-filter';
import { DropdownFilter } from '../../src/components/ui/dropdown-filter';
import { Target, DollarSign, TrendingUp, Users, Activity, Zap, Filter } from 'lucide-react';

export default function CampaignView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

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

  // Filter campaigns based on current filter values
  const filteredCampaigns = useMemo(() => {
    if (!marketingData?.campaigns) return [];

    return marketingData.campaigns.filter((campaign: Campaign) => {
      const matchesName = campaign.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesType = typeFilter.length === 0 || typeFilter.includes(campaign.objective);
      
      return matchesName && matchesType;
    });
  }, [marketingData?.campaigns, nameFilter, typeFilter]);

  // Get unique campaign types for the dropdown
  const campaignTypes = useMemo(() => {
    if (!marketingData?.campaigns) return [];
    return [...new Set(marketingData.campaigns.map((campaign: Campaign) => campaign.objective))];
  }, [marketingData?.campaigns]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
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
              {/* Filters Section */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Filter className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-semibold text-white">Filters</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchFilter
                    title="Campaign Name"
                    placeholder="Search campaigns..."
                    value={nameFilter}
                    onChange={setNameFilter}
                  />
                  
                  <DropdownFilter
                    title="Campaign Type"
                    options={campaignTypes}
                    selectedValues={typeFilter}
                    onChange={setTypeFilter}
                    placeholder="Select campaign types..."
                  />
                </div>
              </div>

              {/* Results Summary */}
              <div className="mb-6">
                <p className="text-gray-400">
                  Showing {filteredCampaigns.length} of {marketingData.campaigns.length} campaigns
                </p>
              </div>

              {/* Campaign Overview Metrics - Updated with filtered data */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <CardMetric
                  title="Filtered Campaigns"
                  value={filteredCampaigns.length}
                  icon={<Target className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Total Spend"
                  value={`$${filteredCampaigns.reduce((sum, c) => sum + c.spend, 0).toLocaleString()}`}
                  icon={<DollarSign className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Total Revenue"
                  value={`$${filteredCampaigns.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                
                <CardMetric
                  title="Total Conversions"
                  value={filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0)}
                  icon={<Users className="h-5 w-5" />}
                />
              </div>

              {/* Campaign Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Campaigns by Revenue */}
                <BarChart
                  title="Top Campaigns by Revenue (Filtered)"
                  data={filteredCampaigns.slice(0, 6).map(campaign => ({
                    label: campaign.name.split(' - ')[0],
                    value: campaign.revenue,
                    color: '#10B981'
                  }))}
                  formatValue={(value) => `$${value.toLocaleString()}`}
                />

                {/* Campaign ROAS Comparison */}
                <BarChart
                  title="Campaign ROAS Comparison (Filtered)"
                  data={filteredCampaigns.slice(0, 6).map(campaign => ({
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
                  title="Campaign Performance by Medium (Filtered)"
                  data={(() => {
                    const mediumData: { [key: string]: { revenue: number, conversions: number } } = {};
                    filteredCampaigns.forEach(campaign => {
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
                  title="Campaign Conversion Rates (Filtered)"
                  data={filteredCampaigns.slice(0, 6).map(campaign => ({
                    label: campaign.name.split(' - ')[0],
                    value: campaign.conversion_rate,
                    color: '#F59E0B'
                  }))}
                  formatValue={(value) => `${value.toFixed(2)}%`}
                />
              </div>

              {/* Campaign Details Table */}
              <Table
                title={`Campaign Details (${filteredCampaigns.length} campaigns)`}
                showIndex={true}
                maxHeight="500px"
                columns={[
                  {
                    key: 'name',
                    header: 'Campaign Name',
                    width: '20%',
                    sortable: true,
                    sortType: 'string',
                    render: (value) => (
                      <div className="font-medium text-white">
                        {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                      </div>
                    )
                  },
                  {
                    key: 'objective',
                    header: 'Type',
                    width: '12%',
                    align: 'center',
                    sortable: true,
                    sortType: 'string',
                    render: (value) => (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                        {value}
                      </span>
                    )
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    width: '10%',
                    align: 'center',
                    sortable: true,
                    sortType: 'string',
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
                    align: 'center',
                    sortable: true,
                    sortType: 'string'
                  },
                  {
                    key: 'budget',
                    header: 'Budget',
                    width: '12%',
                    align: 'right',
                    sortable: true,
                    sortType: 'number',
                    render: (value) => `$${value.toLocaleString()}`
                  },
                  {
                    key: 'spend',
                    header: 'Spend',
                    width: '12%',
                    align: 'right',
                    sortable: true,
                    sortType: 'number',
                    render: (value) => `$${value.toLocaleString()}`
                  },
                  {
                    key: 'revenue',
                    header: 'Revenue',
                    width: '12%',
                    align: 'right',
                    sortable: true,
                    sortType: 'number',
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
                    align: 'right',
                    sortable: true,
                    sortType: 'number'
                  },
                  {
                    key: 'roas',
                    header: 'ROAS',
                    width: '9%',
                    align: 'right',
                    sortable: true,
                    sortType: 'number',
                    render: (value) => (
                      <span className="text-blue-400 font-medium">
                        {value.toFixed(1)}x
                      </span>
                    )
                  }
                ]}
                defaultSort={{ key: 'revenue', direction: 'desc' }}
                data={filteredCampaigns}
                emptyMessage="No campaigns match the current filters"
              />
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
