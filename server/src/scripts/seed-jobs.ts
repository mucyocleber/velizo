import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function seedJobs() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not defined.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('⏳ Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully.');

    // 1. Fetch a valid employer or fallback to any profile
    console.log('🔍 Fetching an employer profile from database...');
    const profileRes = await client.query(`
      SELECT id, role, email FROM public.profiles 
      ORDER BY CASE WHEN role = 'employer' THEN 0 WHEN role = 'admin' THEN 1 ELSE 2 END ASC 
      LIMIT 1
    `);

    if (profileRes.rows.length === 0) {
      console.warn('⚠️ No profiles found in the database. Please register a user first!');
      return;
    }

    const publisher = profileRes.rows[0];
    console.log(`👤 Found publisher profile: ID=${publisher.id}, Role=${publisher.role}, Email=${publisher.email}`);

    // Ensure they have a company profile if they are an employer
    if (publisher.role === 'employer') {
      const companyRes = await client.query(`
        SELECT id FROM public.company_profiles WHERE employer_id = $1
      `, [publisher.id]);

      if (companyRes.rows.length === 0) {
        console.log('🏢 Creating a sample company profile for the employer...');
        await client.query(`
          INSERT INTO public.company_profiles (employer_id, company_name, country, website, industry, company_size)
          VALUES ($1, 'GlobalTech Solutions Ltd.', 'Germany', 'https://globaltech.example.com', 'Technology', '100-500 employees')
        `, [publisher.id]);
      }
    }

    // 2. Clear old jobs to avoid duplicate clutter
    console.log('🧹 Clearing existing sample jobs...');
    await client.query(`DELETE FROM public.jobs`);

    // 3. Define professional international sample jobs
    const sampleJobs = [
      {
        employer_id: publisher.id,
        title: 'Senior Full-Stack Engineer (React & Node.js)',
        category: 'Technology',
        employment_type: 'full-time',
        experience_level: 'senior',
        salary_min: 90000,
        salary_max: 120000,
        currency: 'EUR',
        country: 'Germany',
        city: 'Berlin',
        remote_type: 'hybrid',
        description: 'GlobalTech Solutions is seeking a Senior Full-Stack Developer to design and architect core features for our cloud application. You will collaborate with cross-functional teams in Berlin to deliver high-quality, scalable user experiences.',
        requirements: [
          '5+ years of experience with React, Node.js, and TypeScript',
          'Strong understanding of relational databases (PostgreSQL/MySQL)',
          'Experience building and documenting RESTful APIs',
          'Fluency in English; German language skills are a plus'
        ],
        benefits: [
          'Relocation assistance including flights and visa support',
          'Competitive salary and equity opportunities',
          'Learning & development budget (€2,000/year)',
          'Public transport ticket subscription'
        ],
        visa_sponsorship: true,
        relocation_support: true,
        skills_required: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        external_apply_url: null,
        status: 'published'
      },
      {
        employer_id: publisher.id,
        title: 'Lead Machine Learning & GenAI Engineer',
        category: 'Technology',
        employment_type: 'full-time',
        experience_level: 'lead',
        salary_min: 130000,
        salary_max: 165000,
        currency: 'USD',
        country: 'Canada',
        city: 'Toronto',
        remote_type: 'remote',
        description: 'Shape the future of machine learning at our fast-growing startup. As Lead ML Engineer, you will build and fine-tune Generative AI pipelines, integrate Large Language Models (LLMs), and deploy high-throughput inference endpoints.',
        requirements: [
          'M.Sc. or Ph.D. in Computer Science or related quantitative field',
          'Expertise with Python, PyTorch, and HuggingFace transformers',
          'Experience training and deployment of large language models',
          'Strong background in vector databases and semantic search'
        ],
        benefits: [
          '100% remote work flexibility within Canada/USA',
          'Generous health, dental, and vision insurance',
          'Latest MacBook Pro and home office setup stipend',
          'Unlimited paid time off (PTO)'
        ],
        visa_sponsorship: true,
        relocation_support: false,
        skills_required: ['Python', 'PyTorch', 'Machine Learning', 'AI', 'Transformers'],
        external_apply_url: 'https://careers.globaltech.example.com/jobs/ml-lead',
        status: 'published'
      },
      {
        employer_id: publisher.id,
        title: 'Senior Product Designer (UI/UX)',
        category: 'Design',
        employment_type: 'full-time',
        experience_level: 'senior',
        salary_min: 75000,
        salary_max: 95000,
        currency: 'GBP',
        country: 'United Kingdom',
        city: 'London',
        remote_type: 'hybrid',
        description: 'We are looking for a Senior Product Designer to spearhead the product layout design. You will turn user insights into beautiful interface flows, craft rich interactive designs, and align layout structures with our design system guidelines.',
        requirements: [
          '4+ years of professional product design experience with a strong portfolio',
          'Mastery of Figma, component libraries, and interactive prototyping',
          'Experience conducting user interviews and usability test sessions',
          'High attention to visual details and typographic hierarchy'
        ],
        benefits: [
          'Relocation support package to London',
          'Flexible working hours and hybrid arrangement (2 days in office)',
          'Private health insurance coverage',
          'Annual company wellness retreat'
        ],
        visa_sponsorship: false,
        relocation_support: true,
        skills_required: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping'],
        external_apply_url: null,
        status: 'published'
      },
      {
        employer_id: publisher.id,
        title: 'Registered Nurse (ICU Specialist)',
        category: 'Healthcare',
        employment_type: 'full-time',
        experience_level: 'mid',
        salary_min: 38000,
        salary_max: 46000,
        currency: 'GBP',
        country: 'United Kingdom',
        city: 'Birmingham',
        remote_type: 'on-site',
        description: 'A leading UK NHS Trust hospital is seeking qualified ICU Registered Nurses. You will provide critical nursing care to patients in ICU, manage life-support systems, and support patient families with professionalism and care.',
        requirements: [
          'Bachelor\'s Degree in Nursing and valid registry registration',
          'At least 2 years of clinical experience in an ICU/Critical Care unit',
          'Excellent critical thinking and communication skills',
          'Successful completion of English proficiency test (IELTS/OET) or equivalent'
        ],
        benefits: [
          'Full visa sponsorship for the UK (Health and Care Worker Visa)',
          'Relocation allowance including flight to the UK and 1 month accommodation',
          'NHS Pension Scheme contribution',
          'Structured career progression pathways'
        ],
        visa_sponsorship: true,
        relocation_support: true,
        skills_required: ['Nursing', 'ICU', 'Patient Care', 'Clinical Healthcare'],
        external_apply_url: null,
        status: 'published'
      }
    ];

    console.log('⚙️ Inserting new professional sample jobs...');
    for (const job of sampleJobs) {
      await client.query(`
        INSERT INTO public.jobs (
          employer_id, title, category, employment_type, experience_level,
          salary_min, salary_max, currency, country, city, remote_type,
          description, requirements, benefits, visa_sponsorship,
          relocation_support, skills_required, external_apply_url, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      `, [
        job.employer_id, job.title, job.category, job.employment_type, job.experience_level,
        job.salary_min, job.salary_max, job.currency, job.country, job.city, job.remote_type,
        job.description, job.requirements, job.benefits, job.visa_sponsorship,
        job.relocation_support, job.skills_required, job.external_apply_url, job.status
      ]);
      console.log(`🚀 Seeded job: "${job.title}"`);
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await client.end();
    console.log('🔌 Connection closed.');
  }
}

seedJobs();
