// ═══════════════════════════════════════════════════════════════
//  PEHCHAN TOYS — Admin Auth & Shared Utilities
// ═══════════════════════════════════════════════════════════════

const ADMIN_USER  = "admin";
const ADMIN_PASS  = "qwerty098";
const SESSION_KEY = "pehchan_admin_session";
const PAGES_ROOT  = "../admin/";

// ─── Auth ─────────────────────────────────────────────────────
function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "../admin/login.html";
  }
}

function doLogin(username, password) {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

function doLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "../admin/login.html";
}

// ─── Toast ────────────────────────────────────────────────────
function adminToast(msg, type = "success") {
  let toast = document.getElementById("admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    toast.className = "admin-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `admin-toast show ${type}`;
  setTimeout(() => { toast.className = "admin-toast"; }, 3000);
}

// ─── Sidebar Toggle (mobile) ──────────────────────────────────
function initSidebar() {
  const hamburger = document.getElementById("admin-hamburger");
  const sidebar   = document.getElementById("admin-sidebar");
  const overlay   = document.getElementById("sidebar-overlay");

  if (hamburger && sidebar && overlay) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("visible");
    });
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("visible");
    });
  }

  // Logout button
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", doLogout);
  }
}

// ─── Set active sidebar link ──────────────────────────────────
function setActiveLink(pageId) {
  document.querySelectorAll(".sidebar-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === pageId);
  });
}

// ─── Shared mock data (referenced by multiple pages) ─────────
const MOCK_PRODUCTS = [
  { id:1,  name:"Speed Racer RC Car",    cat:"rc-cars",     price:24.99, stock:42, rating:4.5, status:"active",   label:"New",  emoji:"🏎",  bg:"linear-gradient(135deg,#FF6B6B,#FF8E53)" },
  { id:2,  name:"Monster Truck RC",      cat:"rc-cars",     price:34.99, stock:18, rating:4.8, status:"active",   label:"Sale", emoji:"🚙",  bg:"linear-gradient(135deg,#56AB2F,#A8E063)" },
  { id:3,  name:"Formula One RC",        cat:"rc-cars",     price:29.99, stock:27, rating:4.3, status:"active",   label:null,   emoji:"🏎",  bg:"linear-gradient(135deg,#FF416C,#FF4B2B)" },
  { id:4,  name:"Off-road RC Buggy",     cat:"rc-cars",     price:27.99, stock:35, rating:4.6, status:"active",   label:"New",  emoji:"🚐",  bg:"linear-gradient(135deg,#F7971E,#FFD200)" },
  { id:5,  name:"Sky Hawk Helicopter",   cat:"helicopters", price:39.99, stock:22, rating:4.7, status:"active",   label:"New",  emoji:"🚁",  bg:"linear-gradient(135deg,#4776E6,#8E54E9)" },
  { id:6,  name:"Mini Drone Copter",     cat:"helicopters", price:29.99, stock:14, rating:4.4, status:"active",   label:null,   emoji:"🛸",  bg:"linear-gradient(135deg,#485563,#29323C)" },
  { id:7,  name:"Military Helicopter",   cat:"helicopters", price:44.99, stock:9,  rating:4.9, status:"active",   label:"Sale", emoji:"🚁",  bg:"linear-gradient(135deg,#134E5E,#71B280)" },
  { id:8,  name:"Rescue Helicopter",     cat:"helicopters", price:34.99, stock:31, rating:4.5, status:"active",   label:null,   emoji:"🚁",  bg:"linear-gradient(135deg,#F09819,#EDDE5D)" },
  { id:9,  name:"Big Rig Truck",         cat:"trucks",      price:19.99, stock:55, rating:4.2, status:"active",   label:null,   emoji:"🚛",  bg:"linear-gradient(135deg,#C94B4B,#4B134F)" },
  { id:10, name:"Fire Truck",            cat:"trucks",      price:22.99, stock:44, rating:4.6, status:"active",   label:"New",  emoji:"🚒",  bg:"linear-gradient(135deg,#FF512F,#F09819)" },
  { id:11, name:"Dump Truck",            cat:"trucks",      price:17.99, stock:60, rating:4.1, status:"active",   label:null,   emoji:"🚜",  bg:"linear-gradient(135deg,#F7971E,#FFD200)" },
  { id:12, name:"Construction Truck",    cat:"trucks",      price:21.99, stock:38, rating:4.4, status:"low-stock",label:"Sale", emoji:"🏗",  bg:"linear-gradient(135deg,#F09819,#EDDE5D)" },
  { id:13, name:"Building Blocks Set",   cat:"educational", price:24.99, stock:73, rating:4.8, status:"active",   label:"New",  emoji:"🧱",  bg:"linear-gradient(135deg,#11998E,#38EF7D)" },
  { id:14, name:"Science Kit",           cat:"educational", price:34.99, stock:19, rating:4.7, status:"active",   label:null,   emoji:"🔬",  bg:"linear-gradient(135deg,#1CB5E0,#000851)" },
  { id:15, name:"Math Puzzle Board",     cat:"educational", price:19.99, stock:47, rating:4.5, status:"active",   label:null,   emoji:"🧩",  bg:"linear-gradient(135deg,#F7971E,#FFD200)" },
  { id:16, name:"Art & Craft Kit",       cat:"educational", price:27.99, stock:33, rating:4.6, status:"active",   label:"Sale", emoji:"🎨",  bg:"linear-gradient(135deg,#DA4453,#89216B)" },
  { id:17, name:"Princess Doll",         cat:"dolls",       price:24.99, stock:52, rating:4.7, status:"active",   label:"New",  emoji:"👸",  bg:"linear-gradient(135deg,#F953C6,#B91D73)" },
  { id:18, name:"Fashion Doll Set",      cat:"dolls",       price:29.99, stock:28, rating:4.5, status:"active",   label:null,   emoji:"🪆",  bg:"linear-gradient(135deg,#FF758C,#FF7EB3)" },
  { id:19, name:"Baby Doll",             cat:"dolls",       price:19.99, stock:6,  rating:4.3, status:"low-stock",label:null,   emoji:"👶",  bg:"linear-gradient(135deg,#FCCB90,#D57EEB)" },
  { id:20, name:"Superhero Doll",        cat:"dolls",       price:22.99, stock:41, rating:4.8, status:"active",   label:"Sale", emoji:"🦸",  bg:"linear-gradient(135deg,#4776E6,#8E54E9)" },
];

