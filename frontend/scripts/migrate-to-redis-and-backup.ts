import { createClient } from 'redis';
import { rolesData } from '../src/data/rolesData';
import { functionsData } from '../src/data/functionsData';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const KEY_PREFIX = 'fas';
const BACKUP_DIR = join(__dirname, '../../backend/data');

if (!REDIS_HOST || !REDIS_PASSWORD) {
  console.error('❌ REDIS_HOST and REDIS_PASSWORD environment variables must be set');
  process.exit(1);
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-');
}

interface RedisDocument {
  type: string;
  [key: string]: any;
}

async function migrateData() {
  console.log('🚀 Starting Redis migration with backup to local JSON files...\n');

  try {
    mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`✅ Backup directory ready: ${BACKUP_DIR}\n`);
  } catch (error: any) {
    console.error(`❌ Failed to create backup directory: ${error.message}`);
    process.exit(1);
  }

  const client = createClient({
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
      tls: true,
    },
    username: 'default',
    password: REDIS_PASSWORD,
  });

  client.on('error', (err) => console.error('Redis Client Error', err));

  await client.connect();
  console.log('✅ Connected to Redis\n');

  const documents: Array<[string, RedisDocument]> = [];
  const categoriesBackup: { role: Record<string, any>; industry: Record<string, any> } = {
    role: {},
    industry: {},
  };

  console.log('📋 Preparing role documents...');
  for (const [roleKey, roleValue] of Object.entries(rolesData)) {
    const slug = slugify(roleKey);
    const key = `${KEY_PREFIX}:role:${slug}`;
    const doc: RedisDocument = {
      type: 'role',
      slug,
      name: roleValue.name,
      personas: roleValue.personas,
      priorities: roleValue.priorities,
      useCases: roleValue.useCases,
    };
    documents.push([key, doc]);
    categoriesBackup.role[slug] = doc;
    console.log(`  ✓ Prepared: ${key}`);
  }

  console.log('\n📋 Preparing industry documents...');
  for (const [industryKey, industryValue] of Object.entries(functionsData)) {
    const slug = slugify(industryKey);
    const key = `${KEY_PREFIX}:industry:${slug}`;
    const doc: RedisDocument = {
      type: 'industry',
      slug,
      name: industryValue.name,
      personas: industryValue.personas,
      priorities: industryValue.priorities,
      useCases: industryValue.useCases,
    };
    documents.push([key, doc]);
    categoriesBackup.industry[slug] = doc;
    console.log(`  ✓ Prepared: ${key}`);
  }

  console.log('\n📋 Preparing catalog index...');
  const catalogDoc: RedisDocument = {
    type: 'catalog',
    roles: Object.keys(rolesData).map((key) => ({
      slug: slugify(key),
      name: key,
    })),
    industries: Object.keys(functionsData).map((key) => ({
      slug: slugify(key),
      name: key,
    })),
  };
  documents.push([`${KEY_PREFIX}:catalog`, catalogDoc]);
  console.log(`  ✓ Prepared: ${KEY_PREFIX}:catalog`);

  console.log('\n📋 Preparing solutions document...');
  const solutionsDoc: RedisDocument = {
    type: 'solutions',
    solutions: [
      {
        id: 'engage',
        title: 'Engage',
        description: 'Talk to our avatar agent – ask about products, pricing, or roadmaps. Get instant voice + on‑screen answers.',
        category: 'Live',
        enabled: true,
      },
      {
        id: 'explore',
        title: 'Explore',
        description: 'Navigate by industry, use case, or stack. Compare reference architectures and live demos.',
        category: 'Catalog',
        enabled: false,
      },
      {
        id: 'envision',
        title: 'Envision',
        description: 'Immerse in the Zava brand narrative – motion, sound, and storyboards that paint the frontier.',
        category: 'Story',
        enabled: false,
      },
    ],
  };
  documents.push([`${KEY_PREFIX}:solutions`, solutionsDoc]);
  console.log(`  ✓ Prepared: ${KEY_PREFIX}:solutions`);

  console.log('\n📋 Preparing inspire settings...');
  const inspireDoc: RedisDocument = {
    type: 'settings',
    inspireInterests: [
      'Sora 2 Video Generation',
      'VLA Model Training',
      'Manufacturing Solutions',
      'Custom AI Solutions',
      'Azure AI Foundry',
      'Other Zava Capabilities',
    ],
  };
  documents.push([`${KEY_PREFIX}:settings:inspire`, inspireDoc]);

  console.log('📋 Preparing avatar settings...');
  const avatarDoc: RedisDocument = {
    type: 'settings',
    avatarCharacter: 'lisa',
    avatarStyle: 'casual-sitting',
    voiceName: 'en-US-Ava:DragonHDLatestNeural',
    voiceType: 'azure-standard',
  };
  documents.push([`${KEY_PREFIX}:settings:avatar`, avatarDoc]);

  const settingsBackup = {
    inspire: inspireDoc,
    avatar: avatarDoc,
  };
  console.log(`  ✓ Prepared settings documents`);

  console.log('\n📋 Preparing executive narrative content...');
  const narrativeDoc: RedisDocument = {
    type: 'content',
    title: 'Becoming Frontier Success Framework',
    context: `Becoming Frontier Success Framework:

Key Statistics:
- Boost developer efficiency by 30%
- Increase employee productivity by 30%
- Streamline customer support by 40%
- Reduce costs by 40%
- Improve go-to-market speed by 50%

Core Principle: AI-first organizations think in orders of magnitude, not incremental improvements.

Four Pillars:

1. Enrich Employee Experiences
   - Tools: Microsoft 365 Copilot, Copilot Studio, Security Copilot
   - Benefits: 20% reduction in response times, 25-40% reduced helpdesk demand, 840 hours saved
   - Focus: Empower teams with AI copilots and agents to boost productivity

2. Reinvent Customer Engagement
   - Tools: Azure AI Foundry, GitHub Copilot, Copilot for Service
   - Benefits: 55% reduction in wait times, 5x increase in email clickthrough, 66% reduction in support traffic
   - Focus: Transform customer interactions with personalized AI experiences

3. Reshape Business Processes
   - Tools: Copilot Studio, GitHub Copilot, Power Platform
   - Benefits: 30,000 hours saved monthly, 93% reduction in handling time, 50% increase in automatic payments
   - Focus: Automate workflows and streamline operations with intelligent agents

4. Bend the Curve on Innovation
   - Tools: Azure AI Foundry, Azure Quantum, Microsoft Fabric
   - Benefits: 50% reduction in app build time, 80% faster programming, accelerated discovery (years to 80 hours)
   - Focus: Accelerate R&D and experimentation with AI-powered tools`,
    urls: [
      'https://www.microsoft.com/en-us/microsoft-cloud/blog/2025/09/29/frontier-firms-in-action-lessons-from-the-ai-adoption-surge/',
      'https://azure.microsoft.com/en-us/blog/building-the-frontier-firm-with-microsoft-azure-the-business-case-for-cloud-and-ai-modernization/',
      'https://www.microsoft.com/en-us/worklab/work-trend-index/2025-the-year-the-frontier-firm-is-born',
    ],
  };
  documents.push([`${KEY_PREFIX}:content:exec_narr`, narrativeDoc]);

  const contentBackup = {
    exec_narr: narrativeDoc,
  };
  console.log(`  ✓ Prepared: ${KEY_PREFIX}:content:exec_narr`);

  console.log(`\n💾 Writing backup files to ${BACKUP_DIR}...\n`);
  
  try {
    writeFileSync(
      join(BACKUP_DIR, 'catalog.json'),
      JSON.stringify(catalogDoc, null, 2),
      'utf-8'
    );
    console.log('  ✅ Wrote: catalog.json');

    writeFileSync(
      join(BACKUP_DIR, 'solutions.json'),
      JSON.stringify(solutionsDoc, null, 2),
      'utf-8'
    );
    console.log('  ✅ Wrote: solutions.json');

    writeFileSync(
      join(BACKUP_DIR, 'settings.json'),
      JSON.stringify(settingsBackup, null, 2),
      'utf-8'
    );
    console.log('  ✅ Wrote: settings.json');

    writeFileSync(
      join(BACKUP_DIR, 'content.json'),
      JSON.stringify(contentBackup, null, 2),
      'utf-8'
    );
    console.log('  ✅ Wrote: content.json');

    writeFileSync(
      join(BACKUP_DIR, 'categories.json'),
      JSON.stringify(categoriesBackup, null, 2),
      'utf-8'
    );
    console.log('  ✅ Wrote: categories.json');

    console.log('\n✨ All backup files written successfully!');
  } catch (error: any) {
    console.error(`\n❌ Failed to write backup files: ${error.message}`);
    process.exit(1);
  }

  console.log(`\n📤 Uploading ${documents.length} documents to Redis...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const [key, doc] of documents) {
    try {
      await client.sendCommand(['JSON.SET', key, '$', JSON.stringify(doc)]);
      console.log(`  ✅ Uploaded: ${key}`);
      successCount++;
    } catch (error: any) {
      console.error(`  ❌ Failed to upload ${key}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✨ Migration complete!`);
  console.log(`   Redis uploads: ${successCount} success, ${errorCount} errors`);
  console.log(`   Backup files: 5 files written to ${BACKUP_DIR}`);

  console.log(`\n🔍 Verifying migration...`);
  const testKeys = [
    `${KEY_PREFIX}:catalog`,
    `${KEY_PREFIX}:solutions`,
    `${KEY_PREFIX}:role:legal`,
    `${KEY_PREFIX}:industry:healthcare`,
  ];

  for (const key of testKeys) {
    try {
      const result = await client.sendCommand(['JSON.GET', key, '$']);
      if (result) {
        const data = JSON.parse(result as string);
        console.log(`  ✅ Verified: ${key} (${data[0]?.type || 'unknown type'})`);
      } else {
        console.log(`  ⚠️  Key exists but no data: ${key}`);
      }
    } catch (error: any) {
      console.error(`  ❌ Failed to verify ${key}:`, error.message);
    }
  }

  await client.disconnect();
  console.log('\n👋 Disconnected from Redis');

  if (errorCount > 0) {
    console.warn('\n⚠️  Some Redis uploads failed, but backup files were written successfully');
  }
}

migrateData().catch((error) => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
