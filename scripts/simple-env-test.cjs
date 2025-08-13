const fs = require('fs');
const path = require('path');

console.log('--- Verbose Env Test ---');

const envPath = path.resolve(__dirname, '../.env');
console.log(`Attempting to read .env file at: ${envPath}`);

if (fs.existsSync(envPath)) {
  console.log('.env file found. Reading content...');
  const envConfig = fs.readFileSync(envPath, 'utf8');
  console.log('--- .env content START ---');
  console.log(envConfig);
  console.log('--- .env content END ---');

  console.log('\nParsing lines...');
  envConfig.split(/\r?\n/).forEach((line, index) => {
    console.log(`\n[Line ${index + 1}]: "${line}"`);

    if (line.trim() && !line.trim().startsWith('#')) {
      const i = line.indexOf('=');
      if (i !== -1) {
        const key = line.slice(0, i).trim();
        const value = line.slice(i + 1).trim();
        console.log(` -> Parsed: key="${key}", value="${value ? '******' : 'EMPTY'}"`);
        if (key) {
          process.env[key] = value;
          console.log(` -> Assigned to process.env.${key}`);
        }
      } else {
        console.log(' -> No "=" found, skipping.');
      }
    } else {
      console.log(' -> Comment or empty line, skipping.');
    }
  });

} else {
  console.log('.env file NOT found.');
}


console.log('\n--- Final process.env Check ---');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('Service Key Loaded:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Yes' : 'No');
console.log('-----------------------------');
