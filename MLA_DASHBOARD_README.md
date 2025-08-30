# MLA Dashboard API Documentation

## Overview

The MLA Dashboard API provides comprehensive data and analytics for Members of Legislative Assembly (MLAs) to monitor and manage their constituencies effectively. This includes constituency statistics, department performance metrics, issue tracking, user engagement data, and AI-powered suggestions.

## Features

### 1. Constituency Overview

- **Demographics**: Total voters, active voters, population, area, literacy rate
- **Administrative Structure**: Total panchayats and wards
- **Real-time Updates**: Live data with last updated timestamps

### 2. Department Performance Analytics

- **Issue Management**: Total issues, resolved, pending counts
- **Response Metrics**: Average response time and satisfaction ratings
- **Budget Tracking**: Budget allocation vs. actual spending
- **Performance Indicators**: Department-wise efficiency metrics

### 3. Issue Tracking & Analytics

- **Monthly Trends**: Issue volume, resolution rates, and satisfaction scores
- **Category Analysis**: Issue distribution by type and priority
- **Resolution Metrics**: Average resolution time and critical issue tracking
- **Recent Issues**: Latest submissions with status and location details

### 4. User Engagement Metrics

- **Daily Activity**: Active users, new issues, resolved issues
- **Satisfaction Tracking**: User satisfaction scores and complaint rates
- **Weekly Patterns**: Engagement trends across different days

### 5. AI-Powered Insights

- **Performance Recommendations**: Automated suggestions for improvement
- **Budget Optimization**: Smart allocation and reallocation suggestions
- **User Experience**: Enhancement recommendations based on usage patterns
- **Infrastructure Planning**: Long-term development suggestions

## API Endpoints

### Base URL

```
/api/mla-dashboard
```

### 1. Get MLA Dashboard Data

```http
GET /api/mla-dashboard/{constituencyId}
```

**Description**: Retrieves comprehensive dashboard data for a specific constituency.

**Parameters**:

- `constituencyId` (path): ID of the constituency

**Headers**:

- `Authorization`: Bearer token (JWT)

**Response**:

