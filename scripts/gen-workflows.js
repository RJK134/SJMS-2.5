const fs = require("fs");
const dir = "n8n-workflows";

const authParams = {
  sendHeaders: true,
  headerParameters: { parameters: [{ name: "X-Internal-Service-Key", value: "={{$env.INTERNAL_SERVICE_KEY}}" }] }
};

function notifyNode(userId, title, message, category, priority) {
  const body = { userId: "PLACEHOLDER", title, message, category, priority };
  const jsonStr = JSON.stringify(body).replace('"PLACEHOLDER"', userId);
  return {
    parameters: {
      url: "http://api:3001/api/v1/notifications",
      method: "POST",
      ...authParams,
      sendBody: true,
      specifyBody: "json",
      jsonBody: "={{ JSON.stringify(" + jsonStr + ") }}",
      options: {}
    },
    name: "Create Notification",
    type: "n8n-nodes-base.httpRequest",
    typeVersion: 3,
    position: [850, 200]
  };
}

const webhookConns = {
  "SJMS Webhook": { main: [[{ node: "Filter Event", type: "main", index: 0 }]] },
  "Filter Event": { main: [[{ node: "Get Details", type: "main", index: 0 }], []] },
  "Get Details": { main: [[{ node: "Create Notification", type: "main", index: 0 }]] }
};

const workflows = [
  { num: "01", name: "Student Enrolment Notification", path: "sjms/enrolments", event: "enrolments.created", ep: "enrolments", userId: "$json.data.studentId", cat: "ENROLMENT", pri: "NORMAL", msg: "You have been enrolled. Check your student portal for details." },
  { num: "02", name: "Application Status Change", path: "sjms/applications", event: "applications.updated", ep: "applications", userId: "$json.data.applicantId", cat: "ADMISSIONS", pri: "HIGH", msg: "Your application status has been updated." },
  { num: "03", name: "Marks Released Notification", path: "sjms/marks", event: "marks.updated", ep: "marks", userId: "$json.data.studentId", cat: "ASSESSMENT", pri: "NORMAL", msg: "New marks have been published. Check your student portal." },
  { num: "04", name: "Attendance Alert Escalation", path: "sjms/attendance", event: "attendance.created", ep: "attendance", userId: "$json.data.studentId", cat: "ATTENDANCE", pri: "HIGH", msg: "Attendance has dropped below the threshold. Review required." },
  { num: "05", name: "UKVI Compliance Monitor", path: "sjms/ukvi", event: "ukvi.updated", ep: "ukvi", userId: "$json.data.studentId", cat: "UKVI", pri: "HIGH", msg: "UKVI record updated. Contact point review may be required." },
  { num: "06", name: "Payment Received Confirmation", path: "sjms/finance", event: "finance.updated", ep: "finance", userId: "$json.data.studentId", cat: "FINANCE", pri: "NORMAL", msg: "Your payment has been recorded." },
  { num: "07", name: "EC Claim Submitted", path: "sjms/ec-claims", event: "ec_claims.created", ep: "ec-claims", userId: "$json.data.studentId", cat: "EC_CLAIMS", pri: "HIGH", msg: "A new EC claim has been submitted for review." },
  { num: "08", name: "Document Upload Verification", path: "sjms/documents", event: "documents.created", ep: "documents", userId: "$json.data.createdBy", cat: "DOCUMENTS", pri: "NORMAL", msg: "A document has been uploaded and requires verification." },
  { num: "09", name: "Exam Board Decision Notification", path: "sjms/exam-boards", event: "exam_boards.updated", ep: "exam-boards", userId: "$json.data.createdBy", cat: "EXAM_BOARDS", pri: "HIGH", msg: "The exam board has made decisions. Check your portal." },
  { num: "10", name: "Offer Made to Applicant", path: "sjms/offers", event: "offers.created", ep: "offers", userId: "$json.data.applicantId", cat: "ADMISSIONS", pri: "HIGH", msg: "You have received an offer. Log in to view and respond." },
  { num: "11", name: "Enrolment Status Change Handler", path: "sjms/enrolment-changes", event: "enrolments.updated", ep: "enrolments", userId: "$json.data.studentId", cat: "ENROLMENT", pri: "HIGH", msg: "Your enrolment status has been updated." },
  { num: "12", name: "Module Registration Confirmed", path: "sjms/module-registrations", event: "module_registrations.created", ep: "module-registrations", userId: "$json.data.studentId", cat: "ENROLMENT", pri: "NORMAL", msg: "Your module registration has been confirmed." },
  { num: "14", name: "Support Ticket Assignment", path: "sjms/support", event: "support.created", ep: "support", userId: "$json.data.studentId", cat: "SUPPORT", pri: "NORMAL", msg: "A new support ticket has been raised." },
  { num: "15", name: "Programme Approval Routing", path: "sjms/programme-approvals", event: "programme_approvals.created", ep: "programme-approvals", userId: "$json.data.createdBy", cat: "GOVERNANCE", pri: "HIGH", msg: "A programme approval request requires your review." },
];

