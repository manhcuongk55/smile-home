import { Prisma } from '@prisma/client';

export class ContractCodeService {
    /**
     * Generates a unique, sequential contract code: SH-26-XXXX
     * This method is production-safe against race conditions by using
     * atomic increments within the provided Prisma transaction.
     * 
     * @param tx Prisma Transaction Client
     * @returns Generated contract code (e.g., SH-26-0001)
     */
    static async generateCode(tx: Prisma.TransactionClient): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const shortYear = year.toString().slice(-2);

        // Atomic operation: Upsert the sequence for the current year
        // PostgreSQL (and Prisma) will lock this row for the duration of the transaction
        const sequenceRecord = await tx.contractSequence.upsert({
            where: { year: year },
            update: {
                lastSequence: {
                    increment: 1,
                },
            },
            create: {
                year: year,
                lastSequence: 1,
            },
        });

        const sequenceNumber = sequenceRecord.lastSequence;
        
        // Padding to 4 digits (e.g., 0001, 0002)
        const paddedSequence = sequenceNumber.toString().padStart(4, '0');

        return `SH-${shortYear}-${paddedSequence}`;
    }
}