```json
{
  "success": true,
  "message": "MLA Dashboard data retrieved successfully",
  "data": {
    "constituency_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "total_voters": 125000,
    "active_voters": 89000,
    "total_panchayats": 15,
    "total_wards": 120,
    "area": "214.86 sq km",
    "population": "957,730",
    "literacy_rate": "94.2%",
    "department_stats": [...],
    "monthly_issues": [...],
    "category_stats": [...],
    "user_engagement": [...],
    "ai_suggestions": [...],
    "recent_issues": [...],
    "last_updated": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Update MLA Dashboard Data

```http
PUT /api/mla-dashboard/{constituencyId}
```

**Description**: Updates dashboard data for a specific constituency.

**Parameters**:

- `constituencyId` (path): ID of the constituency

**Headers**:

- `Authorization`: Bearer token (JWT)
- `Content-Type`: application/json

**Request Body**: Partial or complete dashboard data object

**Response**:

```json
{
  "success": true,
  "message": "MLA Dashboard data updated successfully",
  "data": { ... }
}
```

### 3. Get Real-time Statistics

```http
GET /api/mla-dashboard/{constituencyId}/stats
```

**Description**: Retrieves real-time issue statistics and recent activity.

**Parameters**:

- `constituencyId` (path): ID of the constituency

**Headers**:

- `Authorization`: Bearer token (JWT)

**Response**:

```json
{
  "success": true,
  "message": "Real-time statistics retrieved successfully",
  "data": {
    "total_issues": 156,
    "pending_issues": 14,
    "resolved_issues": 142,
    "in_progress_issues": 0,
    "resolution_rate": 91.03,
    "recent_issues": [...]
  }
}
```

## Data Models

### MLADashboard Schema

```typescript
interface MLADashboard {
  constituency_id: ObjectId;
  total_voters: number;
  active_voters: number;
  total_panchayats: number;
  total_wards: number;
  area: string;
  population: string;
  literacy_rate: string;
  department_stats: DepartmentStats[];
  monthly_issues: MonthlyIssues[];
  category_stats: CategoryStats[];
  user_engagement: UserEngagement[];
  ai_suggestions: AISuggestions[];
  recent_issues: RecentIssues[];
  last_updated: Date;
}
```

### Department Statistics

```typescript
interface DepartmentStats {
  name: string;
  issues: number;
  resolved: number;
  pending: number;
  avgResponse: number;
  satisfaction: number;
  budget: number;
  spent: number;
}
```

### Monthly Issues

```typescript
interface MonthlyIssues {
  month: string;
  total: number;
  resolved: number;
  pending: number;
  critical: number;
  avgResolution: number;
  satisfaction: number;
}
```

## Authentication & Authorization

### Role Requirements

- **User Role**: Must have `mla` role
- **Authentication**: JWT token required
- **Authorization**: MLA-specific middleware validation

### Security Features

- Role-based access control
- JWT token validation
- Constituency-specific data isolation
- Input validation and sanitization

## Error Handling

### Common Error Codes

- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - User doesn't have MLA role
- `404`: Not Found - User or constituency not found
- `400`: Bad Request - Validation errors
- `500`: Internal Server Error - Server-side issues

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Usage Examples

### Frontend Integration

```javascript
// Get dashboard data
const getDashboardData = async (constituencyId) => {
  const response = await fetch(`/api/mla-dashboard/${constituencyId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

// Update dashboard data
const updateDashboardData = async (constituencyId, data) => {
  const response = await fetch(`/api/mla-dashboard/${constituencyId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

### Real-time Updates

```javascript
// Poll for real-time stats
const getRealTimeStats = async (constituencyId) => {
  const response = await fetch(`/api/mla-dashboard/${constituencyId}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Update stats every 30 seconds
setInterval(() => {
  getRealTimeStats(constituencyId).then(updateUI);
}, 30000);
```

## Mock Data

The API automatically generates comprehensive mock data for constituencies that don't have existing dashboard data. This includes:

- **Constituency Statistics**: Realistic demographic and administrative data
- **Department Performance**: Sample data for common government departments
- **Issue Analytics**: Monthly trends and category distributions
- **User Engagement**: Weekly activity patterns
- **AI Suggestions**: Performance optimization recommendations

## Development & Testing

### Local Development

1. Ensure MongoDB is running
2. Set up environment variables
3. Run the development server
4. Access Swagger documentation at `/api-docs`

### Testing Endpoints

- Use Swagger UI for interactive testing
- Test with valid MLA user accounts
- Verify constituency ID parameters
- Check role-based access control

### Data Seeding

```typescript
import { seedMockMLADashboardData } from "./utils/mockDataGenerator";

// Seed mock data for testing
await seedMockMLADashboardData("constituency_id_here");
```

## Future Enhancements

### Planned Features

- **Real-time Notifications**: Push notifications for critical issues
- **Advanced Analytics**: Machine learning-based insights
- **Mobile Optimization**: Progressive Web App features
- **Integration APIs**: Third-party service connections
- **Custom Dashboards**: User-configurable layouts

### Performance Optimizations

- **Caching**: Redis-based data caching
- **Aggregation**: MongoDB aggregation pipelines
- **Indexing**: Optimized database queries
- **CDN**: Static asset delivery optimization

## Support & Documentation

### API Documentation

- **Swagger UI**: `/api-docs`
- **OpenAPI Spec**: Available in Swagger format
- **Code Examples**: Comprehensive usage samples

### Technical Support

- **GitHub Issues**: Bug reports and feature requests
- **API Status**: Health check endpoint at `/health`
- **Logging**: Comprehensive error logging and monitoring

---

**Note**: This API is designed specifically for MLA users and provides comprehensive constituency management capabilities. Ensure proper authentication and authorization before accessing any endpoints.
