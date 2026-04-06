const pdf = require('pdf-parse');
const fs = require('fs');
const { parseVoterList } = require('./utils/parser');

const p = 'c:/Users/ASUS/OneDrive/Documents/GitHub/ScanForge/demo_pdf/750366_com_929_male.pdf';
pdf(fs.readFileSync(p)).then(d => {
  const voters = parseVoterList(d.text);
  
  console.log('--- Checking spelling ---');
  voters.slice(0, 15).forEach(v => {
    console.log(`Name: ${v.name.padEnd(20)} | Father: ${v.father_name.padEnd(20)} | Mother: ${v.mother_name}`);
  });
}).catch(e => console.error(e.message));