for (const w of workflows) {
  const wf = {
    name: w.num + " \u2014 " + w.name,
    nodes: [
      { parameters: { httpMethod: "POST", path: w.path, options: {} }, name: "SJMS Webhook", type: "n8n-nodes-base.webhook", typeVersion: 1, position: [250, 300] },
      { parameters: { conditions: { string: [{ value1: "={{ $json.event }}", value2: w.event }] } }, name: "Filter Event", type: "n8n-nodes-base.if", typeVersion: 1, position: [450, 300] },
      { parameters: { url: "=http://api:3001/api/v1/" + w.ep + "/{{ $json.data.id }}", ...authParams, options: {} }, name: "Get Details", type: "n8n-nodes-base.httpRequest", typeVersion: 3, position: [650, 200] },
      notifyNode(w.userId, w.name, w.msg, w.cat, w.pri),
    ],
    connections: webhookConns,
    active: false,
    settings: { executionOrder: "v1" },
    tags: [{ name: "sjms" }]
  };
  const slug = w.name.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "");
  fs.writeFileSync(dir + "/" + w.num + "-" + slug + ".json", JSON.stringify(wf, null, 2) + "\n");
}

// Workflow 13 schedule trigger
const body13 = JSON.stringify({
  userId: "PLACEHOLDER",
  title: "Assessment Deadline Approaching",
  message: "You have assessments due within the next 7 days.",
  category: "ASSESSMENT",
  priority: "NORMAL"
}).replace('"PLACEHOLDER"', '$json.data?.[0]?.createdBy ?? "system"');

const wf13 = {
  name: "13 \u2014 Assessment Deadline Reminder",
  nodes: [
    { parameters: { rule: { interval: [{ field: "hours", hoursInterval: 24 }] } }, name: "Daily Schedule", type: "n8n-nodes-base.scheduleTrigger", typeVersion: 1, position: [250, 300] },
    { parameters: { url: "http://api:3001/api/v1/assessments", qs: { limit: "50", sort: "dueDate", order: "asc" }, ...authParams, options: {} }, name: "Get Upcoming Assessments", type: "n8n-nodes-base.httpRequest", typeVersion: 3, position: [450, 300] },
    { parameters: { url: "http://api:3001/api/v1/notifications", method: "POST", ...authParams, sendBody: true, specifyBody: "json", jsonBody: "={{ JSON.stringify(" + body13 + ") }}", options: {} }, name: "Create Reminders", type: "n8n-nodes-base.httpRequest", typeVersion: 3, position: [650, 300] }
  ],
  connections: {
    "Daily Schedule": { main: [[{ node: "Get Upcoming Assessments", type: "main", index: 0 }]] },
    "Get Upcoming Assessments": { main: [[{ node: "Create Reminders", type: "main", index: 0 }]] }
  },
  active: false,
  settings: { executionOrder: "v1" },
  tags: [{ name: "sjms" }, { name: "assessment" }]
};
fs.writeFileSync(dir + "/13-assessment-deadline-reminder.json", JSON.stringify(wf13, null, 2) + "\n");

// Validate
const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
let ok = 0;
for (const f of files) {
  JSON.parse(fs.readFileSync(dir + "/" + f, "utf8"));
  ok++;
}
console.log(ok + "/" + files.length + " workflows valid");
files.forEach(f => console.log("  " + f));
