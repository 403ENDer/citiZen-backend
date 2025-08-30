import { MLADashboardModel } from "../models/mlaDashboardModel";

// Generate mock MLA dashboard data
export const generateMockMLADashboardData = (constituencyId: string) => {
  return {
    constituency_id: constituencyId,
    total_voters: 125000,
    active_voters: 89000,
    total_panchayats: 15,
    total_wards: 120,
    area: "214.86 sq km",
    population: "957,730",
    literacy_rate: "94.2%",
    department_stats: [
      {
        name: "Roads & Transport",
        issues: 156,
        resolved: 142,
        pending: 14,
        avgResponse: 2.1,
        satisfaction: 4.6,
        budget: 2500000,
        spent: 2100000,
      },
      {
        name: "Water Supply",
        issues: 89,
        resolved: 78,
        pending: 11,
        avgResponse: 1.8,
        satisfaction: 4.8,
        budget: 1800000,
        spent: 1650000,
      },
      {
        name: "Electricity",
        issues: 67,
        resolved: 62,
        pending: 5,
        avgResponse: 1.5,
        satisfaction: 4.9,
        budget: 1200000,
        spent: 1180000,
      },
      {
        name: "Sanitation",
        issues: 134,
        resolved: 118,
        pending: 16,
        avgResponse: 2.3,
        satisfaction: 4.3,
        budget: 900000,
        spent: 820000,
      },
      {
        name: "Education",
        issues: 45,
        resolved: 42,
        pending: 3,
        avgResponse: 1.2,
        satisfaction: 4.7,
        budget: 800000,
        spent: 750000,
      },
      {
        name: "Healthcare",
        issues: 78,
        resolved: 71,
        pending: 7,
        avgResponse: 1.9,
        satisfaction: 4.5,
        budget: 1500000,
        spent: 1420000,
      },
    ],
    monthly_issues: [
      {
        month: "Jan",
        total: 120,
        resolved: 98,
        pending: 22,
        critical: 8,
        avgResolution: 2.1,
        satisfaction: 4.3,
      },
      {
        month: "Feb",
        total: 135,
        resolved: 112,
        pending: 23,
        critical: 12,
        avgResolution: 1.9,
        satisfaction: 4.4,
      },
      {
        month: "Mar",
        total: 142,
        resolved: 125,
        pending: 17,
        critical: 15,
        avgResolution: 1.8,
        satisfaction: 4.5,
      },
      {
        month: "Apr",
        total: 128,
        resolved: 108,
        pending: 20,
        critical: 10,
        avgResolution: 2.2,
        satisfaction: 4.2,
      },
      {
        month: "May",
        total: 156,
        resolved: 138,
        pending: 18,
        critical: 18,
        avgResolution: 1.7,
        satisfaction: 4.6,
      },
      {
        month: "Jun",
        total: 148,
        resolved: 132,
        pending: 16,
        critical: 14,
        avgResolution: 1.6,
        satisfaction: 4.7,
      },
    ],
    category_stats: [
      {
        name: "Road Repair",
        value: 35,
        color: "#8884d8",
        priority: "High",
        avgResolution: 2.1,
      },
      {
        name: "Water Supply",
        value: 25,
        color: "#82ca9d",
        priority: "Medium",
        avgResolution: 1.8,
      },
      {
        name: "Electricity",
        value: 20,
        color: "#ffc658",
        priority: "High",
        avgResolution: 1.5,
      },
      {
        name: "Sanitation",
        value: 15,
        color: "#ff7300",
        priority: "Medium",
        avgResolution: 2.3,
      },
      {
        name: "Others",
        value: 5,
        color: "#8dd1e1",
        priority: "Low",
        avgResolution: 3.2,
      },
    ],
    user_engagement: [
      {
        day: "Mon",
        activeUsers: 245,
        newIssues: 18,
        resolvedIssues: 15,
        satisfaction: 4.3,
        complaints: 3,
      },
      {
        day: "Tue",
        activeUsers: 267,
        newIssues: 22,
        resolvedIssues: 19,
        satisfaction: 4.4,
        complaints: 2,
      },
      {
        day: "Wed",
        activeUsers: 289,
        newIssues: 25,
        resolvedIssues: 23,
        satisfaction: 4.5,
        complaints: 1,
      },
      {
        day: "Thu",
        activeUsers: 312,
        newIssues: 28,
        resolvedIssues: 26,
        satisfaction: 4.6,
        complaints: 2,
      },
      {
        day: "Fri",
        activeUsers: 298,
        newIssues: 24,
        resolvedIssues: 22,
        satisfaction: 4.4,
        complaints: 4,
      },
      {
        day: "Sat",
        activeUsers: 234,
        newIssues: 19,
        resolvedIssues: 17,
        satisfaction: 4.2,
        complaints: 3,
      },
      {
        day: "Sun",
        activeUsers: 201,
        newIssues: 16,
        resolvedIssues: 14,
        satisfaction: 4.1,
        complaints: 2,
      },
    ],
    ai_suggestions: [
      {
        type: "Performance",
        title: "Optimize Response Time",
        description:
          "Department response time has increased by 15% this month. Consider implementing automated workflows.",
        priority: "High",
        impact: "High",
        implementation: "2-3 weeks",
        cost: "₹50,000",
        status: "pending",
      },
      {
        type: "Budget",
        title: "Budget Reallocation",
        description:
          "Roads department has 16% budget remaining. Consider reallocating to high-priority projects.",
        priority: "Medium",
        impact: "Medium",
        implementation: "1 week",
        cost: "₹0",
        status: "pending",
      },
      {
        type: "User Experience",
        title: "Mobile App Enhancement",
        description:
          "User engagement drops 40% on weekends. Consider 24/7 support and mobile notifications.",
        priority: "Medium",
        impact: "High",
        implementation: "4-6 weeks",
        cost: "₹200,000",
        status: "pending",
      },
      {
        type: "Infrastructure",
        title: "Smart City Integration",
        description:
          "Implement IoT sensors for real-time monitoring of water supply and electricity.",
        priority: "Low",
        impact: "High",
        implementation: "3-4 months",
        cost: "₹2,500,000",
        status: "pending",
      },
    ],
    recent_issues: [
      {
        id: "ISS001",
        title: "Pothole on MG Road",
        category: "Roads",
        priority: "High",
        status: "In Progress",
        submitted: "2 hours ago",
        location: "MG Road, Near Central Station",
      },
      {
        id: "ISS002",
        title: "Water Supply Disruption",
        category: "Water",
        priority: "Critical",
        status: "Pending",
        submitted: "4 hours ago",
        location: "Kovalam Area",
      },
      {
        id: "ISS003",
        title: "Street Light Outage",
        category: "Electricity",
        priority: "Medium",
        status: "Resolved",
        submitted: "1 day ago",
        location: "Vizhinjam Road",
      },
      {
        id: "ISS004",
        title: "Garbage Collection Delay",
        category: "Sanitation",
        priority: "Medium",
        status: "In Progress",
        submitted: "1 day ago",
        location: "Thiruvananthapuram Municipality",
      },
      {
        id: "ISS005",
        title: "School Building Repair",
        category: "Education",
        priority: "Low",
        status: "Pending",
        submitted: "2 days ago",
        location: "Government High School",
      },
    ],
  };
};

// Function to seed mock data for a constituency
export const seedMockMLADashboardData = async (constituencyId: string) => {
  try {
    const mockData = generateMockMLADashboardData(constituencyId);

    // Check if data already exists
    const existingData = await MLADashboardModel.findOne({
      constituency_id: constituencyId,
    });

    if (existingData) {
      console.log(
        `MLA Dashboard data already exists for constituency ${constituencyId}`
      );
      return existingData;
    }

    // Create new mock data
    const newDashboardData = await MLADashboardModel.create(mockData);
    console.log(
      `Mock MLA Dashboard data created for constituency ${constituencyId}`
    );
    return newDashboardData;
  } catch (error) {
    console.error(`Error seeding mock MLA Dashboard data:`, error);
    throw error;
  }
};
