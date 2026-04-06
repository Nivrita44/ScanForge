/**
 * Core parsing utilities for Bangla Voter Lists and NID extraction.
 * Tuned based on real PDF structure from 750366_com_929_male.pdf
 *
 * PDF Structure per entry:
 * ০০১.  নাম: <name>
 * োভাটার নং: <voter_id>          ← "ভোটার নং" appears garbled as "োভাটার নং"
 * িপতা: <father_name>            ← "পিতা" appears as "িপতা"
 * মাতা: <mother_name>
 * োপশা: <occupation>,জন তািরখ:<DD/MM/YYYY>   ← DOB embedded in this line
 * িঠকানা: <address line 1>       ← "ঠিকানা" appears as "িঠকানা"
 * [optional continuation line for address]
 */

// ─── Bangla digit normalizer ───────────────────────────────────────────────
const toBanglaDigitsToEnglish = (str) => {
  const map = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
  return str.replace(/[০-৯]/g, c => map[c]);
};

// ─── Bangla vowel-sign normalizer ─────────────────────────────────────────
// Older Bangla PDFs store glyphs in VISUAL order, so vowel signs like ি (U+09BF)
// and ে (U+09C7) appear BEFORE their base consonant in the extracted text.
// Unicode requires them AFTER the consonant. This function corrects that.
const CONS = '[\u0995-\u09B9\u09CE\u09DC-\u09DF]';
const normalizeBangla = (str) => {
  if (!str) return str;
  let t = str;
  
  // 1. Initial fix for false o-kar (visual e-kar encoded as o-kar)
  // Revert false 'ো' back to 'ে' only when it precedes a consonant (visual order).
  t = t.replace(new RegExp(`\u09CB(${CONS})`, 'g'), '\u09C7$1');

  // 2. Surgical Reph Fixes (Only where safe and confirmed)
  // PDF-parse extracts "Sarkar/Swarnakar" (সর্ণকার) as (স ণ র কা র). we map ণর -> র্ণ.
  t = t.replace(/\u09A3\u09B0/g, '\u09B0\u09CD\u09A3');

  // 3. Conjunct Restoration (Restore missing components in common clusters)
  // - Ganj fix: গঞ -> গঞ্জ
  t = t.replace(/\u0997\u099E/g, '\u0997\u099E\u09CD\u099C');
  // - Panchayet fix: পঞ -> পঞ্চ
  t = t.replace(/\u09AA\u099E/g, '\u09AA\u099E\u09CD\u099a');
  // - Master fix: মাষার/মাষাব -> মাস্টার/মাষ্টার (Specific mapping error in this PDF's font)
  // Note: Handling both 'মাষার' and 'মাষাব' or general 'ষ' context for Master
  t = t.replace(/\u09AE\u09be\u09B7/g, '\u09AE\u09be\u09B8\u09CD\u099F');
  // - Akhtar fix: আকার -> আক্তার (Common name ending)
  t = t.replace(/\u0986\u0995\u09be\u09B0/g, '\u0986\u0995\u09CD\u09A4\u09be\u09B0');
  
  // - Double consonant restoration: nn -> n-hasanta-n, ll -> l-hasanta-l
  t = t.replace(/\u09A8\u09A8/g, '\u09A8\u09CD\u09A8');
  t = t.replace(/\u09B2\u09B2/g, '\u09B2\u09CD\u09B2');
  t = t.replace(/\u09AE\u09AE/g, '\u09AE\u09CD\u09AE');
  // - Ya-phala fix: consonant + ya -> consonant + hasanta + ya (e.g. লয -> ল্য, বয -> ব্যক্ত)
  t = t.replace(new RegExp(`(${CONS})\u09AF`, 'g'), '$1\u09CD\u09AF');
  // - Ba-phala/conjuncts with 'ব': consonant + ba -> consonant + hasanta + ba (e.g. স্ব, দ্ব)
  t = t.replace(new RegExp(`([\u09B6\u09B8\u09A6\u09A8])\u09AC`, 'g'), '$1\u09CD\u09AC');

  // 4. Vowel shifting (Logical order: consonant + vowel)
  // Shift pre-base markers (ি, ে, ৈ) after their respective consonants.
  // েকা → কো (e + cons + aa -> cons + o)
  t = t.replace(new RegExp(`\u09C7(${CONS})\u09BE`, 'g'), '$1\u09CB');
  // েক → কে
  t = t.replace(new RegExp(`\u09C7(${CONS})`, 'g'), '$1\u09C7');
  // ৈক → কৈ
  t = t.replace(new RegExp(`\u09C8(${CONS})`, 'g'), '$1\u09C8');
  // িক → কি
  t = t.replace(new RegExp(`\u09BF(${CONS})`, 'g'), '$1\u09BF');
  
  return t;
};

