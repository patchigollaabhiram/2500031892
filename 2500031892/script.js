
const companies = [
  { name: "TCS", role: "Software Engineer", package: 3.6, minCgpa: 6.0 },
  { name: "Infosys", role: "Systems Engineer", package: 3.6, minCgpa: 6.0 },
  { name: "Wipro", role: "Project Engineer", package: 3.5, minCgpa: 6.0 },
  { name: "Accenture", role: "Associate Engineer", package: 4.5, minCgpa: 6.5 },
  { name: "Cognizant", role: "Programmer Analyst", package: 4.0, minCgpa: 6.0 },
  { name: "Amazon", role: "SDE", package: 18, minCgpa: 8.0 },
  { name: "Microsoft", role: "Software Engineer", package: 20, minCgpa: 8.5 },
  { name: "Deloitte", role: "Analyst", package: 6.0, minCgpa: 7.0 }
];

// These are sample project values, not live job offers.

let student = JSON.parse(localStorage.getItem("klStudent")) || null;
let applications = JSON.parse(localStorage.getItem("klApplications")) || [];

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });
  document.getElementById(pageId).classList.add("active");
  updateDashboard();
}

// Create 8 semester fields
const semesterBox = document.getElementById("semesterInputs");

for (let i = 1; i <= 8; i++) {
  semesterBox.innerHTML += `
    <div>
      <label>Semester ${i} SGPA</label>
      <input type="number" id="sem${i}"
        min="0" max="10" step="0.01"
        placeholder="0 to 10">
    </div>
  `;
}

function calculateCgpa() {
  let total = 0;
  let count = 0;

  for (let i = 1; i <= 8; i++) {
    const value = document.getElementById("sem" + i).value;

    if (value !== "") {
      total += Number(value);
      count++;
    }
  }

  const cgpa = count ? total / count : 0;
  document.getElementById("cgpaResult").textContent = cgpa.toFixed(2);
  return Number(cgpa.toFixed(2));
}

semesterBox.addEventListener("input", calculateCgpa);

document.getElementById("studentForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const semesters = [];

  for (let i = 1; i <= 8; i++) {
    semesters.push(document.getElementById("sem" + i).value);
  }

  student = {
    name: document.getElementById("studentName").value.trim(),
    regNo: document.getElementById("regNo").value.trim(),
    course: document.getElementById("course").value,
    branch: document.getElementById("branch").value,
    specialization: document.getElementById("specialization").value,
    backlogs: Number(document.getElementById("backlogs").value),
    semesters: semesters,
    cgpa: calculateCgpa()
  };

  localStorage.setItem("klStudent", JSON.stringify(student));
  alert("Student profile saved successfully!");
  showPage("dashboard");
});

function loadStudent() {
  if (!student) return;

  document.getElementById("studentName").value = student.name;
  document.getElementById("regNo").value = student.regNo;
  document.getElementById("course").value = student.course;
  document.getElementById("branch").value = student.branch;
  document.getElementById("specialization").value = student.specialization;
  document.getElementById("backlogs").value = student.backlogs;

  student.semesters.forEach((value, index) => {
    document.getElementById("sem" + (index + 1)).value = value;
  });

  calculateCgpa();
}

function isEligible(company) {
  return student &&
    student.cgpa >= company.minCgpa &&
    student.backlogs === 0;
}

function renderCompanies() {
  const list = document.getElementById("companyList");
  list.innerHTML = "";

  companies.forEach((company, index) => {
    const eligible = isEligible(company);
    const applied = applications.some(a =>
      a.company === company.name && student &&
      a.regNo === student.regNo
    );

    const card = document.createElement("div");
    card.className = "company";

    card.innerHTML = `
      <h3>${company.name}</h3>
      <p><b>Role:</b> ${company.role}</p>
      <p><b>Sample Package:</b> ₹${company.package} LPA</p>
      <p><b>Minimum CGPA:</b> ${company.minCgpa}</p>
      <p><b>Backlogs Allowed:</b> 0</p>
      <p class="status ${eligible ? "eligible" : "not-eligible"}">
        ${eligible ? "Eligible" : "Not Eligible"}
      </p>
      <button onclick="applyJob(${index})"
        ${!eligible || applied ? "disabled" : ""}>
        ${applied ? "Applied" : "Apply Now"}
      </button>
    `;

    list.appendChild(card);
  });
}

function applyJob(index) {
  if (!student) {
    alert("Please complete your student profile first.");
    return;
  }

  const company = companies[index];

  if (!isEligible(company)) {
    alert("You do not meet the sample eligibility criteria.");
    return;
  }

  const alreadyApplied = applications.some(a =>
    a.company === company.name && a.regNo === student.regNo
  );

  if (alreadyApplied) return;

  applications.push({
    regNo: student.regNo,
    studentName: student.name,
    company: company.name,
    role: company.role,
    status: "Applied"
  });

  localStorage.setItem("klApplications", JSON.stringify(applications));
  alert("Application submitted successfully!");
  updateDashboard();
}

function renderApplications() {
  const list = document.getElementById("applicationList");
  list.innerHTML = "";

  const mine = student ? applications.filter(a =>
    a.regNo === student.regNo
  ) : [];

  if (!mine.length) {
    list.textContent = "No applications found.";
    return;
  }

  mine.forEach(a => {
    const div = document.createElement("div");
    div.className = "application";
    div.textContent = `${a.company} | ${a.role} | Status: ${a.status}`;
    list.appendChild(div);
  });
}

function updateDashboard() {
  const mine = student ? applications.filter(a =>
    a.regNo === student.regNo
  ) : [];

  document.getElementById("dashCgpa").textContent =
    student ? student.cgpa.toFixed(2) : "0.00";

  document.getElementById("companyCount").textContent = companies.length;
  document.getElementById("eligibleCount").textContent =
    companies.filter(isEligible).length;
  document.getElementById("appCount").textContent = mine.length;

  renderCompanies();
  renderApplications();

  const admin = document.getElementById("adminDetails");
  admin.innerHTML = "";

  const details = [
    ["Registered Demo Student", student ? student.name : "None"],
    ["Registration Number", student ? student.regNo : "N/A"],
    ["Available Companies", companies.length],
    ["Total Applications", applications.length]
  ];

  details.forEach(([label, value]) => {
    const p = document.createElement("p");
    p.textContent = `${label}: ${value}`;
    admin.appendChild(p);
  });
}

loadStudent();
updateDashboard();
