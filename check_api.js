const fetch = require('node-fetch');

async function main() {
    try {
        const res = await fetch('http://localhost:3000/api/contracts');
        if (!res.ok) {
            console.log(`Error: ${res.status}`);
            return;
        }
        const data = await res.json();
        const first = data[0];
        console.log(`ID: ${first.id.substring(0,8)}, Code: ${first.contractCode}`);
    } catch (e) {
        console.error(e.message);
    }
}

main();