const MOCK_ORDERS = [
  { id:"ORD-001", customer:"Sarah Ahmed",   phone:"+92-300-1111111", items:2, total:49.98,  status:"delivered", date:"2024-04-20", city:"Karachi"   },
  { id:"ORD-002", customer:"Usman Malik",   phone:"+92-321-2222222", items:1, total:24.99,  status:"shipped",   date:"2024-04-22", city:"Lahore"    },
  { id:"ORD-003", customer:"Fatima Raza",   phone:"+92-333-3333333", items:3, total:87.97,  status:"pending",   date:"2024-04-24", city:"Islamabad" },
  { id:"ORD-004", customer:"Ali Hassan",    phone:"+92-312-4444444", items:2, total:64.98,  status:"processing",date:"2024-04-24", city:"Faisalabad"},
  { id:"ORD-005", customer:"Ayesha Khan",   phone:"+92-301-5555555", items:1, total:39.99,  status:"delivered", date:"2024-04-19", city:"Karachi"   },
  { id:"ORD-006", customer:"Hamza Ahmed",   phone:"+92-346-6666666", items:4, total:112.96, status:"shipped",   date:"2024-04-23", city:"Multan"    },
  { id:"ORD-007", customer:"Zainab Ali",    phone:"+92-315-7777777", items:1, total:22.99,  status:"cancelled", date:"2024-04-21", city:"Peshawar"  },
  { id:"ORD-008", customer:"Omar Sheikh",   phone:"+92-302-8888888", items:2, total:54.98,  status:"pending",   date:"2024-04-25", city:"Lahore"    },
  { id:"ORD-009", customer:"Mariam Iqbal",  phone:"+92-311-9999999", items:3, total:79.97,  status:"delivered", date:"2024-04-18", city:"Rawalpindi"},
  { id:"ORD-010", customer:"Bilal Chaudhry",phone:"+92-320-0000000", items:2, total:44.98,  status:"processing",date:"2024-04-25", city:"Sialkot"   },
];

const ORDER_STATUS_CLASS = {
  delivered:  "badge-success",
  shipped:    "badge-info",
  processing: "badge-warning",
  pending:    "badge-purple",
  cancelled:  "badge-danger",
};

const CAT_LABELS = {
  "rc-cars": "RC Cars", "helicopters": "Helicopters",
  "trucks": "Trucks", "educational": "Educational", "dolls": "Dolls"
};
