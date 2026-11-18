const fs = require('fs');
const path = require('path');

const odev2Path = path.resolve(__dirname, '..', 'public', 'NicheCraftStudio_Odev_2_Teslim_Raporu.pdf');
const odev3Path = path.resolve(__dirname, '..', 'public', 'NicheCraftStudio_Odev_3_Guncel_Teslim_Raporu.pdf');
const odev4Path = path.resolve(__dirname, '..', 'public', 'NicheCraftStudio_Odev_4_Bitirme_Projesi_Karti.pdf');

const odev2Base64 = fs.existsSync(odev2Path) ? fs.readFileSync(odev2Path).toString('base64') : '';
const odev3Base64 = fs.existsSync(odev3Path) ? fs.readFileSync(odev3Path).toString('base64') : '';
const odev4Base64 = fs.existsSync(odev4Path) ? fs.readFileSync(odev4Path).toString('base64') : '';

const tsContent = `// Pre-rendered In-Memory Base64 PDF Documents for Niche Craft Studio Homework Submissions
// Guaranteed 100% offline & client-side download capability without SPA router or server redirect issues

export const ODEV_2_PDF_BASE64 = "${odev2Base64}";

export const ODEV_3_PDF_BASE64 = "${odev3Base64}";

export const ODEV_4_PDF_BASE64 = "${odev4Base64}";
`;

const targetTs = path.resolve(__dirname, '..', 'src', 'data', 'embeddedHomeworkPdfs.ts');
fs.writeFileSync(targetTs, tsContent, 'utf-8');
console.log('Successfully updated embeddedHomeworkPdfs.ts with Ödev 2, Ödev 3 and Ödev 4 PDFs.');
