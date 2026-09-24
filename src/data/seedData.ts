import { JobListing, CompanyProfile, Application, InterviewSchedule } from '../types';

export const INITIAL_COMPANIES: CompanyProfile[] = [
  {
    id: 'comp_bkash',
    recruiterId: 'recruiter_bkash',
    name: 'bKash Limited',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    industry: 'FinTech',
    companySize: '1,000+ employees',
    foundedYear: 2011,
    website: 'https://www.bkash.com',
    email: 'careers@bkash.com',
    phone: '+880 2-55663001',
    location: 'Dhaka, Bangladesh',
    description: 'bKash is Bangladesh\'s leading Mobile Financial Service provider, dedicated to driving financial inclusion across 70M+ active users.',
    verified: true,
    socialLinks: {
      linkedin: 'https://linkedin.com/company/bkash-limited',
      facebook: 'https://facebook.com/bkashlimited'
    }
  },
  {
    id: 'comp_pathao',
    recruiterId: 'recruiter_pathao',
    name: 'Pathao',
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    industry: 'Logistics & Tech',
    companySize: '500-1,000 employees',
    foundedYear: 2015,
    website: 'https://pathao.com',
    email: 'talent@pathao.com',
    phone: '+880 9678-100800',
    location: 'Gulshan-1, Dhaka, Bangladesh',
    description: 'Pathao is the digital everyday super app of Bangladesh, moving millions of people and goods across ride-sharing, food delivery, and courier logistics.',
    verified: true,
    socialLinks: {
      linkedin: 'https://linkedin.com/company/pathao'
    }
  },
  {
    id: 'comp_walton',
    recruiterId: 'recruiter_walton',
    name: 'Walton Hi-Tech Industries',
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80',
    industry: 'Electronics & Hardware',
    companySize: '10,000+ employees',
    foundedYear: 1977,
    website: 'https://waltonbd.com',
    email: 'hr@waltonbd.com',
    phone: '+880 9606-555555',
    location: 'Gazipur / Dhaka, Bangladesh',
    description: 'The giant conglomerate pioneering electronics, consumer appliances, IoT, and high-tech manufacturing in South Asia.',
    verified: true
  },
  {
    id: 'comp_chaldal',
    recruiterId: 'recruiter_chaldal',
    name: 'Chaldal',
    logo: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=150&auto=format&fit=crop&q=80',
    industry: 'E-commerce & Quick Commerce',
    companySize: '1,000-5,000 employees',
    foundedYear: 2013,
    website: 'https://chaldal.com',
    email: 'join@chaldal.com',
    phone: '+880 188-1234567',
    location: 'Mirpur, Dhaka, Bangladesh',
    description: 'Chaldal powers the grocery and essential logistics infrastructure for millions of households across Bangladesh using proprietary warehouse automation.',
    verified: true
  },
  {
    id: 'comp_brainstation',
    recruiterId: 'recruiter_brainstation',
    name: 'Brain Station 23',
    logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    industry: 'Software & Cloud Services',
    companySize: '500-1,000 employees',
    foundedYear: 2006,
    website: 'https://brainstation-23.com',
    email: 'careers@brainstation-23.com',
    phone: '+880 140-4055220',
    location: 'Mohakhali DOHS, Dhaka, Bangladesh',
    description: 'Premier enterprise software, AI, FinTech, and cloud solution provider delivering global products to enterprises in Europe, US, and APAC.',
    verified: true
  },
  {
    id: 'comp_brac',
    recruiterId: 'recruiter_brac',
    name: 'BRAC IT Services',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
    industry: 'Enterprise Software & NGO',
    companySize: '500-1,000 employees',
    foundedYear: 2013,
    website: 'https://bracits.com',
    email: 'talent@bracits.com',
    phone: '+880 2-9881265',
    location: 'Dhaka, Bangladesh',
    description: 'Providing mission-critical technology platforms and digital services for the world\'s largest development organization.',
    verified: true
  },
  {
    id: 'comp_shopup',
    recruiterId: 'recruiter_shopup',
    name: 'ShopUp',
    logo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=150&auto=format&fit=crop&q=80',
    industry: 'FinTech & B2B Supply Chain',
    companySize: '1,000+ employees',
    foundedYear: 2016,
    website: 'https://shopup.com.bd',
    email: 'careers@shopup.com.bd',
    phone: '+880 9678-888999',
    location: 'Tejgaon / Mohakhali, Dhaka, Bangladesh',
    description: 'Bangladesh\'s premier full-stack B2B commerce platform providing embedded micro-credit financing and logistics to 500,000+ neighborhood retail shops.',
    verified: true,
    socialLinks: {
      linkedin: 'https://linkedin.com/company/shopup'
    }
  },
  {
    id: 'comp_sheba',
    recruiterId: 'recruiter_sheba',
    name: 'Sheba Platform Limited',
    logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=150&auto=format&fit=crop&q=80',
    industry: 'Hyperlocal Services & SME Tech',
    companySize: '200-500 employees',
    foundedYear: 2015,
    website: 'https://sheba.xyz',
    email: 'talent@sheba.xyz',
    phone: '+880 1678-000000',
    location: 'Banani, Dhaka, Bangladesh',
    description: 'Empowering service professionals, electricians, HVAC mechanics, and SMEs across Bangladesh through digital storefronts and dispatch platforms.',
    verified: true
  },
  {
    id: 'comp_grameenphone',
    recruiterId: 'recruiter_gp',
    name: 'Grameenphone Ltd.',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
    industry: 'Telecommunications & Cloud Services',
    companySize: '5,000+ employees',
    foundedYear: 1997,
    website: 'https://www.grameenphone.com',
    email: 'jobs@grameenphone.com',
    phone: '+880 2-9882990',
    location: 'GPHouse, Bashundhara R/A, Dhaka, Bangladesh',
    description: 'The largest telecommunications and digital connectivity powerhouse in Bangladesh serving over 80 million subscribers with 4G/5G and enterprise IoT.',
    verified: true,
    socialLinks: {
      linkedin: 'https://linkedin.com/company/grameenphone'
    }
  },
  {
    id: 'comp_tigerit',
    recruiterId: 'recruiter_tigerit',
    name: 'TigerIT Bangladesh',
    logo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&auto=format&fit=crop&q=80',
    industry: 'Biometrics, National ID & High-Scale Systems',
    companySize: '500-1,000 employees',
    foundedYear: 2000,
    website: 'https://tigerit.com',
    email: 'careers@tigerit.com',
    phone: '+880 2-8958181',
    location: 'Uttara, Dhaka, Bangladesh',
    description: 'Architecting biometric identification, automated fingerprint recognition (AFIS), and national voter registry systems deployed across Asia and Africa.',
    verified: true
  },
  {
    id: 'comp_optimizely',
    recruiterId: 'recruiter_optimizely',
    name: 'Optimizely Bangladesh',
    logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=80',
    industry: 'Digital Experience Platform & SaaS',
    companySize: '200-500 employees',
    foundedYear: 2010,
    website: 'https://www.optimizely.com',
    email: 'dhaka-hiring@optimizely.com',
    phone: '+880 2-9844001',
    location: 'Gulshan-2, Dhaka, Bangladesh',
    description: 'Global leader in digital experience experimentation, A/B testing, CMS, and enterprise marketing automation platforms.',
    verified: true
  },
  {
    id: 'comp_brotecs',
    recruiterId: 'recruiter_brotecs',
    name: 'Brotecs Technologies',
    logo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=150&auto=format&fit=crop&q=80',
    industry: 'Telecom Software & Embedded Engineering',
    companySize: '200-500 employees',
    foundedYear: 2005,
    website: 'https://brotecs.com',
    email: 'hr@brotecs.com',
    phone: '+880 2-9856712',
    location: 'Niketan, Gulshan, Dhaka, Bangladesh',
    description: 'Pioneers in carrier-grade VoIP engines, unified communication SDKs, and low-latency embedded telecommunication systems.',
    verified: true
  }
];