// ─── Helper: extract first capture group from regex ───────────────────────
const matchField = (text, regex) => {
  const m = text.match(regex);
  return m ? normalizeBangla(m[1].trim()) : '';
};

/**
 * FEATURE 1: VOTER LIST PARSER
 * Splits the raw extracted text into per-voter blocks and extracts fields.
 */
exports.parseVoterList = (rawText) => {
  // Normalize Bangla digits → English digits throughout
  const text = toBanglaDigitsToEnglish(rawText);

  // ── Segment into blocks keyed on serial numbers ────────────────────────
  // Pattern: digit(s) + dot + two or more spaces  (e.g. "001.  " or "018.  ")
  // Use a multiline split approach
  const blockPattern = /(?:^|\n)(\d{1,4})\.\s{2,}/gm;

  const blocks = [];
  let m;
  let lastIdx = null;
  let lastSerial = null;

  while ((m = blockPattern.exec(text)) !== null) {
    if (lastSerial !== null) {
      blocks.push({ serial: lastSerial, body: text.substring(lastIdx, m.index) });
    }
    lastSerial = m[1];
    lastIdx    = blockPattern.lastIndex;
  }
  if (lastSerial !== null) {
    blocks.push({ serial: lastSerial, body: text.substring(lastIdx) });
  }

  // ── Parse each block ────────────────────────────────────────────────────
  const results = [];

  for (const { serial, body } of blocks) {
    // Skip cancelled / migrated entries
    if (/কতরন করা হেয়েছ|মাইগ্রেট হয়েছে/.test(body)) continue;

    // ── name ──────────────────────────────────────────────────────────────
    // Appears right at start of block: "নাম: <value>\n"
    const name = matchField(body, /নাম:\s*([^\n]+)/);

    // ── voter_id ──────────────────────────────────────────────────────────
    // "োভাটার নং: <digits>" — the leading "ো" is a garbled vowel-sign prefix
    const voter_id = matchField(body, /(?:ো)?ভাটার নং:\s*([0-9]+)/);

    // ── father_name ───────────────────────────────────────────────────────
    // Appears as "িপতা:" (vowel-sign prefix "ি" before "পিতা")
    const father_name = matchField(body, /িপতা:\s*([^\n]+)/);

    // ── mother_name ───────────────────────────────────────────────────────
    const mother_name = matchField(body, /মাতা:\s*([^\n]+)/);

    // ── date_of_birth ─────────────────────────────────────────────────────
    // Embedded in the occupation line after a comma: ",জন তারিখ:DD/MM/YYYY"
    // The keyword "জন্ম তারিখ" is garbled by pdf-parse into "জন তারিখ" 
    // Use a flexible pattern: after comma+জন+space, grab date digits
    const dob_raw = matchField(body, /,জন\s+[^:,\n]+:([0-9]{2}\/[0-9]{2}\/[0-9]{4})/)
                 || matchField(body, /জন\s+[^:,\n]+:([0-9]{2}\/[0-9]{2}\/[0-9]{4})/);
    const date_of_birth = dob_raw;

    // ── address ───────────────────────────────────────────────────────────
    // Appears as "িঠকানা:" — may span multiple lines until next entry or end
    // We grab everything after "িঠকানা:" and collapse whitespace
    const addr_match = body.match(/িঠকানা:\s*([\s\S]+?)(?:\n\s*\n|$)/);
    const address = addr_match
      ? normalizeBangla(addr_match[1].replace(/\s+/g, ' ').trim())
      : '';

    results.push({
      serial_number: serial.padStart(3, '0'),
      name:          name        || '',
      voter_id:      voter_id    || '',
      father_name:   father_name || '',
      mother_name:   mother_name || '',
      date_of_birth: date_of_birth || '',
      address:       address     || ''
    });
  }

  return results;
};


/**
 * FEATURE 2: NID CARD PARSER
 */
