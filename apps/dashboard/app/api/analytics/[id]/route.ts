import { NextResponse } from "next/server";

// Helper to generate mock frequency data (hourly)
type FrequencyItem = {
  time: string;
  totalVisits: number;
  uniqueVisitors: number;
};

const generateFrequency = (days: number = 30): FrequencyItem[] => {
  const frequency: FrequencyItem[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);

    // Random visits
    const totalVisits = Math.floor(Math.random() * 200) + 50;
    const uniqueVisitors = Math.floor(
      totalVisits * (0.6 + Math.random() * 0.4)
    );

    frequency.push({
      time: date.toISOString(),
      totalVisits,
      uniqueVisitors,
    });
  }

  return frequency;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } } // params comes from context
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Project ID required" },
      { status: 400 }
    );
  }

  const totalVisits = Math.floor(Math.random() * 2000) + 500;
  const uniqueVisitors = Math.floor(totalVisits * (0.6 + Math.random() * 0.3));
  const onlineVisitors = Math.floor(Math.random() * 50);

  const response = {
    success: true,
    message: "Analytics fetched successfully",
    data: {
      url: `https://paypal.com`,
      name: `Weird`,
      filter: "today",
      totalVisits,
      totalVisitsChange: "+12.5%",
      uniqueVisitors,
      uniqueVisitorsChange: "+8.2%",
      onlineVisitors,
      bounceRate: parseFloat((Math.random() * 50 + 10).toFixed(1)),
      frequency: generateFrequency(),
      osSummary: [
        { osName: "Windows", count: Math.floor(uniqueVisitors * 0.4) },
        { osName: "macOS", count: Math.floor(uniqueVisitors * 0.3) },
        { osName: "Linux", count: Math.floor(uniqueVisitors * 0.2) },
      ],
      deviceSummary: [
        { deviceType: "Desktop", count: Math.floor(uniqueVisitors * 0.7) },
        { deviceType: "Mobile", count: Math.floor(uniqueVisitors * 0.3) },
      ],
      browserSummary: [
        { browserName: "Chrome", count: Math.floor(uniqueVisitors * 0.5) },
        { browserName: "Firefox", count: Math.floor(uniqueVisitors * 0.2) },
        { browserName: "Safari", count: Math.floor(uniqueVisitors * 0.2) },
      ],
      topPaths: [
        { pathname: "/home", count: 400 },
        { pathname: "/about", count: 150 },
        { pathname: "/pricing", count: 100 },
      ],
      topHostnames: [
        { hostname: "project.example.com", count: 1000 },
        { hostname: "staging.project.example.com", count: 250 },
      ],
      topReferrers: [
        { referrer: "https://google.com", count: 300 },
        { referrer: "https://twitter.com", count: 150 },
      ],
      topUtmSources: [
        { utmSource: "newsletter", count: 120 },
        { utmSource: "adwords", count: 80 },
      ],
    },
  };

  return NextResponse.json(response);
}
