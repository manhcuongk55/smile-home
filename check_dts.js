const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'node_modules', '.prisma', 'client');
const dts = path.join(clientDir, 'index.d.ts');

if (fs.existsSync(dts)) {
    const content = fs.readFileSync(dts, 'utf8');
    if (content.includes('contractCode')) {
        console.log('SUCCESS: contractCode found in index.d.ts');
    } else {
        console.log('FAILURE: contractCode NOT found in index.d.ts');
    }
} else {
    console.log(`ERROR: ${dts} not found`);
}
