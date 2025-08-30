import { Request, Response } from "express";
import { userModel } from "../models/userModel";
import Constituency from "../models/constituencyModel";
import Issue from "../models/issueModel";
import Department from "../models/departmentModel";
import Panchayat from "../models/panchayatModel";
import { validateObjectIdParam } from "../utils/validation";
import { createInternalErrorResponse } from "../utils/response";
import { RoleTypes } from "../utils/types";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Get MLA dashboard data for a specific constituency (computed from existing models only)
export const getMLADashboard = async (req: AuthRequest, res: Response) => {
  try {
    const { constituencyId } = req.params;
    const user_id = req.user?.userId;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const user = await userModel.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== RoleTypes.MLASTAFF) {
      return res.status(403).json({
        success: false,
        message: "Access denied. MLA role required.",
      });
    }

    if (!validateObjectIdParam(constituencyId, "constituencyId")) {
      return res.status(400).json({
        success: false,
        message: "Invalid constituency ID",
      });
    }

    const constituency = await Constituency.findById(constituencyId);
    if (!constituency) {
      return res.status(404).json({
        success: false,
        message: "Constituency not found",
      });
    }

    // Compute dynamic counts for panchayats and wards
    const panchayats = await Panchayat.find({
      constituency_id: constituencyId,
    });
    const totalPanchayats = panchayats.length;
    const totalWards = panchayats.reduce(
      (sum, p: any) => sum + (p.ward_list?.length || 0),
      0
    );

    // Helper: days between two dates
    const daysBetween = (start?: Date, end?: Date) => {
      if (!start || !end) return null;
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    };

    // Helper: map satisfaction enum to 1-5 scale
    const satisfactionToScore = (s: string | undefined): number | null => {
      if (!s) return null;
      const val = String(s).toLowerCase();
      if (val === "good") return 5;
      if (val === "average") return 3;
      if (val === "poor") return 1;
      return null;
    };

    // Department statistics
    const departments = await Department.find({});
    const department_stats = await Promise.all(
      departments.map(async (dept: any) => {
        const filterBase: any = {
          constituency_id: constituencyId,
          department_id: dept._id,
        };
        const [issues, resolved, pending, resolvedDocs] = await Promise.all([
          Issue.countDocuments(filterBase),
          Issue.countDocuments({ ...filterBase, status: "resolved" }),
          Issue.countDocuments({ ...filterBase, status: "pending" }),
          Issue.find({ ...filterBase, status: "resolved" }).select(
            "createdAt completed_at satisfaction_score"
          ),
        ]);

        const responseDays: number[] = [];
        const satisfactionScores: number[] = [];
        resolvedDocs.forEach((doc: any) => {
          const d = daysBetween(doc.createdAt, doc.completed_at);
          if (d !== null) responseDays.push(d);
          const s = satisfactionToScore(doc.satisfaction_score);
          if (s !== null) satisfactionScores.push(s);
        });

        const avgResponse = responseDays.length
          ? Number(
              (
                responseDays.reduce((a, b) => a + b, 0) / responseDays.length
              ).toFixed(1)
            )
          : 0;
        const satisfaction = satisfactionScores.length
          ? Number(
              (
                satisfactionScores.reduce((a, b) => a + b, 0) /
                satisfactionScores.length
              ).toFixed(1)
            )
          : 0;

        return {
          name: dept.name,
          issues,
          resolved,
          pending,
          avgResponse,
          satisfaction,
          budget: 0,
          spent: 0,
        };
      })
    );

    // Monthly statistics for last 6 months
    const now = new Date();
    const months: { label: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = start.toLocaleString("en-US", { month: "short" });
      months.push({ label, start, end });
    }

    const monthly_issues = await Promise.all(
      months.map(async (m) => {
        const total = await Issue.countDocuments({
          constituency_id: constituencyId,
          createdAt: { $gte: m.start, $lt: m.end },
        });
        const resolvedDocs = await Issue.find({
          constituency_id: constituencyId,
          status: "resolved",
          createdAt: { $gte: m.start, $lt: m.end },
        }).select("createdAt completed_at satisfaction_score priority_level");
        const pending = await Issue.countDocuments({
          constituency_id: constituencyId,
          status: "pending",
          createdAt: { $gte: m.start, $lt: m.end },
        });
        const critical = await Issue.countDocuments({
          constituency_id: constituencyId,
          priority_level: "high",
          createdAt: { $gte: m.start, $lt: m.end },
        });

        const respDays: number[] = [];
        const satScores: number[] = [];
        resolvedDocs.forEach((doc: any) => {
          const d = daysBetween(doc.createdAt, doc.completed_at);
          if (d !== null) respDays.push(d);
          const s = satisfactionToScore(doc.satisfaction_score);
          if (s !== null) satScores.push(s);
        });
        const avgResolution = respDays.length
          ? Number(
              (respDays.reduce((a, b) => a + b, 0) / respDays.length).toFixed(1)
            )
          : 0;
        const satisfaction = satScores.length
          ? Number(
              (satScores.reduce((a, b) => a + b, 0) / satScores.length).toFixed(
                1
              )
            )
          : 0;

        const resolved = resolvedDocs.length;
        return {
          month: m.label,
          total,
          resolved,
          pending,
          critical,
          avgResolution,
          satisfaction,
        };
      })
    );

    // Category statistics derived from department shares
    const totalIssuesAll =
      department_stats.reduce((a, d) => a + d.issues, 0) || 1;
    const palette = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#ff7300",
      "#8dd1e1",
      "#a4de6c",
    ];
    const category_stats = department_stats.map((d, idx) => ({
      name: d.name,
      value: Number(((d.issues / totalIssuesAll) * 100).toFixed(1)),
      color: palette[idx % palette.length],
      priority:
        d.issues > 0
          ? d.resolved / d.issues < 0.6
            ? "High"
            : "Medium"
          : "Low",
      avgResolution: d.avgResponse,
    }));

    // User engagement placeholder (no model available)
    const user_engagement = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ].map((day) => ({
      day,
      activeUsers: 0,
      newIssues: 0,
      resolvedIssues: 0,
      satisfaction: 0,
      complaints: 0,
    }));

    // AI suggestions placeholder
    const ai_suggestions = [
      {
        type: "Performance",
        title: "Optimize Response Time",
        description:
          "Average response time can be improved. Consider workflow automation and SLAs.",
        priority: "High",
        impact: "High",
        implementation: "2-3 weeks",
        cost: "₹0",
        status: "pending",
      },
      {
        type: "Budget",
        title: "Budget Utilization Review",
        description:
          "Review department budgets and align spend with unresolved backlog priorities.",
        priority: "Medium",
        impact: "Medium",
        implementation: "1 week",
        cost: "₹0",
        status: "pending",
      },
    ];

    // Get last 5 issues live
    const recentIssuesLive = await Issue.find({
      constituency_id: constituencyId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("department_id", "name");

    const responseData = {
      constituency_id: constituencyId,
      total_voters: 0,
      active_voters: 0,
      total_panchayats: totalPanchayats,
      total_wards: totalWards,
      area: "N/A",
      population: "N/A",
      literacy_rate: "N/A",
      department_stats,
      monthly_issues,
      category_stats,
      user_engagement,
      ai_suggestions,
      recent_issues: recentIssuesLive.map((issue: any) => ({
        id: String(issue._id),
        title: issue.title,
        category: issue.department_id?.name || "Unknown",
        priority: issue.priority_level || "normal",
        status: issue.status,
        submitted: issue.createdAt,
        location: issue.locality,
      })),
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error getting MLA dashboard:", error);
    return createInternalErrorResponse(res, "Failed to get MLA dashboard data");
  }
};

// Get real-time statistics for MLA dashboard
export const getMLARealTimeStats = async (req: AuthRequest, res: Response) => {
  try {
    const { constituencyId } = req.params;
    const user_id = req.user?.userId;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const user = await userModel.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== RoleTypes.MLASTAFF) {
      return res.status(403).json({
        success: false,
        message: "Access denied. MLA role required.",
      });
    }

    if (!validateObjectIdParam(constituencyId, "constituencyId")) {
      return res.status(400).json({
        success: false,
        message: "Invalid constituency ID",
      });
    }

    const totalIssues = await Issue.countDocuments({
      constituency_id: constituencyId,
    });

    const pendingIssues = await Issue.countDocuments({
      constituency_id: constituencyId,
      status: "pending",
    });

    const resolvedIssues = await Issue.countDocuments({
      constituency_id: constituencyId,
      status: "resolved",
    });

    const inProgressIssues = await Issue.countDocuments({
      constituency_id: constituencyId,
      status: "in_progress",
    });

    const recentIssues = await Issue.find({ constituency_id: constituencyId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user_id", "name")
      .populate("department_id", "name");

    const stats = {
      total_issues: totalIssues,
      pending_issues: pendingIssues,
      resolved_issues: resolvedIssues,
      in_progress_issues: inProgressIssues,
      resolution_rate:
        totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0,
      recent_issues: recentIssues.map((issue: any) => ({
        id: issue._id,
        title: issue.title,
        category: issue.department_id?.name || "Unknown",
        priority: issue.priority_level,
        status: issue.status,
        submitted: issue.createdAt,
        location: issue.locality,
      })),
    };

    return res.status(200).json({
      success: true,
      message: "Real-time statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error getting real-time stats:", error);
    return createInternalErrorResponse(
      res,
      "Failed to get real-time statistics"
    );
  }
};
