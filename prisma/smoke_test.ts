
async function runTests() {
    const baseUrl = 'http://localhost:3000';
    console.log('🚀 Starting Automated Smoke Test...');

    try {
        // Test 1: Invoices API
        console.log('\n🧪 Test 1: Verifying /api/invoices structure...');
        const invRes = await fetch(`${baseUrl}/api/invoices`);
        if (!invRes.ok) throw new Error(`Invoices API failed: ${invRes.status}`);

        const invoices = await invRes.json();
        console.log(`✅ Fetched ${invoices.length} invoices.`);

        // Check for building and room data
        const sample = invoices[0];
        if (sample && sample.contract) {
            if (!sample.contract.room) {
                console.error('❌ Error: Room data missing in contract!');
            } else {
                console.log(`✅ Room found: ${sample.contract.room.number}`);
                if (!sample.contract.room.building) {
                    console.error('❌ Error: Building data missing in room! This was the cause of the TypeError.');
                } else {
                    console.log(`✅ Building found: ${sample.contract.room.building.name}`);
                }
            }
        }

        // Test 2: Persons API
        console.log('\n🧪 Test 2: Verifying /api/persons...');
        const perRes = await fetch(`${baseUrl}/api/persons?role=LEAD`);
        if (!perRes.ok) throw new Error(`Persons API failed: ${perRes.status}`);
        const persons = await perRes.json();
        console.log(`✅ Fetched ${persons.length} leads.`);

        console.log('\n✨ All automated API checks passed successfully!');
    } catch (error) {
        console.error('\n💥 Test suite failed:', error.message);
        process.exit(1);
    }
}

runTests();
