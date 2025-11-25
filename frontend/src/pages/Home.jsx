import { useEffect, useState } from "react";
import axios from "axios";

const TABS = ["Apply", "Add Resume", "Status"];
const STATUS_OPTIONS = ["All", "Applied", "Interview", "Offer", "Rejected"];
const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "tech", label: "Tech" },
  { value: "non-tech", label: "Non-Tech" },
  { value: "consulting", label: "Consulting" },
  { value: "cloud", label: "Cloud" },
  { value: "ai", label: "AI" },
  { value: "finance", label: "Finance" },
  { value: "ecommerce", label: "Ecommerce" },
  { value: "manufacturing", label: "Manufacturing" },
];
const COMPANY_LINKS = [
  { name: "Microsoft", url: "https://careers.microsoft.com", fields: ["software", "cloud", "ai"], type: "tech" },
  { name: "Google", url: "https://careers.google.com", fields: ["software", "search", "ai"], type: "tech" },
  { name: "Amazon", url: "https://www.amazon.jobs", fields: ["software", "cloud", "ecommerce"], type: "tech" },
  { name: "Infosys", url: "https://www.infosys.com/careers", fields: ["consulting", "software", "outsourcing"], type: "consulting" },
  { name: "TCS", url: "https://www.tcs.com/careers", fields: ["consulting", "software", "outsourcing"], type: "consulting" },
  { name: "Wipro", url: "https://careers.wipro.com", fields: ["consulting", "software", "outsourcing"], type: "consulting" },
  { name: "IBM", url: "https://www.ibm.com/careers", fields: ["software", "cloud", "consulting"], type: "tech" },
  { name: "Accenture", url: "https://www.accenture.com/in-en/careers", fields: ["consulting", "software", "outsourcing"], type: "consulting" },
  { name: "Capgemini", url: "https://www.capgemini.com/careers", fields: ["consulting", "software", "outsourcing"], type: "consulting" },
  { name: "Oracle", url: "https://www.oracle.com/careers", fields: ["software", "cloud", "database"], type: "tech" },
  { name: "SAP", url: "https://www.sap.com/about/careers.html", fields: ["software", "erp", "cloud"], type: "tech" },
  { name: "Cognizant", url: "https://careers.cognizant.com", fields: ["consulting", "software", "outsourcing"], type: "consulting" },
  { name: "ICICI Bank", url: "https://www.icicicareers.com", fields: ["finance", "banking"], type: "finance" },
  { name: "HDFC Bank", url: "https://www.hdfcbank.com/personal/about-us/careers", fields: ["finance", "banking"], type: "finance" },
  { name: "Maruti Suzuki", url: "https://www.marutisuzuki.com/corporate/careers", fields: ["manufacturing", "automobile"], type: "manufacturing" },
  { name: "Tata Motors", url: "https://careers.tatamotors.com", fields: ["manufacturing", "automobile"], type: "manufacturing" },
  { name: "Deloitte", url: "https://jobs2.deloitte.com", fields: ["consulting", "finance"], type: "consulting" },
  { name: "Flipkart", url: "https://www.flipkartcareers.com", fields: ["ecommerce", "tech"], type: "ecommerce" },
  { name: "Byju's", url: "https://careers.byjus.com", fields: ["edtech", "non-tech"], type: "non-tech" },
];