export const INITIAL_JOBS: JobListing[] = [
  {
    id: 'job_senior_react',
    recruiterId: 'recruiter_bkash',
    companyId: 'comp_bkash',
    companyName: 'bKash Limited',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Frontend Engineer (React / TypeScript)',
    department: 'Core Payment Systems',
    industry: 'FinTech',
    location: 'Dhaka, Bangladesh',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    openingsCount: 3,
    experienceLevel: 'Senior',
    educationRequired: 'B.Sc. in CSE / Software Engineering or equivalent experience',
    salaryMinBdt: 140000,
    salaryMaxBdt: 220000,
    isSalaryNegotiable: true,
    summary: 'Lead modern Web & Merchant Portal development serving millions of transactions daily across Bangladesh. You will architect robust, accessible React micro-frontends with high test coverage and sub-second load times.',
    responsibilities: [
      'Architect resilient web client applications using React 19, TypeScript, and Tailwind CSS.',
      'Optimize Web Vitals, critical rendering path, and bundle sizes for low-bandwidth 3G/4G network users.',
      'Mentor junior and mid-level engineers through high-standard code reviews and architecture design documents.',
      'Collaborate with UX researchers, product managers, and security auditors to implement compliant KYC flows.'
    ],
    requirements: [
      '5+ years of practical frontend software engineering experience.',
      'Deep expertise in TypeScript, state management (Zustand/Redux), and REST/GraphQL APIs.',
      'Strong grasp of web security (XSS, CSRF, CSP headers, token rotation).',
      'Track record of building complex production dashboards or customer-facing portals.'
    ],
    benefits: [
      'Two Festival Bonuses + Provident Fund + Gratuity',
      'Complete Health & Life Insurance for employee and dependents',
      'Subsidized transport allowance and executive lunch facility',
      'BDT 100,000 annual tech & learning stipend'
    ],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Next.js', 'Jest'],
    questions: [
      {
        id: 'q1',
        question: 'How many years of professional experience do you have with TypeScript and React in production?',
        type: 'number',
        required: true
      },
      {
        id: 'q2',
        question: 'Share a link to a high-scale React project you engineered or contributed to.',
        type: 'portfolio_url',
        required: true
      },
      {
        id: 'q3',
        question: 'Describe your approach to state management in large-scale multi-team web applications.',
        type: 'long_answer',
        required: true
      }
    ],
    deadline: '2026-10-31',
    status: 'active',
    applicantsCount: 14,
    createdAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-09-20T11:00:00Z'
  },
  {
    id: 'job_python_fastapi',
    recruiterId: 'recruiter_pathao',
    companyId: 'comp_pathao',
    companyName: 'Pathao',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Backend Engineer (Python / Go / Distributed Systems)',
    department: 'Ride & Food Dispatch Platform',
    industry: 'Logistics & Tech',
    location: 'Gulshan, Dhaka',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    openingsCount: 2,
    experienceLevel: 'Lead',
    educationRequired: 'Bachelor in Computer Science or proven equivalent expertise',
    salaryMinBdt: 180000,
    salaryMaxBdt: 270000,
    isSalaryNegotiable: true,
    summary: 'Build and scale our ultra-low-latency geospatial dispatch algorithms handling 100,000+ simultaneous requests during peak rush hours across Dhaka, Chittagong, and Sylhet.',
    responsibilities: [
      'Design high-throughput event-driven microservices using Python, Go, Kafka, and Redis.',
      'Architect PostgreSQL schemas with spatial indexing (PostGIS) for real-time driver tracking.',
      'Enhance reliability through SLO/SLA monitoring, distributed tracing (OpenTelemetry), and chaos testing.',
      'Drive engineering initiatives to reduce compute cloud costs without sacrificing throughput.'
    ],
    requirements: [
      '6+ years of backend development experience with high-traffic distributed services.',
      'Proficiency in Python (FastAPI/AsyncIO) and/or Go.',
      'Hands-on experience with Kafka or RabbitMQ, Redis caching, and Docker/Kubernetes container orchestration.',
      'Solid foundations in concurrency, memory profiling, and DB query optimization.'
    ],
    benefits: [
      'Competitive salary + Pathao equity stock options (ESOP)',
      'Free lunch & snacks catered daily at Gulshan headquarters',
      'Monthly Pathao ride and food credits',
      'Comprehensive medical coverage for family'
    ],
    skills: ['Python', 'FastAPI', 'Go', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis', 'Kafka'],
    questions: [
      {
        id: 'pq1',
        question: 'Have you built or maintained microservices handling at least 1,000 RPS in production?',
        type: 'yes_no',
        required: true
      },
      {
        id: 'pq2',
        question: 'Provide a link to your GitHub profile or notable open source contributions.',
        type: 'portfolio_url',
        required: true
      },
      {
        id: 'pq3',
        question: 'What is your current notice period in weeks?',
        type: 'short_answer',
        required: true
      }
    ],
    deadline: '2026-11-15',
    status: 'active',
    applicantsCount: 9,
    createdAt: '2026-09-18T10:30:00Z',
    updatedAt: '2026-09-21T08:00:00Z'
  },
  {
    id: 'job_ml_engineer',
    recruiterId: 'recruiter_brainstation',
    companyId: 'comp_brainstation',
    companyName: 'Brain Station 23',
    companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    title: 'AI / Machine Learning Engineer (LLMs & Vision)',
    department: 'Artificial Intelligence CoE',
    industry: 'AI/ML & Enterprise Tech',
    location: 'Mohakhali DOHS, Dhaka',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    openingsCount: 2,
    experienceLevel: 'Mid-level',
    educationRequired: 'Graduation in CSE, Data Science, or related STEM field',
    salaryMinBdt: 110000,
    salaryMaxBdt: 175000,
    isSalaryNegotiable: true,
    summary: 'Build next-generation enterprise generative AI tools, fine-tuning multilingual models, implementing RAG pipelines, and deploying edge computer vision inference for international clients.',
    responsibilities: [
      'Develop Retrieval-Augmented Generation (RAG) pipelines using vector databases and LLM APIs.',
      'Evaluate model quantization, distillation, and fine-tuning techniques for cost-effective inference.',
      'Deploy models via FastAPI and vLLM inside scalable Kubernetes clusters on GCP / AWS.',
      'Benchmark model safety, bias, hallucination rates, and performance latency.'
    ],
    requirements: [
      '2.5+ years of practical machine learning or deep learning development experience.',
      'Strong coding skills in Python, PyTorch, LangChain / LlamaIndex, and Hugging Face.',
      'Experience with vector search engines like Pinecone, Qdrant, or pgvector.',
      'Understanding of transformer architectures, embeddings, and prompt engineering principles.'
    ],
    benefits: [
      'Remote-first flexibility with co-working access across Bangladesh',
      'Festival bonuses and performance-based biannual increments',
      'Sponsorship for international AI conferences and Cloud certifications',
      'Comprehensive wellness and OPD insurance'
    ],
    skills: ['Python', 'PyTorch', 'Generative AI', 'LangChain', 'FastAPI', 'Docker', 'Vector Databases'],
    questions: [
      {
        id: 'ml_q1',
        question: 'Which vector database or RAG architecture have you deployed to production?',
        type: 'short_answer',
        required: true
      },
      {
        id: 'ml_q2',
        question: 'Share links to your HuggingFace, Kaggle, or GitHub repositories.',
        type: 'portfolio_url',
        required: true
      }
    ],
    deadline: '2026-10-25',
    status: 'active',
    applicantsCount: 18,
    createdAt: '2026-09-12T14:00:00Z',
    updatedAt: '2026-09-20T16:00:00Z'
  },
  {
    id: 'job_uiux_designer',
    recruiterId: 'recruiter_chaldal',
    companyId: 'comp_chaldal',
    companyName: 'Chaldal',
    companyLogo: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Product Designer (UI / UX & Design Systems)',
    department: 'Consumer Experience',
    industry: 'E-commerce',
    location: 'Dhaka, Bangladesh',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    openingsCount: 1,
    experienceLevel: 'Senior',
    educationRequired: 'Degree in Design, HCI, CSE, or outstanding portfolio proof',
    salaryMinBdt: 95000,
    salaryMaxBdt: 150000,
    isSalaryNegotiable: true,
    summary: 'Craft accessible, high-conversion shopping interfaces for everyday essentials. You will lead usability research, iterate on checkout flow friction, and maintain our multi-platform design tokens in Figma.',
    responsibilities: [
      'Design delightful mobile app (iOS/Android) and responsive web experiences.',
      'Maintain and expand the unified design system component library with auto-layout and variables.',
      'Conduct guerrilla testing and field interviews with diverse local customers across Dhaka.',
      'Work closely with mobile engineers to ensure pixel-perfect token delivery and micro-animations.'
    ],
    requirements: [
      '4+ years of product design experience with shipping consumer mobile or web apps.',
      'Flawless command of Figma, design systems, wireframing, and interactive prototyping.',
      'Deep understanding of user mental models, information architecture, and accessibility (WCAG AA).',
      'Portfolio displaying end-to-end case studies with measurable business results.'
    ],
    benefits: [
      'Exclusive grocery discounts and home delivery perks',
      'Bi-annual bonuses + Provident fund',
      'Ergonomic workstation and top-tier MacBook Pro setup',
      'Friendly, no-bureaucracy tech team culture'
    ],
    skills: ['Figma', 'UI/UX', 'Design Systems', 'User Research', 'Prototyping', 'Mobile App Design'],
    questions: [
      {
        id: 'des_q1',
        question: 'Please provide a direct link to your online portfolio or Figma showcase.',
        type: 'portfolio_url',
        required: true
      },
      {
        id: 'des_q2',
        question: 'Describe one metric or user pain point you improved significantly through UX redesign.',
        type: 'long_answer',
        required: true
      }
    ],
    deadline: '2026-10-20',
    status: 'active',
    applicantsCount: 22,
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-09-19T09:00:00Z'
  },
  {
    id: 'job_devops_cloud',
    recruiterId: 'recruiter_walton',
    companyId: 'comp_walton',
    companyName: 'Walton Hi-Tech Industries',
    companyLogo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80',
    title: 'Cloud DevOps & Site Reliability Engineer',
    department: 'Smart IoT Cloud Infrastructure',
    industry: 'Electronics & Hardware',
    location: 'Gazipur / Dhaka',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    openingsCount: 2,
    experienceLevel: 'Mid-level',
    educationRequired: 'B.Sc. in Computer Science / Electrical & Electronic Engineering',
    salaryMinBdt: 85000,
    salaryMaxBdt: 135000,
    isSalaryNegotiable: true,
    summary: 'Oversee the cloud and hybrid infrastructure powering over 2 million connected IoT Walton smart appliances. Maintain high availability, zero-trust network boundaries, and automated CI/CD.',
    responsibilities: [
      'Manage Kubernetes clusters, Terraform scripts, and CI/CD pipelines in GitLab & GitHub Actions.',
      'Implement automated monitoring, Grafana dashboards, and pager alerting policies.',
      'Strengthen Linux host security, container scanning, and network micro-segmentation.',
      'Ensure high throughput MQTT brokers can sustain millions of connected smart devices.'
    ],
    requirements: [
      '3+ years in DevOps, SRE, or Linux systems administration.',
      'Hands-on experience with Docker, Kubernetes, Terraform, and AWS or GCP.',
      'Strong scripting skills in Bash and Python or Go.',
      'Experience with Prometheus, Grafana, and ELK / Loki logging.'
    ],
    benefits: [
      'Company transport provided from major points in Dhaka to Gazipur complex',
      'Two annual festival bonuses + performance incentives',
      'Free lunch and evening refreshments',
      'Subsidized Walton electronic appliances for employee households'
    ],
    skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Linux', 'CI/CD', 'Prometheus'],
    questions: [
      {
        id: 'ops_q1',
        question: 'Do you hold any active AWS, GCP, or CKA certifications?',
        type: 'short_answer',
        required: false
      },
      {
        id: 'ops_q2',
        question: 'Describe how you automated a production deployment with zero downtime.',
        type: 'long_answer',
        required: true
      }
    ],
    deadline: '2026-11-01',
    status: 'active',
    applicantsCount: 7,
    createdAt: '2026-09-16T11:00:00Z',
    updatedAt: '2026-09-22T08:00:00Z'
  },
  {
    id: 'job_sqa_engineer',
    recruiterId: 'recruiter_brac',
    companyId: 'comp_brac',
    companyName: 'BRAC IT Services',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
    title: 'Software Quality Assurance Automation Engineer (Cypress / Playwright)',
    department: 'Digital Financial Services QA',
    industry: 'Enterprise Software & NGO',
    location: 'Dhaka, Bangladesh',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    openingsCount: 3,
    experienceLevel: 'Junior',
    educationRequired: 'Graduation in CSE or related discipline',
    salaryMinBdt: 50000,
    salaryMaxBdt: 80000,
    isSalaryNegotiable: true,
    summary: 'Design end-to-end automated test suites for financial inclusion platforms supporting microfinance disbursements across rural Bangladesh.',
    responsibilities: [
      'Develop robust automated test suites with Playwright / Cypress and TypeScript.',
      'Perform API integration testing with Postman, Newman, and automated regressors.',
      'Execute load and stress testing using k6 or JMeter to simulate peak disbursement events.',
      'Log, track, and verify defects with Jira and cross-team engineers.'
    ],
    requirements: [
      '1.5+ years of practical software testing & automation experience.',
      'Good understanding of JavaScript/TypeScript and web development.',
      'Experience with test planning, test case writing, and defect management life cycles.',
      'Familiarity with Postman API testing and Git.'
    ],
    benefits: [
      'Hybrid 2 days remote work per week',
      'Gratuity, provident fund, and medical insurance',
      'Supportive mentorship and clear career ladder'
    ],
    skills: ['Cypress', 'Playwright', 'TypeScript', 'API Testing', 'Postman', 'Manual Testing'],
    questions: [
      {
        id: 'qa_q1',
        question: 'Which automation framework (Cypress, Playwright, or Selenium) do you feel most confident using?',
        type: 'short_answer',
        required: true
      }
    ],
    deadline: '2026-10-18',
    status: 'active',
    applicantsCount: 26,
    createdAt: '2026-09-08T15:00:00Z',
    updatedAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'job_fullstack_intern',
    recruiterId: 'recruiter_brainstation',
    companyId: 'comp_brainstation',
    companyName: 'Brain Station 23',
    companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    title: 'Software Engineering Intern (Fresh Graduate / Final Year)',
    department: 'Global Delivery Unit',
    industry: 'Software & Cloud Services',
    location: 'Dhaka / Remote',
    workplaceType: 'Hybrid',
    employmentType: 'Internship',
    openingsCount: 5,
    experienceLevel: 'Entry-level',
    educationRequired: 'Currently pursuing or completed B.Sc. in CSE / SE / EEE',
    salaryMinBdt: 25000,
    salaryMaxBdt: 35000,
    isSalaryNegotiable: false,
    summary: 'A 6-month structured internship with high conversion potential to permanent Software Engineer. Learn modern cloud architectures, paired programming, and enterprise development under seasoned mentors.',
    responsibilities: [
      'Collaborate on client project sprints under the guidance of senior technical leads.',
      'Write clean, readable frontend or backend code with corresponding unit tests.',
      'Learn deployment workflows, Git branching strategies, and CI/CD basics.'
    ],
    requirements: [
      'Solid command of OOP, Data Structures, and basic Web Technologies (React, Node or Python).',
      'Eager curiosity to learn fast and embrace constructive feedback.',
      'Academic project or extracurricular portfolio demonstrating passion for coding.'
    ],
    benefits: [
      'Paid monthly internship allowance with conversion review at 6 months',
      'Free lunch, tea, and recreational zones at office',
      'Direct 1-on-1 mentorship from senior software architects'
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'SQL'],
    questions: [
      {
        id: 'int_q1',
        question: 'Which university are you studying at or graduated from?',
        type: 'short_answer',
        required: true
      },
      {
        id: 'int_q2',
        question: 'Share a link to your favorite GitHub repository or university capstone project.',
        type: 'portfolio_url',
        required: true
      }
    ],
    deadline: '2026-10-30',
    status: 'active',
    applicantsCount: 45,
    createdAt: '2026-09-17T11:00:00Z',
    updatedAt: '2026-09-22T07:00:00Z'
  },
  {
    id: 'job_fullstack_nextjs',
    recruiterId: 'recruiter_shopup',
    companyId: 'comp_shopup',
    companyName: 'ShopUp',
    companyLogo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=150&auto=format&fit=crop&q=80',
    title: 'Full-Stack Software Engineer (Next.js 15, Node.js & Microservices)',
    department: 'Mokam Retail Supply Chain',
    industry: 'FinTech & B2B Supply Chain',
    location: 'Tejgaon, Dhaka',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    openingsCount: 3,
    experienceLevel: 'Mid-level',
    educationRequired: 'B.Sc. in Computer Science or Software Engineering',
    salaryMinBdt: 115000,
    salaryMaxBdt: 175000,
    isSalaryNegotiable: true,
    summary: 'Build high-traffic seller portals, credit assessment workflows, and real-time inventory synchronization systems serving over 500,000 neighborhood retail stores across Bangladesh.',
    responsibilities: [
      'Design modular web interfaces using Next.js App Router, React Server Components, and Tailwind CSS.',
      'Develop resilient microservices in Node.js / NestJS with PostgreSQL and Redis caching.',
      'Implement asynchronous webhook queues using BullMQ and RabbitMQ.',
      'Participate in agile sprint plannings and write clean, testable code with Vitest.'
    ],
    requirements: [
      '3+ years of professional full-stack development experience.',
      'Deep fluency with Next.js, TypeScript, PostgreSQL, and Prisma / Drizzle ORM.',
      'Experience optimizing server-side rendering (SSR) and edge API response times.',
      'Familiarity with containerized deployments on Docker and GCP.'
    ],
    benefits: [
      'Attractive performance bonuses + ESOP options',
      'Festival bonuses, Provident fund, and comprehensive healthcare coverage',
      'Hybrid work model (3 days office, 2 days remote)',
      'Subsidized chef-prepared lunch and espresso bar'
    ],
    skills: ['Next.js', 'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'Redis'],
    questions: [
      {
        id: 'su_q1',
        question: 'Have you worked with Next.js App Router and Server Components in production?',
        type: 'yes_no',
        required: true
      },
      {
        id: 'su_q2',
        question: 'Provide a GitHub link to a project demonstrating full-stack TypeScript architecture.',
        type: 'portfolio_url',
        required: true
      }
    ],
    deadline: '2026-11-20',
    status: 'active',
    applicantsCount: 16,
    createdAt: '2026-09-19T09:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'job_mobile_flutter',
    recruiterId: 'recruiter_sheba',
    companyId: 'comp_sheba',
    companyName: 'Sheba Platform Limited',
    companyLogo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Mobile Engineer (Flutter / Dart / iOS & Android)',
    department: 'Core Consumer & Partner Apps',
    industry: 'Hyperlocal Services & SME Tech',
    location: 'Banani, Dhaka',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    openingsCount: 2,
    experienceLevel: 'Senior',
    educationRequired: 'Graduation in Computer Science / IT or equivalent practical background',
    salaryMinBdt: 105000,
    salaryMaxBdt: 165000,
    isSalaryNegotiable: true,
    summary: 'Lead the continuous engineering of Sheba.xyz consumer and provider mobile apps with smooth 60fps animations, offline-first SQLite synchronization, and real-time live map tracking.',
    responsibilities: [
      'Architect Flutter applications with clean Bloc / Riverpod architecture and strict test coverage.',
      'Integrate native background location services, push notifications, and bKash / Nagad payment SDKs.',
      'Refactor legacy modules to improve cold boot time and memory footprint on low-end devices.',
      'Maintain automated build and distribution pipelines with Fastlane and Google Play / TestFlight.'
    ],
    requirements: [
      '4+ years in cross-platform or native mobile development, with 3+ years dedicated to Flutter.',
      'Demonstrated published apps on the Google Play Store and Apple App Store.',
      'Deep knowledge of state management, isolates, background processing, and memory leak debugging.',
      'Experience with Firebase Cloud Messaging, WebSockets, and Google Maps SDK.'
    ],
    benefits: [
      'Competitive compensation package with yearly performance raises',
      'Free in-house gym and gaming zone access',
      'Two annual festival bonuses + Gratuity program',
      'Dedicated learning budget for international certifications'
    ],
    skills: ['Flutter', 'Dart', 'Bloc', 'iOS', 'Android', 'REST APIs', 'Firebase', 'Google Maps'],
    questions: [
      {
        id: 'sh_q1',
        question: 'Share links to at least 2 live mobile apps on Google Play or Apple App Store you built.',
        type: 'portfolio_url',
        required: true
      },
      {
        id: 'sh_q2',
        question: 'How do you handle background location tracking and battery optimization in Flutter?',
        type: 'long_answer',
        required: true
      }
    ],
    deadline: '2026-11-10',
    status: 'active',
    applicantsCount: 11,
    createdAt: '2026-09-20T11:00:00Z',
    updatedAt: '2026-09-23T06:00:00Z'
  },
  {
    id: 'job_data_analyst_gp',
    recruiterId: 'recruiter_gp',
    companyId: 'comp_grameenphone',
    companyName: 'Grameenphone Ltd.',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Data Analyst & Business Intelligence Specialist',
    department: 'Advanced Analytics & Big Data',
    industry: 'Telecommunications & Cloud Services',
    location: 'Bashundhara R/A, Dhaka',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    openingsCount: 1,
    experienceLevel: 'Senior',
    educationRequired: 'Bachelor or Master in Data Science, Statistics, Economics, CSE, or related field',
    salaryMinBdt: 120000,
    salaryMaxBdt: 180000,
    isSalaryNegotiable: false,
    summary: 'Derive high-impact commercial insights from terabyte-scale telecom datasets. Build automated executive dashboards and predictive churn models directly informing nationwide digital campaigns.',
    responsibilities: [
      'Write optimized SQL queries on Google BigQuery and Snowflake processing 100M+ rows daily.',
      'Design interactive PowerBI and Tableau dashboards for C-suite and division heads.',
      'Collaborate with Data Engineers to build reliable ETL/ELT pipelines in Apache Airflow.',
      'Perform cohort retention analyses and statistical A/B testing on subscriber packages.'
    ],
    requirements: [
      '4+ years of data analytics experience in telecom, banking, or large digital products.',
      'Mastery of advanced SQL (window functions, CTEs, performance tuning) and Python (Pandas/Polars).',
      'Extensive hands-on portfolio creating business dashboards in PowerBI or Tableau.',
      'Strong presentation skills to communicate technical data trends to non-technical stakeholders.'
    ],
    benefits: [
      'Top-tier telecom corporate perks (medical for entire family, daycare facility on campus)',
      'Subsidized AC commuter shuttle across Dhaka',
      'Two festival bonuses + annual corporate profit share',
      'Free unlimited GP high-speed 5G mobile data and device allowance'
    ],
    skills: ['SQL', 'Python', 'PowerBI', 'Google BigQuery', 'ETL', 'Tableau', 'Statistics'],
    questions: [
      {
        id: 'gp_q1',
        question: 'Which enterprise data warehouse (BigQuery, Snowflake, Redshift) have you queried at scale?',
        type: 'short_answer',
        required: true
      },
      {
        id: 'gp_q2',
        question: 'Describe an occasion where your data insights resulted in direct business or revenue impact.',
        type: 'long_answer',
        required: true
      }
    ],
    deadline: '2026-11-25',
    status: 'active',
    applicantsCount: 28,
    createdAt: '2026-09-15T08:00:00Z',
    updatedAt: '2026-09-22T14:00:00Z'
  },
  {
    id: 'job_cybersecurity_tigerit',
    recruiterId: 'recruiter_tigerit',
    companyId: 'comp_tigerit',
    companyName: 'TigerIT Bangladesh',
    companyLogo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&auto=format&fit=crop&q=80',
    title: 'Senior Cybersecurity & Threat Intelligence Engineer',
    department: 'Information Security & Infrastructure Defense',
    industry: 'Biometrics, National ID & High-Scale Systems',
    location: 'Uttara, Dhaka',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    openingsCount: 2,
    experienceLevel: 'Senior',
    educationRequired: 'B.Sc. in CSE, Information Security, or equivalent cybersecurity credentials (CEH, CISSP, OSCP)',
    salaryMinBdt: 130000,
    salaryMaxBdt: 210000,
    isSalaryNegotiable: true,
    summary: 'Protect national-tier identity registries and mission-critical government servers against sophisticated advanced persistent threats (APT), zero-day attacks, and unauthorized exfiltration.',
    responsibilities: [
      'Conduct regular internal penetration testing, vulnerability assessments, and red team drills.',
      'Configure SIEM tooling (Splunk, Elastic SIEM, Wazuh) for 24/7 threat detection and alerting.',
      'Perform forensic investigations into anomalous network traffic and forensic memory captures.',
      'Enforce strict ISO 27001 and SOC 2 Type II compliance controls across engineering teams.'
    ],
    requirements: [
      '5+ years in security engineering, penetration testing, or SOC tier 2/3 operations.',
      'Recognized industry certifications such as OSCP, CISSP, CEH, or CompTIA Security+.',
      'Deep understanding of network security protocols, firewall architectures, and cryptographic standards.',
      'Experience with Python / Go / Bash for automated security script development.'
    ],
    benefits: [
      'High-impact national infrastructure mission work',
      'Gratuity, provident fund, and comprehensive executive life insurance',
      'Subsidized transport allowance and executive cafeteria facility',
      'Annual sponsored trips to DEF CON and Black Hat conferences'
    ],
    skills: ['Cybersecurity', 'Penetration Testing', 'SIEM', 'Network Security', 'Linux', 'Python', 'ISO 27001'],
    questions: [
      {
        id: 'tig_q1',
        question: 'Do you hold active certifications (OSCP, CISSP, CEH, or similar)? List them.',
        type: 'short_answer',
        required: true
      },
      {
        id: 'tig_q2',
        question: 'Describe how you investigated or remediated a high-severity security incident in the past.',
        type: 'long_answer',
        required: true
      }
    ],
    deadline: '2026-11-30',
    status: 'active',
    applicantsCount: 8,
    createdAt: '2026-09-18T12:00:00Z',
    updatedAt: '2026-09-21T15:00:00Z'
  },
  {
    id: 'job_solutions_architect',
    recruiterId: 'recruiter_optimizely',
    companyId: 'comp_optimizely',
    companyName: 'Optimizely Bangladesh',
    companyLogo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=80',
    title: 'Principal Cloud Solutions Architect (.NET / Azure / AWS / Microservices)',
    department: 'Global Cloud Architecture Group',
    industry: 'Digital Experience Platform & SaaS',
    location: 'Gulshan-2, Dhaka',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    openingsCount: 1,
    experienceLevel: 'Lead',
    educationRequired: 'Bachelor or Master in Computer Science or Software Engineering',
    salaryMinBdt: 190000,
    salaryMaxBdt: 290000,
    isSalaryNegotiable: true,
    summary: 'Lead the overarching architectural design for global SaaS digital experience engines serving Fortune 500 customers across North America, Europe, and Asia.',
    responsibilities: [
      'Define architectural blueprints for multi-tenant microservices on Microsoft Azure and AWS.',
      'Guide technical leadership teams across Dhaka and Stockholm on modern cloud-native patterns.',
      'Optimize database scaling, caching hierarchies, and multi-region failover disaster recovery.',
      'Author Architecture Decision Records (ADRs) and conduct rigorous security threat modeling.'
    ],
    requirements: [
      '8+ years in software engineering with 3+ years in a Principal or Solutions Architect capacity.',
      'Extensive mastery of modern C# / .NET 8, cloud microservices, and distributed message brokers.',
      'Deep architectural experience on Azure (AKS, CosmosDB, Event Hubs) or AWS.',
      'Outstanding technical leadership, conflict resolution, and communication skills.'
    ],
    benefits: [
      'Global Silicon Valley-caliber remuneration + annual stock grant options',
      '30 days paid annual leave + international travel opportunities to Nordic offices',
      'Comprehensive family insurance with OPD & dental coverage',
      'BDT 150,000 yearly wellness and home-office equipment grant'
    ],
    skills: ['.NET', 'C#', 'Azure', 'Microservices', 'Kubernetes', 'AWS', 'System Design'],
    questions: [
      {
        id: 'opt_q1',
        question: 'How many years of experience do you have architecting distributed enterprise cloud systems?',
        type: 'number',
        required: true
      },
      {
        id: 'opt_q2',
        question: 'Share an example of a multi-region cloud resilience or disaster recovery plan you designed.',
        type: 'long_answer',
        required: true
      }
    ],
    deadline: '2026-11-20',
    status: 'active',
    applicantsCount: 6,
    createdAt: '2026-09-17T14:00:00Z',
    updatedAt: '2026-09-23T04:00:00Z'
  },
  {
    id: 'job_voip_telecom',
    recruiterId: 'recruiter_brotecs',
    companyId: 'comp_brotecs',
    companyName: 'Brotecs Technologies',
    companyLogo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=150&auto=format&fit=crop&q=80',
    title: 'Senior C++ & VoIP Systems Engineer (WebRTC / SIP / Real-Time Media)',
    department: 'Core Media Engine & Protocol Development',
    industry: 'Telecom Software & Embedded Engineering',
    location: 'Niketan, Gulshan, Dhaka',
    workplaceType: 'On-site',
    employmentType: 'Full-time',
    openingsCount: 2,
    experienceLevel: 'Senior',
    educationRequired: 'B.Sc. in CSE or Electrical & Electronic Engineering',
    salaryMinBdt: 125000,
    salaryMaxBdt: 195000,
    isSalaryNegotiable: true,
    summary: 'Build ultra-low latency real-time audio and video streaming engines using C++, WebRTC, SIP, and media codec packetization for global carrier networks.',
    responsibilities: [
      'Write performant, memory-safe Modern C++ (C++17/20) for real-time media processing.',
      'Optimize jitter buffers, echo cancellation, packet loss concealment (PLC), and audio codecs (Opus).',
      'Debug low-level network packet captures using Wireshark and gdb on Linux servers.',
      'Integrate WebRTC media servers (Janus, mediasoup) into client SDKs for mobile and desktop.'
    ],
    requirements: [
      '4+ years of professional C++ development experience in network or systems programming.',
      'Solid grasp of real-time protocols (RTP, RTCP, SIP, SDP, WebRTC, TCP/UDP sockets).',
      'Proficiency in multithreading, memory profiling with Valgrind, and Linux socket APIs.',
      'Passion for low-latency systems and audio/video digital signal processing.'
    ],
    benefits: [
      'Two annual festival bonuses + performance profit sharing',
      'Fully catered lunch and snacks at modern Niketan office',
      'Health insurance for employee, spouse, and children',
      'Relocation assistance if moving to Dhaka from other districts'
    ],
    skills: ['C++', 'WebRTC', 'VoIP', 'SIP', 'Linux', 'Socket Programming', 'Networking'],
    questions: [
      {
        id: 'bro_q1',
        question: 'Have you written production software with WebRTC, SIP, or custom RTP socket pipelines?',
        type: 'yes_no',
        required: true
      },
      {
        id: 'bro_q2',
        question: 'How do you handle packet loss and jitter in real-time UDP audio streams?',
        type: 'long_answer',
        required: true
      }
    ],
    deadline: '2026-11-18',
    status: 'active',
    applicantsCount: 7,
    createdAt: '2026-09-19T10:00:00Z',
    updatedAt: '2026-09-22T09:00:00Z'
  }
];

export const INITIAL_SAMPLE_APPLICATIONS: Application[] = [
  {
    id: 'app_sample_1',
    jobId: 'job_senior_react',
    jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
    companyName: 'bKash Limited',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    candidateId: 'demo_seeker_tanvir',
    candidateName: 'Tanvir Hossain',
    candidateEmail: 'tanvir.hossain@example.com',
    candidatePhone: '+880 1711-234567',
    candidateHeadline: 'Senior Frontend Engineer | React, TypeScript, Next.js',
    candidateLocation: 'Dhaka, Bangladesh',
    recruiterId: 'recruiter_bkash',
    resumeFileName: 'Tanvir_Hossain_Senior_Frontend_Resume.pdf',
    answers: {
      q1: '6 years of production React and TypeScript experience across FinTech & SaaS products.',
      q2: 'https://github.com/tanvir-dev/fintech-dashboard',
      q3: 'I favor atomic state libraries like Zustand for lightweight client state, paired with React Query for server cache invalidation and TanStack Virtual for high-volume ledger tables.'
    },
    status: 'shortlisted',
    appliedAt: '2026-09-16T10:15:00Z',
    updatedAt: '2026-09-18T14:30:00Z',
    aiAnalysis: {
      matchScore: 92,
      summary: 'Exceptional match. Candidate brings 6 years of solid React and TypeScript FinTech experience with proven open-source contributions.',
      matchingSkills: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Next.js'],
      missingSkills: ['Jest'],
      relevantExperienceSummary: 'Engineered high-concurrency payment portals with sub-second response times.',
      strengths: ['FinTech industry domain knowledge', 'Clean architecture principles', 'Strong communication'],
      concerns: [],
      disclaimer: 'AI-generated assistance signal. Please review full application and interview before making hiring decisions.',
      analyzedAt: '2026-09-16T10:18:00Z'
    },
    recruiterNotes: 'Impressive GitHub code architecture. Scheduled technical screen for next Monday.',
    timeline: [
      { status: 'applied', timestamp: '2026-09-16T10:15:00Z', note: 'Application received' },
      { status: 'under_review', timestamp: '2026-09-17T09:00:00Z', note: 'AI screening complete' },
      { status: 'shortlisted', timestamp: '2026-09-18T14:30:00Z', note: 'Shortlisted by Lead Recruiter' }
    ]
  },
  {
    id: 'app_sample_2',
    jobId: 'job_python_fastapi',
    jobTitle: 'Lead Backend Engineer (Python / Go / Distributed Systems)',
    companyName: 'Pathao',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    candidateId: 'demo_seeker_nabil',
    candidateName: 'Nabil Ahmed',
    candidateEmail: 'nabil.dev@example.com',
    candidatePhone: '+880 1819-876543',
    candidateHeadline: 'Distributed Systems & Cloud Backend Architect',
    candidateLocation: 'Gulshan, Dhaka',
    recruiterId: 'recruiter_pathao',
    resumeFileName: 'Nabil_Ahmed_Backend_Lead.pdf',
    answers: {
      pq1: 'Yes',
      pq2: 'https://github.com/nabil-systems',
      pq3: '4 weeks notice period'
    },
    status: 'interview',
    appliedAt: '2026-09-19T08:20:00Z',
    updatedAt: '2026-09-21T11:00:00Z',
    aiAnalysis: {
      matchScore: 89,
      summary: 'Robust backend foundation in Python, Go, and Kafka with experience scaling distributed microservices.',
      matchingSkills: ['Python', 'FastAPI', 'Go', 'PostgreSQL', 'Docker', 'Redis', 'Kafka'],
      missingSkills: ['Kubernetes'],
      relevantExperienceSummary: 'Built geospatial dispatch systems supporting millions of monthly transactions.',
      strengths: ['High scale throughput experience', 'Solid database optimization track record'],
      concerns: ['Prefers hybrid; check commute readiness'],
      disclaimer: 'AI-generated assistance signal. Please review full application and interview before making hiring decisions.',
      analyzedAt: '2026-09-19T08:25:00Z'
    },
    recruiterNotes: 'Passed stage 1 screening. Technical system design interview set.',
    timeline: [
      { status: 'applied', timestamp: '2026-09-19T08:20:00Z' },
      { status: 'under_review', timestamp: '2026-09-19T14:00:00Z' },
      { status: 'shortlisted', timestamp: '2026-09-20T10:00:00Z' },
      { status: 'interview', timestamp: '2026-09-21T11:00:00Z', note: 'Technical Interview with VP of Engineering' }
    ]
  },
  {
    id: 'app_sample_3',
    jobId: 'job_senior_react',
    jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
    companyName: 'bKash Limited',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    candidateId: 'demo_seeker_sadia',
    candidateName: 'Sadia Rahman',
    candidateEmail: 'sadia.rahman@example.com',
    candidatePhone: '+880 1912-345678',
    candidateHeadline: 'Full-Stack & React UI Specialist (5+ Years Experience)',
    candidateLocation: 'Uttara, Dhaka',
    recruiterId: 'recruiter_bkash',
    resumeFileName: 'Sadia_Rahman_FullStack_React.pdf',
    resumeTextSnippet: 'Sadia Rahman - 5 years experience with React, Next.js, TypeScript, Redux Toolkit, Tailwind CSS, Jest, and REST APIs. Built enterprise web portals for telecom clients.',
    answers: {
      q1: '5 years of professional React & TypeScript experience building design systems and client dashboards.',
      q2: 'https://github.com/sadia-ui-dev',
      q3: 'Strong advocate for accessible React components, Tailwind tokens, and thorough unit testing with Jest/React Testing Library.'
    },
    status: 'shortlisted',
    appliedAt: '2026-09-17T14:20:00Z',
    updatedAt: '2026-09-18T16:00:00Z',
    aiAnalysis: {
      matchScore: 88,
      summary: 'Strong candidate with 5 years in React, automated UI testing, and accessible component architectures. Well aligned with frontend engineering goals.',
      matchingSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Jest'],
      missingSkills: ['GraphQL'],
      relevantExperienceSummary: '5 years crafting design systems and micro-frontends with high test coverage.',
      strengths: ['Comprehensive Jest/RTL unit testing experience', 'Design system consistency', 'Accessible UI expertise'],
      concerns: ['Less direct FinTech domain experience compared to Top Rank'],
      disclaimer: 'AI-generated assistance signal. Please review full application and interview before making hiring decisions.',
      analyzedAt: '2026-09-17T14:25:00Z'
    },
    recruiterNotes: 'Great testing background and clean component portfolio.',
    timeline: [
      { status: 'applied', timestamp: '2026-09-17T14:20:00Z' },
      { status: 'under_review', timestamp: '2026-09-18T09:00:00Z' },
      { status: 'shortlisted', timestamp: '2026-09-18T16:00:00Z' }
    ]
  },
  {
    id: 'app_sample_4',
    jobId: 'job_senior_react',
    jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
    companyName: 'bKash Limited',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    candidateId: 'demo_seeker_faisal',
    candidateName: 'Faisal Karim',
    candidateEmail: 'faisal.karim@example.com',
    candidatePhone: '+880 1712-998877',
    candidateHeadline: 'Frontend Engineer | React, Vue & Web Performance (4 Years)',
    candidateLocation: 'Banani, Dhaka',
    recruiterId: 'recruiter_bkash',
    resumeFileName: 'Faisal_Karim_Frontend.pdf',
    resumeTextSnippet: 'Faisal Karim - 4 years experience with React, JavaScript, HTML5/CSS3, Vite, Tailwind CSS. Focused on web vitals, Lighthouse optimization, and responsive design.',
    answers: {
      q1: '4 years experience with React and modern frontend toolchains.',
      q2: 'https://github.com/faisal-web',
      q3: 'I specialize in optimizing bundle sizes, lazy loading images, and caching with service workers.'
    },
    status: 'under_review',
    appliedAt: '2026-09-18T09:40:00Z',
    updatedAt: '2026-09-18T11:00:00Z',
    aiAnalysis: {
      matchScore: 78,
      summary: 'Promising frontend engineer with 4 years building responsive web apps. Strong in web performance and Tailwind CSS, but less experienced in complex TypeScript and GraphQL.',
      matchingSkills: ['React', 'Tailwind CSS'],
      missingSkills: ['TypeScript', 'GraphQL', 'Jest'],
      relevantExperienceSummary: '4 years of client-side web applications and core web vitals optimization.',
      strengths: ['Lighthouse performance optimization', 'Responsive UX design'],
      concerns: ['TypeScript proficiency needs evaluation during technical interview'],
      disclaimer: 'AI-generated assistance signal. Please review full application and interview before making hiring decisions.',
      analyzedAt: '2026-09-18T09:45:00Z'
    },
    recruiterNotes: 'Good frontend skills, let us assess TypeScript depth.',
    timeline: [
      { status: 'applied', timestamp: '2026-09-18T09:40:00Z' },
      { status: 'under_review', timestamp: '2026-09-18T11:00:00Z' }
    ]
  },
  {
    id: 'app_sample_5',
    jobId: 'job_fullstack_nextjs',
    jobTitle: 'Full-Stack Software Engineer (Next.js 15, Node.js & Microservices)',
    companyName: 'ShopUp',
    companyLogo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=150&auto=format&fit=crop&q=80',
    candidateId: 'demo_seeker_mahmudul',
    candidateName: 'Mahmudul Hasan',
    candidateEmail: 'mahmudul.hasan@example.com',
    candidatePhone: '+880 1611-345678',
    candidateHeadline: 'Full-Stack TypeScript & Next.js Engineer (4+ Years Experience)',
    candidateLocation: 'Mirpur DOHS, Dhaka',
    recruiterId: 'recruiter_shopup',
    resumeFileName: 'Mahmudul_Hasan_FullStack_Resume.pdf',
    resumeTextSnippet: 'Mahmudul Hasan - Full-stack engineer with 4.5 years developing enterprise e-commerce platforms using Next.js 15, React Server Components, TypeScript, Node.js/NestJS, PostgreSQL, Prisma, Redis, Docker.',
    answers: {
      su_q1: 'Yes',
      su_q2: 'https://github.com/mahmudul-dev/b2b-supply-hub'
    },
    status: 'shortlisted',
    appliedAt: '2026-09-20T10:30:00Z',
    updatedAt: '2026-09-22T14:15:00Z',
    aiAnalysis: {
      matchScore: 94,
      summary: 'Outstanding technical fit. Extensive experience deploying Next.js App Router and NestJS microservices in high-volume retail supply chains.',
      matchingSkills: ['Next.js', 'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'Redis'],
      missingSkills: [],
      relevantExperienceSummary: 'Architected high-volume seller storefronts handling 50,000+ daily orders.',
      strengths: ['Modern Next.js 15 SSR expertise', 'Strong database schema indexing skills', 'Clean async BullMQ queue management'],
      concerns: [],
      disclaimer: 'AI-generated assistance signal. Please review full application and interview before making hiring decisions.',
      analyzedAt: '2026-09-20T10:35:00Z'
    },
    recruiterNotes: 'Top candidate for Mokam supply chain team. Preparing technical challenge review.',
    timeline: [
      { status: 'applied', timestamp: '2026-09-20T10:30:00Z', note: 'Application received' },
      { status: 'under_review', timestamp: '2026-09-21T09:00:00Z', note: 'AI screening complete' },
      { status: 'shortlisted', timestamp: '2026-09-22T14:15:00Z', note: 'Shortlisted by Engineering Director' }
    ]
  },
  {
    id: 'app_sample_6',
    jobId: 'job_mobile_flutter',
    jobTitle: 'Senior Mobile Engineer (Flutter / Dart / iOS & Android)',
    companyName: 'Sheba Platform Limited',
    companyLogo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=150&auto=format&fit=crop&q=80',
    candidateId: 'demo_seeker_tasnim',
    candidateName: 'Tasnim Ferdous',
    candidateEmail: 'tasnim.flutter@example.com',
    candidatePhone: '+880 1812-456789',
    candidateHeadline: 'Senior Flutter & Mobile Architect (Published 8+ Apps)',
    candidateLocation: 'Dhanmondi, Dhaka',
    recruiterId: 'recruiter_sheba',
    resumeFileName: 'Tasnim_Ferdous_Mobile_Architect.pdf',
    resumeTextSnippet: 'Tasnim Ferdous - 5 years software development, 4 years Flutter/Dart specialization. Shipped 8 production applications with 500k+ downloads. Deep expertise in Bloc, local database caching, live geolocation tracking.',
    answers: {
      sh_q1: 'https://play.google.com/store/apps/details?id=com.sheba.service.expert',
      sh_q2: 'I implement native foreground services with Android WorkManager and iOS Background App Refresh, throttled by geofence triggers to preserve device battery.'
    },
    status: 'interview',
    appliedAt: '2026-09-21T11:00:00Z',
    updatedAt: '2026-09-23T08:00:00Z',
    aiAnalysis: {
      matchScore: 91,
      summary: 'Superb mobile candidate. Has proven track record building localized dispatch and geolocation tracking apps with exceptional battery performance.',
      matchingSkills: ['Flutter', 'Dart', 'Bloc', 'iOS', 'Android', 'REST APIs', 'Firebase', 'Google Maps'],
      missingSkills: [],
      relevantExperienceSummary: 'Led mobile engineering for on-demand logistics apps across Bangladesh.',
      strengths: ['Live Google Maps tracking optimization', 'Clean Bloc reactive state architecture', 'High Play Store ratings track record'],
      concerns: [],
      disclaimer: 'AI-generated assistance signal. Please review full application and interview before making hiring decisions.',
      analyzedAt: '2026-09-21T11:05:00Z'
    },
    recruiterNotes: 'Advanced to technical system architecture interview round.',
    timeline: [
      { status: 'applied', timestamp: '2026-09-21T11:00:00Z' },
      { status: 'under_review', timestamp: '2026-09-22T10:00:00Z' },
      { status: 'shortlisted', timestamp: '2026-09-22T16:00:00Z' },
      { status: 'interview', timestamp: '2026-09-23T08:00:00Z', note: 'Technical Interview scheduled with Mobile Team Lead' }
    ]
  },
  {
    id: 'app_sample_7',
    jobId: 'job_ml_engineer',
    jobTitle: 'AI / Machine Learning Engineer (LLMs & Vision)',
    companyName: 'Brain Station 23',
    companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    candidateId: 'demo_seeker_rafiq',
    candidateName: 'Rafiqul Islam',
    candidateEmail: 'rafiqul.ai@example.com',
    candidatePhone: '+880 1911-567890',
    candidateHeadline: 'Generative AI & LLM Systems Engineer | PyTorch, RAG & Vector DBs',
    candidateLocation: 'Mohakhali, Dhaka',
    recruiterId: 'recruiter_brainstation',
    resumeFileName: 'Rafiqul_Islam_AI_Engineer.pdf',
    resumeTextSnippet: 'Rafiqul Islam - 3 years experience implementing enterprise AI pipelines, RAG systems with Qdrant and LangChain, fine-tuning Llama and Mistral models, deploying high-throughput FastAPI inference microservices on Kubernetes.',
    answers: {
      ml_q1: 'Deployed hybrid Qdrant + BM25 sparse-dense retrieval pipelines with re-ranking on AWS EKS.',
      ml_q2: 'https://github.com/rafiq-ai/enterprise-rag-benchmark'
    },
    status: 'interview',
    appliedAt: '2026-09-18T16:00:00Z',
    updatedAt: '2026-09-21T14:00:00Z',
    aiAnalysis: {
      matchScore: 93,
      summary: 'Exceptional generative AI candidate with real-world RAG and LLM quantization experience.',
      matchingSkills: ['Python', 'PyTorch', 'Generative AI', 'LangChain', 'FastAPI', 'Docker', 'Vector Databases'],
      missingSkills: [],
      relevantExperienceSummary: 'Built production RAG assistants answering complex legal and compliance queries.',
      strengths: ['Multi-lingual model fine-tuning', 'Vector database latency optimization', 'Solid Docker/K8s deployment foundations'],
      concerns: [],
      disclaimer: 'AI-generated assistance signal. Please review full application and interview before making hiring decisions.',
      analyzedAt: '2026-09-18T16:05:00Z'
    },
    recruiterNotes: 'Strong RAG benchmarks. Next round scheduled with AI CoE Director.',
    timeline: [
      { status: 'applied', timestamp: '2026-09-18T16:00:00Z' },
      { status: 'under_review', timestamp: '2026-09-19T11:00:00Z' },
      { status: 'shortlisted', timestamp: '2026-09-20T12:00:00Z' },
      { status: 'interview', timestamp: '2026-09-21T14:00:00Z', note: 'AI System Design interview' }
    ]
  },
  {
    id: 'app_sample_8',
    jobId: 'job_data_analyst_gp',
    jobTitle: 'Lead Data Analyst & Business Intelligence Specialist',
    companyName: 'Grameenphone Ltd.',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
    candidateId: 'demo_seeker_farhana',
    candidateName: 'Farhana Yasmin',
    candidateEmail: 'farhana.data@example.com',
    candidatePhone: '+880 1714-889900',
    candidateHeadline: 'Senior Business Intelligence & SQL Analytics Specialist (4.5 Years)',
    candidateLocation: 'Bashundhara, Dhaka',
    recruiterId: 'recruiter_gp',
    resumeFileName: 'Farhana_Yasmin_Senior_Data_Analyst.pdf',
    resumeTextSnippet: 'Farhana Yasmin - 4.5 years experience querying BigQuery, writing complex SQL window functions, designing PowerBI executive reports, modeling churn forecasting in Python (Pandas/Scikit-learn).',
    answers: {
      gp_q1: 'Google BigQuery and Snowflake on datasets exceeding 250M rows.',
      gp_q2: 'Discovered subscription drop-off friction in regional 4G bundles, driving campaign redesign that boosted package renewals by 23% in Chattogram division.'
    },
    status: 'under_review',
    appliedAt: '2026-09-21T09:30:00Z',
    updatedAt: '2026-09-22T11:00:00Z',
    aiAnalysis: {
      matchScore: 87,
      summary: 'Impressive analytics background in telecommunications and subscription metrics. Highly proficient in BigQuery and PowerBI.',
      matchingSkills: ['SQL', 'Python', 'PowerBI', 'Google BigQuery', 'ETL', 'Statistics'],
      missingSkills: ['Tableau'],
      relevantExperienceSummary: 'Led business intelligence dashboard development for commercial marketing teams.',
      strengths: ['Direct telecom analytics experience', 'Data storytelling and executive presentation skills'],
      concerns: ['Prefers PowerBI over Tableau (easily transferable)'],
      disclaimer: 'AI-generated assistance signal. Please review full application and interview before making hiring decisions.',
      analyzedAt: '2026-09-21T09:35:00Z'
    },
    recruiterNotes: 'Excellent commercial acumen. BigQuery SQL test to be shared.',
    timeline: [
      { status: 'applied', timestamp: '2026-09-21T09:30:00Z' },
      { status: 'under_review', timestamp: '2026-09-22T11:00:00Z' }
    ]
  },
  {
    id: 'app_sample_9',
    jobId: 'job_uiux_designer',
    jobTitle: 'Senior Product Designer (UI / UX & Design Systems)',
    companyName: 'Chaldal',
    companyLogo: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=150&auto=format&fit=crop&q=80',
    candidateId: 'demo_seeker_zobaida',
    candidateName: 'Zobaida Akter',
    candidateEmail: 'zobaida.design@example.com',
    candidatePhone: '+880 1515-678901',
    candidateHeadline: 'Senior UI/UX & Interaction Designer | Figma Systems & Mobile Design',
    candidateLocation: 'Uttara, Dhaka',
    recruiterId: 'recruiter_chaldal',
    resumeFileName: 'Zobaida_Akter_Product_Design.pdf',
    resumeTextSnippet: 'Zobaida Akter - 4.5 years experience designing consumer mobile apps in Figma, running field usability tests in local Bengali markets, structuring scalable token libraries, and boosting checkout conversions.',
    answers: {
      des_q1: 'https://dribbble.com/zobaida-ux',
      des_q2: 'Redesigned mobile grocery cart drawer resulting in 18% lower abandonment rate and reduced taps-to-order from 7 to 3.'
    },
    status: 'shortlisted',
    appliedAt: '2026-09-19T13:45:00Z',
    updatedAt: '2026-09-21T16:20:00Z',
    aiAnalysis: {
      matchScore: 86,
      summary: 'Strong interaction designer with deep empathy for local Bangladeshi consumers and proven checkout friction reduction.',
      matchingSkills: ['Figma', 'UI/UX', 'Design Systems', 'User Research', 'Prototyping', 'Mobile App Design'],
      missingSkills: [],
      relevantExperienceSummary: 'Shipped high-conversion grocery and retail e-commerce flows.',
      strengths: ['Accessible Bengali typography and interface design', 'Component tokenization in Figma'],
      concerns: [],
      disclaimer: 'AI-generated assistance signal. Please review full application and interview before making hiring decisions.',
      analyzedAt: '2026-09-19T13:50:00Z'
    },
    recruiterNotes: 'Figma component library looks clean and structured. Inviting for portfolio walkthrough.',
    timeline: [
      { status: 'applied', timestamp: '2026-09-19T13:45:00Z' },
      { status: 'under_review', timestamp: '2026-09-20T10:00:00Z' },
      { status: 'shortlisted', timestamp: '2026-09-21T16:20:00Z' }
    ]
  },
  {
    id: 'app_sample_10',
    jobId: 'job_devops_cloud',
    jobTitle: 'Cloud DevOps & Site Reliability Engineer',
    companyName: 'Walton Hi-Tech Industries',
    companyLogo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80',
    candidateId: 'demo_seeker_ariful',
    candidateName: 'Ariful Haque',
    candidateEmail: 'ariful.devops@example.com',
    candidatePhone: '+880 1819-234567',
    candidateHeadline: 'Cloud DevOps & Kubernetes SRE | CKA Certified, AWS & Terraform',
    candidateLocation: 'Gazipur, Bangladesh',
    recruiterId: 'recruiter_walton',
    resumeFileName: 'Ariful_Haque_DevOps_SRE.pdf',
    resumeTextSnippet: 'Ariful Haque - 4 years automating cloud infrastructure, managing multi-node Kubernetes clusters, building GitLab CI/CD, configuring Prometheus/Grafana alerting, and securing Linux workloads.',
    answers: {
      ops_q1: 'CKA (Certified Kubernetes Administrator) & AWS Solutions Architect Associate.',
      ops_q2: 'Configured blue-green deployment pipelines with ArgoCD and Kubernetes ingress canary routing, ensuring zero dropped user sessions.'
    },
    status: 'interview',
    appliedAt: '2026-09-20T14:00:00Z',
    updatedAt: '2026-09-22T17:30:00Z',
    aiAnalysis: {
      matchScore: 90,
      summary: 'High-caliber SRE candidate with active CKA certification and hands-on Kubernetes automation experience. Ideal for IoT cloud scale.',
      matchingSkills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Linux', 'CI/CD', 'Prometheus'],
      missingSkills: [],
      relevantExperienceSummary: 'Maintained 99.99% uptime on high-throughput sensor telemetry platforms.',
      strengths: ['Certified Kubernetes Administrator', 'Strong automated canary rollback experience', 'Local to Gazipur tech complex'],
      concerns: [],
      disclaimer: 'AI-generated assistance signal. Please review full application and interview before making hiring decisions.',
      analyzedAt: '2026-09-20T14:05:00Z'
    },
    recruiterNotes: 'Certified CKA and lives in Gazipur. Excellent operational fit.',
    timeline: [
      { status: 'applied', timestamp: '2026-09-20T14:00:00Z' },
      { status: 'under_review', timestamp: '2026-09-21T11:00:00Z' },
      { status: 'shortlisted', timestamp: '2026-09-22T09:00:00Z' },
      { status: 'interview', timestamp: '2026-09-22T17:30:00Z', note: 'Technical Infrastructure panel scheduled' }
    ]
  }
];

export const BANGLADESH_LOCATIONS = [
  'All Bangladesh',
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
  'Barishal',
  'Gazipur',
  'Narayanganj',
  'Remote'
];

export const POPULAR_CATEGORIES = [
  { name: 'Software & Technology', count: 142, icon: 'Laptop' },
  { name: 'FinTech & Banking', count: 88, icon: 'CreditCard' },
  { name: 'AI & Data Science', count: 54, icon: 'Brain' },
  { name: 'E-commerce & Logistics', count: 67, icon: 'Truck' },
  { name: 'Product & UI/UX Design', count: 41, icon: 'Palette' },
  { name: 'Electronics & Hardware', count: 32, icon: 'Cpu' },
  { name: 'DevOps & Cloud SRE', count: 48, icon: 'Cloud' },
  { name: 'NGO & Development', count: 29, icon: 'Globe' }
];

export const INITIAL_SAMPLE_INTERVIEWS: InterviewSchedule[] = [
  {
    id: 'int_demo_1',
    applicationId: 'app_sample_1',
    jobId: 'job_senior_react',
    jobTitle: 'Senior Frontend Engineer (React / TypeScript)',
    candidateId: 'demo_seeker_tanvir',
    candidateName: 'Tanvir Hossain',
    candidateEmail: 'tanvir.hossain@example.com',
    recruiterId: 'recruiter_bkash',
    companyName: 'bKash Limited',
    date: new Date().toISOString().split('T')[0], // Today
    time: '11:00',
    type: 'Online',
    meetingLinkOrLocation: 'https://meet.google.com/kormo-tanvir-bkash',
    notes: 'System architecture deep dive and React concurrency discussion',
    status: 'scheduled',
    createdAt: '2026-09-21T10:00:00Z'
  },
  {
    id: 'int_demo_2',
    applicationId: 'app_sample_2',
    jobId: 'job_python_fastapi',
    jobTitle: 'Lead Backend Engineer (Python / Go / Distributed Systems)',
    candidateId: 'demo_seeker_nabil',
    candidateName: 'Nabil Ahmed',
    candidateEmail: 'nabil.dev@example.com',
    recruiterId: 'recruiter_pathao',
    companyName: 'Pathao',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toISOString().split('T')[0];
    })(),
    time: '15:00',
    type: 'Online',
    meetingLinkOrLocation: 'https://meet.google.com/pathao-eng-interview',
    notes: 'Microservices scalability assessment and Kafka design challenge',
    status: 'scheduled',
    createdAt: '2026-09-21T11:00:00Z'
  },
  {
    id: 'int_demo_3',
    applicationId: 'app_sample_6',
    jobId: 'job_mobile_flutter',
    jobTitle: 'Senior Mobile Engineer (Flutter / Dart / iOS & Android)',
    candidateId: 'demo_seeker_tasnim',
    candidateName: 'Tasnim Ferdous',
    candidateEmail: 'tasnim.flutter@example.com',
    recruiterId: 'recruiter_sheba',
    companyName: 'Sheba Platform Limited',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      return d.toISOString().split('T')[0];
    })(),
    time: '14:30',
    type: 'Online',
    meetingLinkOrLocation: 'https://meet.google.com/sheba-flutter-lead',
    notes: 'Mobile architecture discussion, Bloc state handling & location battery optimization review',
    status: 'scheduled',
    createdAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'int_demo_4',
    applicationId: 'app_sample_7',
    jobId: 'job_ml_engineer',
    jobTitle: 'AI / Machine Learning Engineer (LLMs & Vision)',
    candidateId: 'demo_seeker_rafiq',
    candidateName: 'Rafiqul Islam',
    candidateEmail: 'rafiqul.ai@example.com',
    recruiterId: 'recruiter_brainstation',
    companyName: 'Brain Station 23',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    })(),
    time: '16:00',
    type: 'Online',
    meetingLinkOrLocation: 'https://meet.google.com/bs23-ai-coe-interview',
    notes: 'RAG system architecture, vector embeddings benchmarking and multilingual LLM fine-tuning',
    status: 'scheduled',
    createdAt: '2026-09-22T12:00:00Z'
  },
  {
    id: 'int_demo_5',
    applicationId: 'app_sample_10',
    jobId: 'job_devops_cloud',
    jobTitle: 'Cloud DevOps & Site Reliability Engineer',
    candidateId: 'demo_seeker_ariful',
    candidateName: 'Ariful Haque',
    candidateEmail: 'ariful.devops@example.com',
    recruiterId: 'recruiter_walton',
    companyName: 'Walton Hi-Tech Industries',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 4);
      return d.toISOString().split('T')[0];
    })(),
    time: '11:30',
    type: 'In-person',
    meetingLinkOrLocation: 'Walton Hi-Tech Complex, Conference Room 4B, Chandra, Gazipur',
    notes: 'Kubernetes cluster resilience and IoT MQTT broker architecture evaluation',
    status: 'scheduled',
    createdAt: '2026-09-23T09:00:00Z'
  },
  {
    id: 'int_demo_6',
    applicationId: 'app_sample_5',
    jobId: 'job_fullstack_nextjs',
    jobTitle: 'Full-Stack Software Engineer (Next.js 15, Node.js & Microservices)',
    candidateId: 'demo_seeker_mahmudul',
    candidateName: 'Mahmudul Hasan',
    candidateEmail: 'mahmudul.hasan@example.com',
    recruiterId: 'recruiter_shopup',
    companyName: 'ShopUp',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toISOString().split('T')[0];
    })(),
    time: '10:00',
    type: 'Online',
    meetingLinkOrLocation: 'https://meet.google.com/shopup-eng-hiring',
    notes: 'Next.js 15 App router code review and high-throughput seller database indexing',
    status: 'scheduled',
    createdAt: '2026-09-23T11:00:00Z'
  }
];

