const pdf = require('pdf-parse');
const fs = require('fs');
const { parseVoterList } = require('./utils/parser');

const p = 'c:/Users/ASUS/OneDrive/Documents/GitHub/ScanForge/demo_pdf/750366_com_929_male.pdf';
pdf(fs.readFileSync(p)).then(d => {
  const voters = parseVoterList(d.text);
  console.log('Total records parsed: ' + voters.length);
  console.log('Entries WITH date_of_birth: ' + voters.filter(v => v.date_of_birth).length);

  const v1 = voters[0];
  console.log('\nEntry 001:');
  console.log('  name:          ', v1.name);
  console.log('  voter_id:      ', v1.voter_id);
  console.log('  father_name:   ', v1.father_name);
  console.log('  mother_name:   ', v1.mother_name);
  console.log('  date_of_birth: ', v1.date_of_birth);
  console.log('  address:       ', v1.address);
}).catch(e => console.error(e.message));