exports.parseNidBlock = (rawText) => {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  const data = { 
    name: '', 
    name_bn: '', 
    father_name: '', 
    mother_name: '', 
    date_of_birth: '', 
    nid_number: '',
    address: '',
    blood_group: '',
    place_of_birth: ''
  };

  // NID Number — 10, 13 or 17 consecutive digits
  const nidMatch = rawText.match(/\b(\d{10}|\d{13}|\d{17})\b/);
  if (nidMatch) data.nid_number = nidMatch[1];
  else {
    const idLine = lines.find(l => /ID\s*NO|আইডি\s*নং/i.test(l));
    if (idLine) {
      const dig = idLine.match(/(\d+)/);
      if (dig) data.nid_number = dig[1];
    }
  }

  // DOB
  const dobLine = lines.find(l => /Date\s+of\s+Birth/i.test(l) || /DOB/i.test(l) || /জন্ম\s+তারিখ/i.test(l));
  if (dobLine) {
    const parts = dobLine.split(/[:\s]+/);
    const dateMatch = dobLine.match(/(\d{2}\s+[A-Za-z]{3}\s+\d{4})|(\d{2}[\s\/\-]\d{2}[\s\/\-]\d{4})/);
    if (dateMatch) data.date_of_birth = dateMatch[0];
    else {
      data.date_of_birth = parts.slice(-3).join(' ').trim();
    }
  }

  // English Name
  const nameLineIdx = lines.findIndex(l => /^Name\s*:/i.test(l));
  if (nameLineIdx !== -1) {
    data.name = lines[nameLineIdx].split(':').slice(1).join(':').trim();
  } else {
    // Look for all-caps line that doesn't contain noise keywords
    const allCaps = lines.find(l => /^[A-Z][A-Z\s\.]{2,}$/.test(l)
      && !/(REPUBLIC|BANGLADESH|BLOOD|COMMISSION|ELECTORAL|OFFICER|DIRECTOR|ADDRESS)/i.test(l));
    if (allCaps) data.name = allCaps;
  }

  // Bangla Name
  const banglaLines = lines.filter(l => /[\u0980-\u09FF]/.test(l));
  const bnNameLine = banglaLines.find(l => l.includes('নাম:'));
  if (bnNameLine) {
    data.name_bn = bnNameLine.split('নাম:')[1].trim();
  }

  // Father's Name
  const fatherLine = banglaLines.find(l => /পিতা[:ঃ]?/.test(l)) || lines.find(l => /Father['\s]+Name/i.test(l));
  if (fatherLine) {
    data.father_name = fatherLine.split(/[:ঃ]/).slice(1).join(':').trim();
  }

  // Mother's Name
  const motherLine = banglaLines.find(l => /মাতা[:ঃ]?/.test(l)) || lines.find(l => /Mother['\s]+Name/i.test(l));
  if (motherLine) {
    data.mother_name = motherLine.split(/[:ঃ]/).slice(1).join(':').trim();
  }

  // Address (usually on the back)
  const addressIdx = lines.findIndex(l => /ঠিকানা[:ঃ]?/i.test(l) || /Address/i.test(l));
  if (addressIdx !== -1) {
    // Address often spans multiple lines
    let addr = lines[addressIdx].split(/[:ঃ]/).slice(1).join(':').trim();
    for (let i = addressIdx + 1; i < lines.length && i < addressIdx + 4; i++) {
      if (/[\u0980-\u09FF]/.test(lines[i]) && !/রক্তের|জন্মস্থান|প্রদান/.test(lines[i])) {
        addr += ' ' + lines[i];
      } else break;
    }
    data.address = addr.trim();
  }

  // Extra Details
  // Blood Group: Handle both labeled "Blood Group: O+" and standalone "O+"
  const bloodTypeMatch = rawText.match(/\b(A|B|AB|O)[\s]*([\+\-])\b/i);
  if (bloodTypeMatch) {
    data.blood_group = (bloodTypeMatch[1] + bloodTypeMatch[2]).toUpperCase();
  } else {
    const bloodLine = lines.find(l => /রক্তের\s+গ্রুপ|Blood\s+Group/i.test(l));
    if (bloodLine) {
      let val = bloodLine.split(/[:ঃ]/).slice(1).join(':').trim();
      // Surgically remove anything after the blood type or before other labels
      val = val.split(/জন্মস্থান|Place\s+of\s+Birth/i)[0].trim();
      // Further filter to just the blood type if possible
      const m = val.match(/([ABO]{1,2}[\+\-])/i);
      data.blood_group = m ? m[1].toUpperCase() : val;
    }
  }

  // Place of Birth: Handle "জন্মস্থান: ঢাকা মুদ্রণ: ০১"
  const pobLine = lines.find(l => /জন্মস্থান|Place\s+of\s+Birth/i.test(l));
  if (pobLine) {
    let val = pobLine.split(/[:ঃ]/).slice(1).join(':').trim();
    // Remove trailing 'Print' (মুদ্রণ) info if present
    val = val.split(/মুদ্রণ|Print/i)[0].trim();
    data.place_of_birth = val;
  }

  return data;
};
