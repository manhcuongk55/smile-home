import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
    try {
        // --- 1. Cleanup ---
        await prisma.activityLog.deleteMany({});
        await prisma.interaction.deleteMany({});
        await prisma.meterReading.deleteMany({});
        await prisma.utilityMeter.deleteMany({});
        await prisma.maintenanceTicket.deleteMany({});
        await prisma.receipt.deleteMany({});
        await prisma.invoice.deleteMany({});
        await prisma.expense.deleteMany({});
        await prisma.contract.deleteMany({});
        await prisma.person.deleteMany({});
        await prisma.room.deleteMany({});
        await prisma.building.deleteMany({});
        await prisma.property.deleteMany({});

        // --- 2. Properties ---
        const prop1 = await prisma.property.create({
            data: { name: 'Smile Residence Sukhumvit', address: '123 Sukhumvit Soi 39, Bangkok 10110', type: 'RESIDENTIAL', valuation: 150000000 },
        });
        const prop2 = await prisma.property.create({
            data: { name: 'Smile Tower Silom', address: '456 Silom Road, Bangkok 10500', type: 'MIXED', valuation: 350000000 },
        });

        // --- 3. Buildings ---
        const bldA = await prisma.building.create({ data: { propertyId: prop1.id, name: 'Building A', floors: 8 } });
        const bldB = await prisma.building.create({ data: { propertyId: prop1.id, name: 'Building B', floors: 6 } });
        const tower1 = await prisma.building.create({ data: { propertyId: prop2.id, name: 'Tower 1', floors: 15 } });

        // --- 4. Rooms ---
        const roomData = [
            { buildingId: bldA.id, number: 'A101', type: 'STUDIO', status: 'OCCUPIED', price: 12000, area: 28 },
            { buildingId: bldA.id, number: 'A102', type: 'STUDIO', status: 'OCCUPIED', price: 12500, area: 28 },
            { buildingId: bldA.id, number: 'A201', type: 'ONE_BED', status: 'OCCUPIED', price: 18000, area: 35 },
            { buildingId: bldA.id, number: 'A202', type: 'TWO_BED', status: 'MAINTENANCE', price: 25000, area: 52 },
            { buildingId: bldA.id, number: 'A301', type: 'PENTHOUSE', status: 'VACANT', price: 45000, area: 90 },
            { buildingId: bldB.id, number: 'B101', type: 'STUDIO', status: 'OCCUPIED', price: 10000, area: 25 },
            { buildingId: bldB.id, number: 'B102', type: 'ONE_BED', status: 'OCCUPIED', price: 15000, area: 32 },
            { buildingId: bldB.id, number: 'B201', type: 'STUDIO', status: 'VACANT', price: 10000, area: 25 },
            { buildingId: tower1.id, number: 'T501', type: 'ONE_BED', status: 'OCCUPIED', price: 22000, area: 40 },
            { buildingId: tower1.id, number: 'T502', type: 'TWO_BED', status: 'OCCUPIED', price: 35000, area: 65 },
            { buildingId: tower1.id, number: 'T503', type: 'COMMERCIAL', status: 'OCCUPIED', price: 55000, area: 85 },
            { buildingId: tower1.id, number: 'T601', type: 'ONE_BED', status: 'VACANT', price: 22000, area: 40 },
        ];
        const rooms: any[] = [];
        for (const rd of roomData) { rooms.push(await prisma.room.create({ data: rd })); }

        // --- 5. Stakeholder Personas ---
        const owner = await prisma.person.create({ data: { name: 'Khun Ananda (Chủ nhà)', role: 'OWNER', email: 'ananda@smilehome.com', phone: '091-234-5678' } });
        const investor = await prisma.person.create({ data: { name: 'Dr. Somchai (Nhà đầu tư)', role: 'INVESTOR', email: 'somchai@capital.com', notes: 'Đối tác vốn chính - 40% cổ phần' } });
        const manager = await prisma.person.create({ data: { name: 'Minh (Quản lý vận hành)', role: 'STAFF', email: 'minh@smilehome.com', parentId: owner.id } });
        const accountant = await prisma.person.create({ data: { name: 'Huệ (Kế toán trưởng)', role: 'STAFF', email: 'hue@smilehome.com', parentId: manager.id, notes: 'Kế toán trưởng' } });
        const contractor = await prisma.person.create({ data: { name: 'Công ty TNHH Baan Fix', role: 'CONTRACTOR', email: 'service@baanfix.com', phone: '02-123-4567' } });

        // --- 6. Tenants (nhiều khách thuê) ---
        const tenantData = [
            { name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '091-111-1111' },
            { name: 'Trần Thị Bình', email: 'binh.tran@gmail.com', phone: '091-222-2222' },
            { name: 'Phạm Văn Cường', email: 'cuong.pham@gmail.com', phone: '091-333-3333' },
            { name: 'Đặng Thị Duyên', email: 'duyen.dang@gmail.com', phone: '091-444-4444' },
            { name: 'Hoàng Văn Em', email: 'em.hoang@gmail.com', phone: '091-555-5555' },
            { name: 'Lê Thị Phương', email: 'phuong.le@gmail.com', phone: '091-666-6666' },
            { name: 'Global Trade Co., Ltd', email: 'lease@globaltrade.com', phone: '02-999-8888' },
        ];
        const tenants: any[] = [];
        for (const td of tenantData) { tenants.push(await prisma.person.create({ data: { ...td, role: 'TENANT' } })); }

        // --- 7. Contracts & Invoices (đầy đủ dữ liệu kế toán) ---
        const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED');
        const invoiceStatuses = ['VERIFIED', 'VERIFIED', 'PAID', 'PENDING', 'OVERDUE'];
        let invoiceCounter = 0;
        const allInvoices: any[] = [];

        for (let i = 0; i < Math.min(tenants.length, occupiedRooms.length); i++) {
            const tenant = tenants[i];
            const room = occupiedRooms[i];

            const contract = await prisma.contract.create({
                data: {
                    personId: tenant.id,
                    roomId: room.id,
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2025-12-31'),
                    monthlyRent: room.price,
                    deposit: room.price * 2,
                    status: 'ACTIVE',
                }
            });

            // Tạo 5 tháng hóa đơn cho mỗi khách thuê
            for (let m = 0; m < 5; m++) {
                const status = invoiceStatuses[m];
                const issueMonth = new Date(2024, 9 + m, 1); // Oct 2024 - Feb 2025
                const dueDate = new Date(2024, 9 + m, 5);
                invoiceCounter++;

                const invoice = await prisma.invoice.create({
                    data: {
                        contractId: contract.id,
                        invoiceNumber: `INV-${String(invoiceCounter).padStart(4, '0')}`,
                        amount: room.price,
                        status: status,
                        dueDate: dueDate,
                        issuedDate: issueMonth,
                    }
                });
                allInvoices.push({ ...invoice, tenantName: tenant.name, roomNumber: room.number });

                // Nhật ký đối soát cho hóa đơn VERIFIED
                if (status === 'VERIFIED') {
                    await prisma.interaction.create({
                        data: {
                            personId: accountant.id,
                            invoiceId: invoice.id,
                            subject: `Đối soát: ${invoice.invoiceNumber}`,
                            content: `Đã nhận thanh toán qua chuyển khoản ngân hàng. Mã tham chiếu: #TXN${Date.now()}${m}. Xác nhận bởi Kế toán Huệ.`,
                            channel: 'INTERNAL',
                            direction: 'INTERNAL',
                            tags: 'kế_toán,đã_đối_soát'
                        }
                    });
                }

                // Ghi chú nhắc nợ cho hóa đơn OVERDUE
                if (status === 'OVERDUE') {
                    await prisma.interaction.create({
                        data: {
                            personId: accountant.id,
                            invoiceId: invoice.id,
                            subject: `Nhắc nợ: ${invoice.invoiceNumber}`,
                            content: `Đã gửi email nhắc thanh toán lần 2. Khách thuê ${tenant.name} phòng ${room.number} chưa phản hồi.`,
                            channel: 'EMAIL',
                            direction: 'OUTBOUND',
                            tags: 'nhắc_nợ,quá_hạn'
                        }
                    });
                }
            }
        }

        // --- 8. Expenses (chi phí vận hành) ---
        const expenseCategories = [
            { cat: 'TAX', desc: 'Thuế bất động sản', min: 30000, max: 80000 },
            { cat: 'INSURANCE', desc: 'Bảo hiểm tòa nhà', min: 15000, max: 40000 },
            { cat: 'UTILITY', desc: 'Điện nước khu vực chung', min: 8000, max: 25000 },
            { cat: 'SALARY', desc: 'Lương nhân viên vận hành', min: 50000, max: 120000 },
            { cat: 'MAINTENANCE', desc: 'Chi phí bảo trì định kỳ', min: 5000, max: 30000 },
            { cat: 'OTHER', desc: 'Chi phí khác (marketing, pháp lý)', min: 3000, max: 15000 },
        ];

        for (const prop of [prop1, prop2]) {
            for (const exp of expenseCategories) {
                const amount = Math.round(exp.min + Math.random() * (exp.max - exp.min));
                await prisma.expense.create({
                    data: {
                        propertyId: prop.id,
                        category: exp.cat,
                        amount: amount,
                        date: new Date(2024, 11, 15),
                        status: 'PAID',
                        description: `${exp.desc} - ${prop.name}`
                    }
                });
            }
        }

        // --- 9. Maintenance Tickets (nhà thầu) ---
        const maintenanceRoom = rooms.find(r => r.status === 'MAINTENANCE') || rooms[0];
        await prisma.maintenanceTicket.create({
            data: {
                roomId: maintenanceRoom.id, reportedById: manager.id, assignedToId: contractor.id,
                title: 'Thay thế linh kiện máy lạnh', description: 'Thay block nén và nạp gas lạnh. Phòng A202.',
                status: 'COMPLETED', priority: 'HIGH', cost: 8500,
                startedAt: new Date('2025-01-10'), completedAt: new Date('2025-01-12')
            }
        });
        await prisma.maintenanceTicket.create({
            data: {
                roomId: rooms[0].id, reportedById: tenants[0].id, assignedToId: contractor.id,
                title: 'Rò rỉ đường ống nước', description: 'Nước rò rỉ từ trần nhà tầng 1, nghi ngờ từ đường ống tầng 2.',
                status: 'IN_PROGRESS', priority: 'URGENT', cost: 0,
                startedAt: new Date('2025-02-28')
            }
        });
        await prisma.maintenanceTicket.create({
            data: {
                roomId: rooms[5].id, reportedById: tenants[3].id,
                title: 'Cửa kính bị nứt', description: 'Cửa sổ phòng khách bị nứt, cần thay mới.',
                status: 'OPEN', priority: 'MEDIUM',
            }
        });

        // --- 10. Leads (phễu khách hàng) ---
        const leadData = [
            { name: 'Vũ Thị Hoa', email: 'hoa.vu@gmail.com', leadStatus: 'NEW', source: 'Facebook', value: 15000000 },
            { name: 'Bùi Minh Tuấn', email: 'tuan.bui@gmail.com', leadStatus: 'CONTACTED', source: 'Website', value: 8000000 },
            { name: 'Ngô Thành Đạt', email: 'dat.ngo@gmail.com', leadStatus: 'VIEWING_SCHEDULED', source: 'Giới thiệu', value: 20000000 },
            { name: 'Cao Thị Mai', email: 'mai.cao@gmail.com', leadStatus: 'NEGOTIATING', source: 'Zalo', value: 12000000 },
            { name: 'Lý Minh Khang', email: 'khang.ly@gmail.com', leadStatus: 'CONVERTED', source: 'Walk-in', value: 50000000 },
        ];
        for (const ld of leadData) {
            await prisma.person.create({ data: { ...ld, role: 'LEAD', parentId: manager.id } });
        }

        return NextResponse.json({
            message: 'Dữ liệu hệ sinh thái đã được khởi tạo thành công!',
            counts: {
                properties: 2, buildings: 3, rooms: roomData.length,
                tenants: tenants.length, contracts: occupiedRooms.length,
                invoices: invoiceCounter, expenses: expenseCategories.length * 2,
                maintenanceTickets: 3, leads: leadData.length,
                stakeholders: '5 (Owner, Investor, Manager, Accountant, Contractor)'
            }
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Failed to seed ecosystem data.' }, { status: 500 });
    }
}