const ADZUNA_APP_ID = "43d6f6a3";
const ADZUNA_APP_KEY = "2f501b89fa6f4a89f70f38ff772ea0b1";
const COUNTRY_OPTIONS = [
  { code: "in", label: "India" },
  { code: "us", label: "USA" },
  { code: "uk", label: "UK" },
];

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: "", company: "", status: "Applied" });
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tab, setTab] = useState("Apply");
  const [adzunaJobs, setAdzunaJobs] = useState([]);
  const [loadingAdzuna, setLoadingAdzuna] = useState(false);
  const [country, setCountry] = useState("in");
  const [typeFilter, setTypeFilter] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    fetchJobs();
    // eslint-disable-next-line
  }, [statusFilter]);

  const fetchJobs = async () => {
    let url = "http://localhost:5000/applications";
    const params = [];
    if (statusFilter !== "All") params.push(`status=${statusFilter}`);
    if (params.length) url += `?${params.join("&")}`;
    const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    setJobs(res.data);
  };

  const addJob = async () => {
    if (!form.title || !form.company) return;
    await axios.post(
      "http://localhost:5000/applications",
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setForm({ title: "", company: "", status: "Applied" });
    fetchJobs();
  };

  const handleSearch = async () => {
    setSearchQuery(search);
    setLoadingAdzuna(true);
    setAdzunaJobs([]);
    try {
      const res = await fetch(
        `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=20&what=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      setAdzunaJobs(data.results || []);
    } catch (err) {
      setAdzunaJobs([]);
    }
    setLoadingAdzuna(false);
  };

  if (!token) {
    return (
      <div className="page-message">
        Please <b>log in</b> to use the job tracker.
      </div>
    );
  }

  // Enhanced search logic for jobs and companies (use searchQuery, not search)
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCompanies = COMPANY_LINKS.filter(
    (c) =>
      (typeFilter === "all" || c.type === typeFilter) &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.fields.some(field => field.includes(searchQuery.toLowerCase())))
  );
  // Filter Adzuna jobs by type if not 'all'
  const filteredAdzunaJobs = adzunaJobs.filter(job => {
    if (typeFilter === "all") return true;
    const typeKeyword = TYPE_OPTIONS.find(opt => opt.value === typeFilter)?.label?.toLowerCase();
    return (
      (job.title && job.title.toLowerCase().includes(typeKeyword)) ||
      (job.description && job.description.toLowerCase().includes(typeKeyword))
    );
  });

  return (
    <div>
      {/* Search bar */}
      <div className="home-search-row">
        <input
          style={{flex: 1, fontSize: '1.1rem', padding: '10px 14px'}}
          placeholder="Search Jobs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>
          Search
        </button>
        <select
          style={{fontSize: '1.1rem', padding: '10px 14px'}}
          value={country}
          onChange={e => setCountry(e.target.value)}
        >
          {COUNTRY_OPTIONS.map(opt => (
            <option key={opt.code} value={opt.code}>{opt.label}</option>
          ))}
        </select>
        <select
          style={{fontSize: '1.1rem', padding: '10px 14px'}}
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          {TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Tabs as large buttons */}
      <div className="home-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={
              tab === t
                ? "home-tab-button home-tab-button--active"
                : "home-tab-button"
            }
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "Apply" && (
        <div style={{marginBottom: 40}}>
          <h2>Add New Job</h2>
          <div>
            <input
              placeholder="Job Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              placeholder="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Applied</option>
              <option>Interview</option>
              <option>Rejected</option>
              <option>Offer</option>
            </select>
            <button onClick={addJob}>+ Add</button>
          </div>
        </div>
      )}
      {tab === "Add Resume" && (
        <div style={{marginBottom: 40}}>
          <h2>Add Resume</h2>
          <div>Feature coming soon.</div>
        </div>
      )}
      {tab === "Status" && (
        <div style={{marginBottom: 40}}>
          <h2>Status</h2>
          <div>Use the status section at the bottom to view all your applications.</div>
        </div>
      )}

      {/* Search Results: Jobs and Companies */}
      {searchQuery && (
        <div style={{marginBottom: 32}}>
          <h2>Search Results</h2>
          {filteredJobs.length > 0 && <div style={{marginBottom: 12}}><b>Matching Jobs:</b></div>}
          {filteredJobs.map((job) => (
            <div key={job._id} className="card">
              <b>{job.title}</b> at {job.company}
              <div>Status: {job.status}</div>
            </div>
          ))}
          {filteredCompanies.length > 0 && <div style={{margin: '18px 0 8px 0'}}><b>Matching Companies:</b></div>}
          {filteredCompanies.map((c) => (
            <div key={c.name} style={{marginBottom: 8}}>
              <a href={c.url} target="_blank" rel="noopener noreferrer" style={{color: '#1976d2', textDecoration: 'underline'}}>{c.name}</a>
            </div>
          ))}
          {/* Adzuna API job results */}
          {loadingAdzuna && <div>Loading real jobs...</div>}
          {filteredAdzunaJobs.length > 0 && <div style={{margin: '18px 0 8px 0'}}><b>Live Jobs from Adzuna:</b></div>}
          {filteredAdzunaJobs.map((job) => (
            <div key={job.id} className="card">
              <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" style={{color: '#1976d2', fontWeight: 600, textDecoration: 'underline'}}>{job.title}</a>
              <div>{job.company && job.company.display_name ? job.company.display_name : "Unknown Company"}</div>
              <div style={{fontSize: '0.95rem', color: '#444'}}>{job.location && job.location.display_name}</div>
            </div>
          ))}
          {filteredJobs.length === 0 && filteredCompanies.length === 0 && filteredAdzunaJobs.length === 0 && !loadingAdzuna && (
            <div>No jobs found for this field or country. Try a different keyword or country.</div>
          )}
        </div>
      )}

      {/* Status section always at the bottom */}
      <div style={{marginTop: 48}}>
        <h2>Status</h2>
        <div style={{marginBottom: 12}}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{fontSize: '1.1rem', padding: '8px 14px'}}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        {jobs
          .filter((job) => statusFilter === "All" || job.status === statusFilter)
          .map((job) => (
            <div key={job._id} className="card">
              <b>{job.company}</b> - {job.title} - <span style={{fontWeight: 500}}>{job.status}</span>
            </div>
          ))}
        {jobs.filter((job) => statusFilter === "All" || job.status === statusFilter).length === 0 && (
          <div>No applications found for this status.</div>
        )}
      </div>
    </div>
  );
}
