html,
body {
  margin: 0;
  padding: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #f3f6fb;
  color: #14213d;
}

* {
  box-sizing: border-box;
}

button {
  font: inherit;
}

.page-shell {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 20px 60px;
}

.topbar,
.panel-header,
.card-header,
.stack-item,
.report-card,
.topbar-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.topbar {
  margin-bottom: 28px;
  padding: 24px 26px;
  background: linear-gradient(135deg, #0b1f3a, #12376b);
  border-radius: 22px;
  color: white;
  box-shadow: 0 20px 45px rgba(11, 31, 58, 0.18);
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.75;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  font-size: clamp(1.7rem, 3vw, 2.4rem);
}

.topbar-actions {
  gap: 10px;
}

.primary-btn,
.secondary-btn,
.ghost-btn {
  border: 0;
  border-radius: 12px;
  padding: 10px 18px;
  cursor: pointer;
  transition: 0.2s ease;
}

.primary-btn {
  background: #f5b942;
  color: #1f1c0f;
  font-weight: 700;
}

.secondary-btn,
.ghost-btn {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.primary-btn:hover,
.secondary-btn:hover,
.ghost-btn:hover {
  transform: translateY(-1px);
}

.summary-grid,
.panel-grid {
  display: grid;
  gap: 20px;
}

.summary-grid {
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  margin-bottom: 22px;
}

.summary-card,
.panel {
  background: white;
  border: 1px solid #e5ebf7;
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(13, 32, 58, 0.05);
}

.summary-card {
  padding: 18px 18px 16px;
}

.card-label {
  font-size: 0.82rem;
  color: #5d6b82;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge.up {
  background: rgba(17, 149, 80, 0.1);
  color: #0f8b50;
}

.badge.down {
  background: rgba(199, 75, 75, 0.1);
  color: #b63d3d;
}

.summary-card h2 {
  margin-top: 18px;
  font-size: clamp(1.4rem, 2vw, 2rem);
}

.summary-card p {
  margin-top: 8px;
  color: #69778d;
  font-size: 0.9rem;
}

.panel-grid {
  grid-template-columns: 2.3fr 1fr;
  margin-bottom: 22px;
}

.large-panel,
.panel {
  padding: 20px 18px;
}

.panel-header {
  margin-bottom: 16px;
}

.panel-header h3 {
  font-size: 1.2rem;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
}

th,
td {
  text-align: right;
  padding: 12px 10px;
  border-bottom: 1px solid #edf1f7;
  font-size: 0.92rem;
}

th {
  color: #66758d;
  font-weight: 700;
}

.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  border: 1px solid transparent;
}

.status.paid,
.status.approved {
  background: rgba(17, 149, 80, 0.1);
  color: #0d7b49;
  border-color: rgba(17, 149, 80, 0.14);
}

.status.pending,
.status.review {
  background: rgba(245, 185, 66, 0.12);
  color: #9c6f10;
  border-color: rgba(245, 185, 66, 0.2);
}

.status.overdue {
  background: rgba(183, 44, 44, 0.08);
  color: #a43333;
  border-color: rgba(183, 44, 44, 0.12);
}

.stack-list,
.report-stack {
  display: grid;
  gap: 14px;
}

.stack-item,
.report-card {
  padding: 12px 10px;
  border: 1px solid #edf1f7;
  border-radius: 12px;
  background: #fafcff;
}

.stack-item strong,
.report-card strong {
  display: block;
  margin-bottom: 5px;
}

.stack-item small,
.report-card small {
  display: block;
  color: #71809a;
}

.amount-column {
  display: grid;
  justify-items: end;
}

.report-card span {
  font-weight: 800;
  color: #133663;
}

.lower-grid {
  grid-template-columns: 2.3fr 1fr;
}

@media (max-width: 980px) {
  .summary-grid,
  .panel-grid,
  .lower-grid {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
