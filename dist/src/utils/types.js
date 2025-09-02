"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Satisfaction = exports.PriorityLevel = exports.IssueStatus = exports.RoleTypes = void 0;
var RoleTypes;
(function (RoleTypes) {
    RoleTypes["CITIZEN"] = "citizen";
    RoleTypes["MLASTAFF"] = "mlastaff";
    RoleTypes["DEPT"] = "dept";
    RoleTypes["DEPT_STAFF"] = "dept_staff";
    RoleTypes["ADMIN"] = "admin";
})(RoleTypes || (exports.RoleTypes = RoleTypes = {}));
var IssueStatus;
(function (IssueStatus) {
    IssueStatus["PENDING"] = "pending";
    IssueStatus["IN_PROGRESS"] = "in_progress";
    IssueStatus["RESOLVED"] = "resolved";
    IssueStatus["REJECTED"] = "rejected";
})(IssueStatus || (exports.IssueStatus = IssueStatus = {}));
var PriorityLevel;
(function (PriorityLevel) {
    PriorityLevel["HIGH"] = "high";
    PriorityLevel["NORMAL"] = "normal";
    PriorityLevel["LOW"] = "low";
})(PriorityLevel || (exports.PriorityLevel = PriorityLevel = {}));
var Satisfaction;
(function (Satisfaction) {
    Satisfaction["GOOD"] = "good";
    Satisfaction["AVERAGE"] = "average";
    Satisfaction["POOR"] = "poor";
})(Satisfaction || (exports.Satisfaction = Satisfaction = {}));
