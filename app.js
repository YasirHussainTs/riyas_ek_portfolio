(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var EMAIL = "edakkandiriyas@gmail.com";
  var PHONE_RAW = "971582058993";

  /* ───────── Toast + copy ───────── */
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 1900);
  }
  function copyText(text, msg) {
    function done() { toast(msg || "Copied"); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Copy not available"); }
      document.body.removeChild(ta);
    }
  }
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () { copyText(b.getAttribute("data-copy"), "Copied to clipboard"); });
  });

  /* ───────── Theme ───────── */
  var root = document.documentElement;
  $("#themeBtn").addEventListener("click", function () {
    var isDark = root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var next = isDark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ───────── Nav ───────── */
  var nav = $("#nav"), links = $("#navLinks"), menuBtn = $("#menuBtn");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  menuBtn.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
  });
  $$("a", links).forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.querySelector("use").setAttribute("href", "#i-menu");
    });
  });
  // active link highlight
  var sections = $$("main section[id]");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          $$("a", links).forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ───────── Reveal + counters ───────── */
  var revealEls = $$(".reveal");
  revealEls.forEach(function (el, i) {
    // light stagger for siblings inside grids
    var sib = el.parentElement ? $$(":scope > .reveal", el.parentElement) : [];
    var idx = sib.indexOf(el);
    if (idx > 0) el.style.setProperty("--d", Math.min(idx * 0.07, 0.35) + "s");
  });
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce || isNaN(target)) { el.textContent = target + suffix; return; }
    var start = null, dur = 1200;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          $$("[data-count]", e.target).forEach(countUp);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ───────── Topology captions ───────── */
  var cap = $("#topoCap");
  var defaultCap = cap.textContent;
  var nodes = $$("#topo .tnode");
  function setNode(n) {
    nodes.forEach(function (x) { x.classList.toggle("on", x === n); });
    cap.textContent = n ? n.getAttribute("data-tip") : defaultCap;
  }
  nodes.forEach(function (n) {
    n.addEventListener("mouseenter", function () { setNode(n); });
    n.addEventListener("focus", function () { setNode(n); });
    n.addEventListener("click", function () { setNode(n); });
    n.addEventListener("mouseleave", function () { setNode(null); });
    n.addEventListener("blur", function () { setNode(null); });
  });

  /* ───────── Incident flow ───────── */
  var FLOW = [
    { t: "Detect", d: "Alerts from SolarWinds monitoring or a user ticket start the clock. I confirm what is affected, who is affected and the business impact before touching anything.", c: ["SolarWinds", "Ticket queue", "SLA clock"] },
    { t: "Triage (L1)", d: "Reproduce the problem, check the basics and apply the fast fix — reset, reconnect, re-image or remote in. Most issues end here, with the user kept informed.", c: ["Remote Desktop", "Windows 10/11", "Printers · IP phones", "Outlook · Teams"] },
    { t: "Diagnose (L2)", d: "Go deeper into the layer that is actually failing: links, VLANs and routing, firewall policy, DHCP/DNS, Active Directory and Group Policy, or the M365 tenant.", c: ["Ping · Traceroute", "Wireshark", "Cisco CLI", "FortiGate", "Active Directory"] },
    { t: "Resolve & verify", d: "Apply the fix, test from the user's side and confirm service is restored. Vendors are coordinated where needed, and the ticket is closed inside SLA.", c: ["Change & test", "Vendor coordination", "User confirmation"] },
    { t: "Prevent", d: "Document the root cause and the fix, then add monitoring, patching or a policy change so the same incident does not come back.", c: ["Documentation", "Patch management", "Preventive maintenance", "Asset management"] }
  ];
  var flowIdx = 0, flowTimer = null, flowStart = 0, FLOW_MS = 5200, flowPaused = false, flowTouched = false;
  var stepBtns = $$(".flow-step"), bar = $("#flowBar");
  var fTitle = $("#flowTitle"), fText = $("#flowText"), fTools = $("#flowTools");
  function showFlow(i) {
    flowIdx = i;
    stepBtns.forEach(function (b, k) {
      b.classList.toggle("is-active", k === i);
      b.setAttribute("aria-selected", k === i ? "true" : "false");
    });
    fTitle.textContent = FLOW[i].t;
    fText.textContent = FLOW[i].d;
    fTools.innerHTML = FLOW[i].c.map(function (x) { return "<li>" + x + "</li>"; }).join("");
    flowStart = performance.now();
    bar.style.width = "0%";
  }
  function flowTick(now) {
    if (!flowTouched && !flowPaused && !reduce) {
      var p = Math.min((now - flowStart) / FLOW_MS, 1);
      bar.style.width = (p * 100) + "%";
      if (p >= 1) showFlow((flowIdx + 1) % FLOW.length);
    } else if (flowTouched || reduce) {
      bar.style.width = ((flowIdx + 1) / FLOW.length * 100) + "%";
    } else {
      flowStart += 16; // hold progress while paused
    }
    flowTimer = requestAnimationFrame(flowTick);
  }
  stepBtns.forEach(function (b) {
    b.addEventListener("click", function () { flowTouched = true; showFlow(parseInt(b.getAttribute("data-i"), 10)); });
  });
  var flowEl = $("#flow");
  flowEl.addEventListener("mouseenter", function () { flowPaused = true; });
  flowEl.addEventListener("mouseleave", function () { flowPaused = false; });
  showFlow(0);
  flowTimer = requestAnimationFrame(flowTick);

  /* ───────── Console ───────── */
  var out = $("#termOut"), form = $("#termForm"), input = $("#termInput"), chipsBox = $("#termChips");
  var busy = false, history = [], hIdx = 0, timers = [];

  var CMDS = {
    "help": function () {
      return [
        "Available commands:",
        "  show ip interface brief     interface status and addressing",
        "  show vlan brief             VLANs and port assignments",
        "  show ip ospf neighbor       routing adjacencies",
        "  ping <host>                 reachability test",
        "  traceroute <host>           path to a destination",
        "  get system status           firewall health (FortiGate style)",
        "  whoami                      who is behind this portfolio",
        "  skills                      what I work with",
        "  contact                     how to reach me",
        "  clear                       clear the screen",
        "",
        "Tip: Cisco shortcuts work — try  sh ip int br"
      ];
    },
    "show ip interface brief": function () {
      return [
        "Interface              IP-Address      OK? Method Status                Protocol",
        "GigabitEthernet0/0     10.10.0.1       YES manual up                    up",
        "GigabitEthernet0/1     10.10.10.1      YES manual up                    up",
        "GigabitEthernet0/2     10.10.20.1      YES manual up                    up",
        "Vlan30                 10.10.30.1      YES manual up                    up",
        "Vlan40                 10.10.40.1      YES manual up                    up",
        "Loopback0              10.255.255.1    YES manual up                    up"
      ];
    },
    "show vlan brief": function () {
      return [
        "VLAN Name                             Status    Ports",
        "---- -------------------------------- --------- -------------------------------",
        "1    default                          active    Gi1/0/47, Gi1/0/48",
        "10   STAFF-ENDPOINTS                  active    Gi1/0/1-Gi1/0/24",
        "20   SERVERS-AD                       active    Gi1/0/25-Gi1/0/28",
        "30   NAS-STORAGE                      active    Gi1/0/29-Gi1/0/32",
        "40   WIFI-AP                          active    Gi1/0/33-Gi1/0/38",
        "50   CCTV-NVR                         active    Gi1/0/39-Gi1/0/44"
      ];
    },
    "show ip ospf neighbor": function () {
      return [
        "Neighbor ID     Pri   State           Dead Time   Address         Interface",
        "10.255.255.2      1   FULL/DR         00:00:33    10.10.0.2       GigabitEthernet0/0",
        "10.255.255.3      1   FULL/BDR        00:00:38    10.10.0.3       GigabitEthernet0/0"
      ];
    },
    "get system status": function () {
      return [
        "Version: FortiGate (demo output)",
        "Operation Mode: NAT",
        "Hostname: FG-EDGE-01",
        "Security policies: enforcing",
        "VPN: IPsec site-to-site tunnel ......... up",
        "Interfaces: wan1 up | lan up | dmz up",
        "Log disk: ok   |   Config backup: scheduled"
      ];
    },
    "whoami": function () {
      return [
        "Riyas E K — IT System & Network Engineer",
        "Dubai, UAE · CCNA (2024) · Fortinet NSE 1 (2023)",
        "Cisco · FortiGate · Microsoft 365 · Windows Server · L1/L2 support"
      ];
    },
    "skills": function () {
      return [
        "network   : Cisco, VLAN, inter-VLAN, STP, EtherChannel, OSPF, EIGRP",
        "security  : FortiGate, pfSense, VPN, NAT, ACL, port security",
        "systems   : Windows Server, Active Directory, Group Policy, M365, Entra ID",
        "storage   : QNAP, Synology, permissions, backup & restore",
        "monitor   : SolarWinds, Wireshark, ping, traceroute"
      ];
    },
    "contact": function () {
      return [
        "email    : " + EMAIL,
        "phone    : +971 58 205 8993 (WhatsApp)",
        "linkedin : linkedin.com/in/riyasek",
        "location : Dubai, United Arab Emirates"
      ];
    }
  };
  var KEYS = Object.keys(CMDS);

  function resolve(raw) {
    var cmd = raw.trim().toLowerCase().replace(/\s+/g, " ");
    if (!cmd) return null;
    var toks = cmd.split(" ");
    if (toks[0] === "clear" || toks[0] === "cls") return { type: "clear" };
    if (toks[0] === "ping" || toks[0] === "traceroute" || toks[0] === "tracert") {
      if (!toks[1]) return { type: "out", lines: ["% Incomplete command. Usage: " + toks[0] + " <host>"], err: true };
      var host = toks[1].replace(/[^a-z0-9.\-:]/gi, "").slice(0, 40) || "10.10.1.1";
      if (toks[0] === "ping") {
        return { type: "out", lines: [
          "Type escape sequence to abort.",
          "Sending 5, 100-byte ICMP Echos to " + host + ", timeout is 2 seconds:",
          "!!!!!",
          "Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms"
        ] };
      }
      return { type: "out", lines: [
        "Tracing the route to " + host,
        "  1 10.10.10.1 1 msec 1 msec 1 msec",
        "  2 10.10.0.2 2 msec 1 msec 2 msec",
        "  3 " + host + " 4 msec 3 msec 4 msec"
      ] };
    }
    // Cisco-style prefix matching: every token must be a prefix of the canonical token
    for (var k = 0; k < KEYS.length; k++) {
      var ct = KEYS[k].split(" ");
      if (ct.length !== toks.length) continue;
      var ok = true;
      for (var j = 0; j < ct.length; j++) { if (ct[j].indexOf(toks[j]) !== 0) { ok = false; break; } }
      if (ok) return { type: "out", lines: CMDS[KEYS[k]]() };
    }
    return { type: "out", lines: ["% Invalid input detected. Type  help  for available commands."], err: true };
  }

  function addLine(text, cls) {
    var d = document.createElement("div");
    d.className = "ln" + (cls ? " " + cls : "");
    if (cls === "cmd") { d.innerHTML = "<b>lab#</b> "; d.appendChild(document.createTextNode(text)); }
    else d.textContent = text;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function run(raw) {
    var r = resolve(raw);
    if (!r) return;
    addLine(raw.trim(), "cmd");
    history.push(raw.trim()); hIdx = history.length;
    if (r.type === "clear") { out.innerHTML = ""; return; }
    busy = true;
    var delay = reduce ? 0 : 38;
    r.lines.forEach(function (l, i) {
      timers.push(setTimeout(function () {
        addLine(l || " ", r.err ? "err" : "");
        if (i === r.lines.length - 1) busy = false;
      }, 90 + i * delay));
    });
  }
  function typeThenRun(cmd) {
    if (busy) return;
    busy = true; clearTimers();
    input.value = "";
    var i = 0;
    function tick() {
      if (i < cmd.length) {
        input.value += cmd.charAt(i++);
        timers.push(setTimeout(tick, reduce ? 0 : 24));
      } else {
        timers.push(setTimeout(function () { input.value = ""; busy = false; run(cmd); }, reduce ? 0 : 160));
      }
    }
    tick();
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    var v = input.value; input.value = "";
    run(v);
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp" && history.length) { e.preventDefault(); hIdx = Math.max(0, hIdx - 1); input.value = history[hIdx] || ""; }
    if (e.key === "ArrowDown" && history.length) { e.preventDefault(); hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ""; }
  });
  ["show ip interface brief", "show vlan brief", "show ip ospf neighbor", "ping 10.10.1.1", "traceroute 10.20.1.10", "get system status", "whoami", "help"].forEach(function (c) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = c;
    b.addEventListener("click", function () { typeThenRun(c); });
    chipsBox.appendChild(b);
  });
  addLine("Welcome. This is a sample lab session — type  help  to see what it can do.", "dim");
  var demoRan = false;
  if ("IntersectionObserver" in window) {
    var termIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !demoRan) { demoRan = true; setTimeout(function () { typeThenRun("show ip interface brief"); }, 500); termIO.disconnect(); }
      });
    }, { threshold: 0.45 });
    termIO.observe($("#term"));
  }

  /* ───────── UAE sectors ───────── */
  var SECTORS = [
    { n: "Government & smart city", need: "High-availability networks across many sites, strict access control, and auditable, well-documented change management.", fit: "I supported Greater Chennai Corporation's infrastructure under SLA — Cisco, FortiGate, Active Directory, NAS and CCTV — the discipline public-sector environments expect." },
    { n: "Hotels & hospitality", need: "Guest Wi-Fi that always works, separated from back-office systems, plus reliable CCTV and IP telephony.", fit: "VLAN segmentation, Wi-Fi access points, IP phones and IP/analog CCTV with NVR — configured, monitored and supported." },
    { n: "Healthcare & clinics", need: "Protected records, dependable endpoints, tested backups and tightly controlled access to systems.", fit: "Group Policy and permissions, NAS backup and restore, VPN access and endpoint security administration." },
    { n: "Real estate & construction", need: "Head office plus project sites online, secure remote access and site CCTV that can be viewed remotely.", fit: "Site-to-site and remote-access VPN, FortiGate policy, and remote CCTV access with footage backup." },
    { n: "Logistics & free zones", need: "24/7 operations across warehouses and offices, stable WAN links and proactive monitoring to avoid downtime.", fit: "OSPF/EIGRP routing, SolarWinds monitoring, preventive maintenance and rapid L1/L2 incident response." },
    { n: "Retail & malls", need: "Many endpoints, printers and Wi-Fi, with fast on-the-spot support to keep the shop floor running.", fit: "Endpoint imaging and deployment, printer and peripheral support, Microsoft 365 administration and remote support." },
    { n: "Finance & professional services", need: "Strong identity and access control, secure email and collaboration, and clear documentation for audits.", fit: "Microsoft 365, Entra ID, Active Directory, least-privilege access and thorough technical documentation." }
  ];
  var tabs = $("#secTabs"), needEl = $("#secNeeds"), fitEl = $("#secFit");
  function showSector(i) {
    $$("button", tabs).forEach(function (b, k) {
      b.classList.toggle("is-active", k === i);
      b.setAttribute("aria-selected", k === i ? "true" : "false");
    });
    needEl.textContent = SECTORS[i].need;
    fitEl.textContent = SECTORS[i].fit;
  }
  SECTORS.forEach(function (s, i) {
    var b = document.createElement("button");
    b.type = "button"; b.setAttribute("role", "tab"); b.textContent = s.n;
    b.addEventListener("click", function () { showSector(i); });
    tabs.appendChild(b);
  });
  showSector(0);

  /* ───────── Dubai clock ───────── */
  var tEl = $("#dxbTime"), dEl = $("#dxbDate");
  try {
    var tf = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit", hour12: false });
    var df = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", weekday: "long", day: "numeric", month: "long" });
    var tickClock = function () {
      var now = new Date();
      tEl.textContent = tf.format(now);
      dEl.textContent = df.format(now) + " · UTC+4";
    };
    tickClock(); setInterval(tickClock, 15000);
  } catch (e) { tEl.textContent = "UTC+4"; }

  /* ───────── CV copy ───────── */
  var CV_TEXT = [
    "RIYAS E K",
    "IT System & Network Engineer | End-User Computing | L1/L2 Infrastructure Support",
    "Dubai, UAE | +971 58 205 8993 | " + EMAIL + " | linkedin.com/in/riyasek",
    "",
    "PROFESSIONAL SUMMARY",
    "Dedicated IT System & Network Engineer with 3+ years of experience in IT infrastructure, network administration, end-user computing and system administration. Skilled in Cisco networking, FortiGate firewalls, Microsoft 365, Windows Server, Active Directory, NAS storage, DHCP, DNS, VLANs, VPNs and virtualization. Experienced in troubleshooting network and system issues, managing enterprise IT infrastructure, implementing security best practices and delivering efficient L1/L2 technical support.",
    "",
    "EXPERIENCE",
    "Network Engineer — Felix Infotech Pvt. Ltd. (Client: Greater Chennai Corporation), India | Oct 2024 – May 2026",
    "- Managed enterprise network infrastructure: Cisco routers and switches, FortiGate firewalls, VLANs",
    "- Administered Windows Server, Active Directory, DHCP, DNS, Group Policy and Microsoft 365",
    "- Configured and managed QNAP and Synology NAS: shared folders, permissions, backup and storage",
    "- Provided L1/L2 support for hardware, software, OS, network and user issues",
    "- Supported desktops, laptops, printers, IP phones and endpoints; maintained IP/analog CCTV with NVR/DVR",
    "- Monitored performance with SolarWinds; configured VPN and network security policies; met SLA",
    "",
    "Network Support Engineer — Ingle Corp, Kerala, India | Aug 2022 – Sep 2024",
    "- Delivered L1/L2 support (remote, onsite, phone) with SLA compliance",
    "- Administered Microsoft 365, Active Directory, Group Policy, Exchange Online, Outlook, Teams, OneDrive",
    "- Configured and troubleshot TCP/IP, DNS, DHCP, VPN, LAN/WAN, Wi-Fi, routers, switches, firewalls and access points",
    "- Handled OS installation, software deployment, patch management, antivirus and endpoint security",
    "- Assisted with deployments, office relocations, asset management, documentation and vendor coordination",
    "",
    "KEY ACHIEVEMENTS",
    "- Managed enterprise IT infrastructure across systems, networks and end-user computing",
    "- Implemented and maintained secure Cisco and FortiGate network infrastructure",
    "- Delivered L1/L2 support while consistently meeting SLA targets",
    "- Improved stability through proactive monitoring, preventive maintenance and effective incident resolution",
    "",
    "TECHNICAL SKILLS",
    "Network: Cisco Routers & Switches, TCP/IP, IPv4/IPv6, VLAN, Inter-VLAN Routing, STP, EtherChannel, OSPF, EIGRP, Static Routing",
    "Systems: Windows Server, Active Directory, Group Policy, Microsoft 365, Entra ID, Windows 10/11",
    "EUC: Desktop & Laptop Support, OS Installation, Software Deployment, Printer Support, Remote Support, Endpoint Troubleshooting",
    "Security: FortiGate Firewall, pfSense Firewall, VPN, NAT, ACL, Port Security",
    "Storage & Backup: QNAP NAS, Synology NAS, Shared Storage, User Permissions, Backup & Restore",
    "Network Services: DHCP, DNS, VPN, Microsoft 365, Outlook, Exchange Online, Teams, OneDrive",
    "Monitoring: SolarWinds, Wireshark, Ping, Traceroute, Remote Desktop",
    "",
    "CERTIFICATIONS",
    "Cisco Certified Network Associate (CCNA) – 2024 | Fortinet NSE 1 – 2023 | Network Administrator Training – IW Campus",
    "",
    "EDUCATION",
    "Bachelor's Degree, Rabindranath Tagore University – 2021",
    "Higher Secondary Education (Class XII), State Board, Kerala – 2016",
    "",
    "LANGUAGES",
    "English, Malayalam, Hindi, Tamil"
  ].join("\n");
  $("#copyCv").addEventListener("click", function () { copyText(CV_TEXT, "CV copied as text"); });

  /* ───────── Contact composer ───────── */
  var REASONS = {
    hire: {
      subj: "Opportunity: IT / Network Engineer role",
      body: function (n, c) {
        return "Hello Riyas,\n\nI'm " + n + (c ? " from " + c : "") + ". We are hiring for an IT System / Network Engineer and your profile — Cisco, FortiGate, Microsoft 365 and L1/L2 support — looks like a strong fit.\n\nCould we arrange a short call this week to discuss the role?\n\nBest regards,\n" + n;
      }
    },
    support: {
      subj: "IT support / infrastructure project enquiry",
      body: function (n, c) {
        return "Hello Riyas,\n\nI'm " + n + (c ? " from " + c : "") + ". We need help with our IT infrastructure (network, firewall, Microsoft 365 or end-user support) and would like to discuss scope and timelines.\n\nWhen are you available for a quick call?\n\nBest regards,\n" + n;
      }
    },
    intro: {
      subj: "Quick intro call",
      body: function (n, c) {
        return "Hello Riyas,\n\nI'm " + n + (c ? " from " + c : "") + ". I came across your portfolio and would like to have a short introductory call.\n\nPlease let me know a time that works for you.\n\nBest regards,\n" + n;
      }
    }
  };
  var reason = "hire", subjTouched = false, bodyTouched = false;
  var fName = $("#fName"), fCompany = $("#fCompany"), fSubject = $("#fSubject"), fBody = $("#fBody");
  function compose() {
    var n = fName.value.trim() || "[Your name]", c = fCompany.value.trim();
    if (!subjTouched) fSubject.value = REASONS[reason].subj;
    if (!bodyTouched) fBody.value = REASONS[reason].body(n, c);
    var s = encodeURIComponent(fSubject.value), b = encodeURIComponent(fBody.value);
    $("#sGmail").href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + EMAIL + "&su=" + s + "&body=" + b;
    $("#sOutlook").href = "https://outlook.office.com/mail/deeplink/compose?to=" + EMAIL + "&subject=" + s + "&body=" + b;
    $("#sWa").href = "https://wa.me/" + PHONE_RAW + "?text=" + encodeURIComponent(fBody.value);
    $("#sMail").href = "mailto:" + EMAIL + "?subject=" + s + "&body=" + b;
  }
  $$("#reason button").forEach(function (b) {
    b.addEventListener("click", function () {
      reason = b.getAttribute("data-r"); subjTouched = false; bodyTouched = false;
      $$("#reason button").forEach(function (x) {
        var on = x === b; x.classList.toggle("is-active", on); x.setAttribute("aria-checked", on ? "true" : "false");
      });
      compose();
    });
  });
  [fName, fCompany].forEach(function (el) { el.addEventListener("input", compose); });
  fSubject.addEventListener("input", function () { subjTouched = true; compose(); });
  fBody.addEventListener("input", function () { bodyTouched = true; compose(); });
  $("#copyMsg").addEventListener("click", function () {
    copyText("Subject: " + fSubject.value + "\n\n" + fBody.value, "Message copied");
  });
  compose();
})();
