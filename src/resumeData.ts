/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResumeData } from "./types";

export const resumeData: ResumeData = {
  name: "Sujitha Manivasagam",
  headline: "Technical Project Manager / Agile & Scrum / 13+ Years Web Development / AI-Aware / Delivering Scalable Solutions",
  contact: {
    email: "sujitha29@gmail.com",
    phone: "+91 9943396016",
    linkedin: "www.linkedin.com/in/sujitha-manivasagam-6baa69358",
    location: "Greater Coimbatore Area, India (Remote Ready)"
  },
  summary: "Accomplished Technical Project Manager and Senior Developer with over 13 years of expertise in software engineering and cross-functional project delivery. Specialized in building highly scalable web architectures, managing end-to-end SDLC lifecycles, and elevating delivery throughput by 20–25%. Began career as a hands-on PHP developer and evolved into strategic engineering management roles, creating a robust fusion of deep technical knowledge and agile management principles. Continuously upskilling in Generative AI workflows, prompting techniques, and AI-powered project automation.",
  topSkills: [
    "Technical Project Management",
    "Agile & Scrum Delivery",
    "Risk Mitigation",
    "Stakeholder Management",
    "Prompt Engineering",
    "Artificial Intelligence (AI)",
    "Backend Architecture",
    "Team Leadership & Mentoring"
  ],
  backendSkills: [
    "PHP",
    "Laravel (4.2 - 5.3)",
    "CodeIgniter",
    "Slim PHP",
    "MySQL",
    "Joomla Framework",
    "WordPress Plugin Development",
    "jQuery / JavaScript",
    "HTML5 & CSS3",
    "API & Web Service Integration"
  ],
  managementSkills: [
    "SDLC & Release Management",
    "Sprint Planning & Retrospectives",
    "Resource Scheduling",
    "Code Quality Auditing",
    "Requirement Decomposition",
    "Timeline Estimation & Budgeting",
    "Developer Mentorship",
    "Cross-functional Collaboration"
  ],
  experience: [
    {
      id: "exp-1",
      company: "BrainCert (BrainCert India Pvt Ltd)",
      role: "Project Manager",
      period: "Jan 2021 – Present",
      duration: "5 years 6 months",
      location: "Coimbatore, India",
      highlights: [
        "Led a cohesive cross-functional engineering and design team of 10+ members to deliver unified systems.",
        "Increased delivery performance metrics and timeline efficiency by 20–25% via targeted sprint retro adjustments.",
        "Orchestrated the complete, end-to-end project lifecycles for high-concurrency SaaS learning management features.",
        "Mitigated delivery risks and aligned expectations by spearheading proactive domestic and global stakeholder communications.",
        "Supervised system stability and assured high-quality releases through continuous code quality audits and QA gating."
      ]
    },
    {
      id: "exp-2",
      company: "BrainCert India Private Limited",
      role: "Team Lead",
      period: "Aug 2019 – Dec 2020",
      duration: "1 year 5 months",
      location: "Coimbatore, India",
      highlights: [
        "Led a dedicated team of junior and senior developers, enforcing modern coding standards and code review protocols.",
        "Contributed directly to modular system design, database planning, and high-level SaaS architecture diagrams.",
        "Nurtured technical progress of engineering personnel, resulting in shorter on-boarding times and elevated unit productivity.",
        "Spearheaded technical problem-solving on mission-critical platform anomalies, optimizing sluggish MySQL search queries."
      ]
    },
    {
      id: "exp-3",
      company: "TCP International Inc.",
      role: "Senior Programmer / Team Lead",
      period: "May 2018 – June 2019",
      duration: "1 year 2 months",
      location: "Coimbatore, India",
      highlights: [
        "Developed enterprise-grade PHP applications and refined complex business rules to amplify computation speeds.",
        "Analyzed software bottlenecks and executed performance optimizations, bolstering backend system responsiveness.",
        "Coordinated closely with server operations teams to support cloud scalability, containerized deployments, and load balancing."
      ]
    },
    {
      id: "exp-4",
      company: "Vaiha Software Solutions",
      role: "Senior Programmer",
      period: "Feb 2016 – Apr 2018",
      duration: "2 years 3 months",
      location: "Coimbatore, India",
      highlights: [
        "Crafted server-side web platforms and orchestrated third-party merchant, shipping, and notification API integrations.",
        "Deconstructed client requirements to produce detailed database entity-relational schemas and wireframe mocks.",
        "Standardized interface development patterns across the department, ensuring robust defense against SQL injection and XSS."
      ]
    },
    {
      id: "exp-5",
      company: "Bizarre Software Pvt. Ltd",
      role: "Senior Programmer",
      period: "Aug 2014 – Aug 2015",
      duration: "1 year 1 month",
      location: "Coimbatore, India",
      highlights: [
        "Authored custom e-commerce layouts, multi-tenant Content Management Systems (CMS), and inventory reporting modules.",
        "Engineered scalable database architecture and optimized complex multi-table SQL queries to reduce page load latencies."
      ]
    },
    {
      id: "exp-6",
      company: "Adorn Consultants Pvt Ltd",
      role: "PHP Developer",
      period: "Nov 2010 – Jul 2014",
      duration: "3 years 9 months",
      location: "Coimbatore, Tamil Nadu, India",
      highlights: [
        "Began professional engineering career implementing scalable backend features and modular database components.",
        "Designed and maintained core database schemas, table triggers, and standard stored procedures using MySQL.",
        "Collaborated with project managers to refine client specifications into fully functional modular subroutines."
      ]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "BrainCert Unified Training Platform (UTP)",
      url: "https://www.braincert.com/",
      techStack: ["PHP (Joomla framework)", "Wordpress Plugins", "jQuery", "Slim PHP", "HTML/CSS"],
      database: "MySQL",
      description: "One of the premier Unified Training Platforms in the United States, hosting virtual classrooms, interactive whiteboards, high-definition video chat rooms, and simultaneous screensharing. Incorporates state persistence to resume drawing states across distinct sessions.",
      relevance: [
        "Co-created and maintained multi-tenant LMS configurations supporting whiteboards, video chat, and multi-domain clients.",
        "Administered workflow systems, ticketing, release timelines, and cross-team dependencies dynamically."
      ]
    },
    {
      id: "proj-2",
      name: "JDByrider Automotive Resale Platform",
      techStack: ["AngularJS", "Slim PHP", "jQuery", "HTML5", "CSS3"],
      database: "MySQL",
      description: "Enterprise management and parts procurement portal for branch managers and field technicians to handle vehicle resales. Technicians report parts and labor specifications, while managers audit and approve orders synchronized instantly with Carquest's procurement systems.",
      relevance: [
        "Architected secure parts-routing logic on the server using Slim PHP.",
        "Created real-time labor tracking components in AngularJS to synchronize parts status updates."
      ]
    },
    {
      id: "proj-3",
      name: "Citycreek Mortgage Calculator Plugin",
      url: "https://citycreekmortgage.com/find-your-best-rate",
      techStack: ["WordPress", "jQuery", "HTML5", "CSS3"],
      database: "MySQL",
      description: "Full-scale custom mortgage calculation plugin. Evaluates geo-location details retrieved through state APIs to calculate real-time residential loan interest, home insurance, property tax rates, and monthly mortgage payments.",
      relevance: [
        "Integrated geospatial lookup APIs and verified calculations in accordance with strict state financial regulation guidelines.",
        "Developed responsive visual amortized schedulers on top of the WordPress core."
      ]
    },
    {
      id: "proj-4",
      name: "Mirabelle Cosmetics Client CMS & Gateway",
      techStack: ["CodeIgniter", "jQuery", "HTML", "CSS"],
      database: "MySQL",
      description: "Advanced product catalog, content publisher, and custom e-commerce system optimized for skin care product delivery. Interfaced securely with Axis Bank API gateways and Bluedart logistics trackers.",
      relevance: [
        "Composed secure checkout pipelines utilizing state-of-the-art merchant payload encryption techniques.",
        "Automated delivery notification updates based on Bluedart webhooks."
      ]
    },
    {
      id: "proj-5",
      name: "Animal Memorial Service Portal",
      url: "http://animalmemorialservice.com/",
      techStack: ["PHP", "jQuery", "HTML5", "CSS3"],
      database: "MySQL",
      description: "Comprehensive administration system tracking client records, cremation schedules, inventory selections, and payment integrations.",
      relevance: [
        "Implemented high-accuracy payment processing gateways.",
        "Constructed custom admin calendar planners using dynamic calendar queues."
      ]
    },
    {
      id: "proj-6",
      name: "HCM Intranet Portal",
      techStack: ["Laravel 5.3", "jQuery", "HTML", "CSS"],
      database: "MySQL",
      description: "Internal Human Capital Management system. Facilitates automated timesheet submission, goal review, leave approval workflows, and peer-to-peer performance reviews.",
      relevance: [
        "Built modular workflow pipelines mapping hierarchy approvals in Laravel.",
        "Streamlined document routing using automated state-machine policies."
      ]
    },
    {
      id: "proj-7",
      name: "Food Truck Searcher Engine",
      url: "http://www.foodtrucksearcher.com",
      techStack: ["Laravel 4.2", "jQuery", "HTML", "CSS"],
      database: "MySQL",
      description: "Active geolocation search directory registering mobile food trucks, operational hours, menus, current location coordinates, and consumer feedback.",
      relevance: [
        "Configured precise GIS boundary queries to match mobile vendors within specific mile radiuses.",
        "Developed custom dashboard layouts for food truck vendors to update menus on mobile."
      ]
    },
    {
      id: "proj-8",
      name: "Taxi Booking App",
      url: "https://bizarresoftwaresolutions.in/products/taxi-booking-app/",
      techStack: ["Mobile Web Client Bundle", "Backend API Engine"],
      database: "MySQL",
      description: "Full-featured vehicle hailing solution supporting taxi registration, active trip dispatch, driver booking, real-time fare calculation, and route plotting.",
      relevance: [
        "Maintained server sockets managing route plotting and distance multipliers.",
        "Developed APIs supporting driver registration verifications."
      ]
    },
    {
      id: "proj-9",
      name: "SpringsFab Product Management System",
      url: "http://www.springsfab.com",
      techStack: ["PHP", "jQuery", "HTML5", "CSS3"],
      database: "MySQL",
      description: "Production and warehouse tracking system monitoring raw fabrication inventory levels, labor logs, manufacturing pipelines, and bill-of-materials.",
      relevance: [
        "Formulated inventory tracking grids featuring immediate recalculation fields.",
        "Reorganized multi-step manufacturing pipelines to reduce duplicate entry processes."
      ]
    }
  ],
  education: [
    {
      degree: "Master of Computer Applications (MCA)",
      school: "Sri Ramakrishna Institute of Technology, Coimbatore",
      university: "Anna University",
      period: "2006 – 2009",
      score: "75%"
    },
    {
      degree: "Bachelor of Science, Computer Science (BSc Comp Sci)",
      school: "Vellalar College for Women, Thindal, Erode",
      university: "Bharathiyar University",
      period: "2003 – 2006",
      score: "67.53%"
    },
    {
      degree: "Higher Secondary Certificate (H.S.C)",
      school: "Ponnu Matric Hr. Sec. School, Dharapuram",
      university: "State Board",
      period: "2001 – 2003",
      score: "76.67%"
    },
    {
      degree: "Secondary School Leaving Certificate (S.S.L.C)",
      school: "Ponnu Matric Hr. Sec. School, Dharapuram",
      university: "Matriculation",
      period: "2000 – 2001",
      score: "81.73%"
    }
  ],
  certifications: [
    {
      name: "Google Project Management: Specialization",
      issuer: "Google",
      date: "Jan 2024",
      credentialId: "QHEJG8WJLSZL"
    },
    {
      name: "Generative AI: Prompt Engineering Basics",
      issuer: "IBM",
      date: "May 2026",
      credentialId: "HQ3OB1D1X4K4"
    },
    {
      name: "Generative AI: Introduction and Applications",
      issuer: "IBM",
      date: "May 2026",
      credentialId: "IXB6N2P08GHK"
    },
    {
      name: "Generative AI: Unleash Your Project Management Potential",
      issuer: "SkillUp",
      date: "May 2026",
      credentialId: "4W3IFFKH6MTJ"
    },
    {
      name: "Generative AI for Project Managers Specialization",
      issuer: "IBM / SkillUp",
      date: "May 2026",
      credentialId: "34MS238LYL55"
    },
    {
      name: "AI for App Building",
      issuer: "Google",
      date: "May 2026",
      credentialId: "BVWERQGXHTNL"
    },
    {
      name: "AI for Data Analysis",
      issuer: "Google",
      date: "May 2026",
      credentialId: "R054QFYTQYHM"
    },
    {
      name: "AI for Content Creation",
      issuer: "Google",
      date: "May 2026",
      credentialId: "06MALQK1GWT8"
    },
    {
      name: "AI for Writing and Communicating",
      issuer: "Google",
      date: "May 2026",
      credentialId: "EGMHZSZDDGB0"
    },
    {
      name: "AI for Research and Insights",
      issuer: "Google",
      date: "May 2026",
      credentialId: "D82CAI3IPOCW"
    },
    {
      name: "AI for Brainstorming and Planning",
      issuer: "Google",
      date: "May 2026",
      credentialId: "CQRL3YMON59H"
    },
    {
      name: "AI Fundamentals",
      issuer: "Google",
      date: "May 2026",
      credentialId: "P3VEZLRUU6H9"
    },
    {
      name: "Google AI",
      issuer: "Google",
      date: "May 2026",
      credentialId: "MECFD4DTPJYI"
    },
    {
      name: "Foundations of Project Management",
      issuer: "Google",
      date: "Nov 2023",
      credentialId: "XS3P66B8A5P2"
    },
    {
      name: "Project Plan: Putting It All Together",
      issuer: "Google",
      date: "Dec 2023",
      credentialId: "P8RW4PHJE7WD"
    },
    {
      name: "Project Initiation: Starting a Successful Project",
      issuer: "Google",
      date: "Dec 2023",
      credentialId: "3ASUKVQCVFR9"
    },
    {
      name: "Project Execution: Running the Project",
      issuer: "Google",
      date: "Jan 2024",
      credentialId: "9Q4YHB4GV5CN"
    },
    {
      name: "Agile Project Management",
      issuer: "Google",
      date: "Jan 2024",
      credentialId: "3F599FCHK94K"
    },
    {
      name: "Capstone: Applying Project Management in the Real world",
      issuer: "Google",
      date: "Jan 2024",
      credentialId: "K728AU46ZKX4"
    }
  ]
};
