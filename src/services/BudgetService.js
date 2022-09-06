import { ref, get, set, child, remove } from 'firebase/database';

const mapBillsFromRealTimeDatabase = (billToConvert) => {
    const dateCreated = new Date(billToConvert.dateCreated);
    const defaultRecurringCycle = {
        date: new Date(dateCreated.getFullYear(), dateCreated.getMonth(), new Date(billToConvert.dueDate).getDate()).toLocaleDateString(),
        interval: 1
    };
    const billToMap = { 
        userId: billToConvert.userId ?? null,
        id: billToConvert.id.toString() ?? null,
        name: billToConvert.name ?? null,
        paid: billToConvert.paid ?? false,
        amount: billToConvert.amount ?? 0.0,
        datePaid: billToConvert.datePaid ?? null,
        dateCreated: billToConvert.dateCreated ?? null,
        isRecurring: billToConvert.isRecurring ?? false,
        paidCount: billToConvert.paidCount ?? 0,
        isFixedAmount: billToConvert.isFixedAmount ?? false,
        datePaidOff: billToConvert.datePaidOff ?? null,
        subCategoryId: billToConvert.subCategoryId ?? null,
        dueDate: billToConvert.dueDate ?? null,
        recurringCycle: billToConvert.isRecurring ? billToConvert.recurringCycle ?? defaultRecurringCycle : null,
    };
    return billToMap;
};

const mapIncomeFromRealTimeDatabase = (incomeToConvert) => {
    const incomeToMap = {
        userId: incomeToConvert.userId ?? null,
        id: incomeToConvert.id.toString() ?? null,
        name: incomeToConvert.name ?? null,
        type: incomeToConvert.type ?? null,
        salary: incomeToConvert.salary ?? 0,
        netSalary: incomeToConvert.netSalary ?? 0,
        hourlyRate: incomeToConvert.hourlyRate ?? 0,
        hoursPerWeek: incomeToConvert.hoursPerWeek ?? 0,
        employmentType: incomeToConvert.employmentType ?? null,
        filingStatus: incomeToConvert.filingStatus ?? null,
        payPeriod: incomeToConvert.payPeriod ?? null,
        state: incomeToConvert.state ?? null,
        isActive: incomeToConvert.isActive ?? true,
        isTaxExempt: incomeToConvert.isTaxExempt ?? false,
        deductions: incomeToConvert.deductions ?? [],
    };
    return incomeToMap;
};

export default {
    getIncomes(db, uid) {
        const path = `income/${uid}`;
        return new Promise((resolve, reject) => {
            get(child(ref(db), path))
                .then((data) => {
                    if (data.exists()) {
                        const returnArray = [];
                        data.forEach((item) => {
                            returnArray.push(mapIncomeFromRealTimeDatabase(item.val()));
                        });
                        resolve(returnArray);
                    } else {
                        resolve([]);
                    }
            }).catch((error) => {
                reject(error);
            });
        });
    },
    userConfirmedTOS(db, uid, hasUserConfirmed) {
        const path = `users/${uid}`;
        set(ref(db, path), { agreedToTermsOfService: hasUserConfirmed, agreedDateTimestamp: Date.now().toString() });
    },
    upsertIncome(db, uid, income) {
        const path = `income/${uid}/${income.id}`; 
        set(ref(db, path), income);
    },
    deleteIncome(db, uid, incomeId) {
        const path = `income/${uid}/${incomeId}`;
        remove(ref(db, path));
    },
    getBills(db, uid) {
        const path = `bills/${uid}`;
        return new Promise((resolve, reject) => {
            get(child(ref(db), path))
                .then((data) => {
                    if (data.exists()) {
                        const returnArray = [];
                        data.forEach((bill) => {
                            returnArray.push(mapBillsFromRealTimeDatabase(bill.val()));
                        })
                        resolve(returnArray);
                    } else {
                        resolve([]);
                    }
                }).catch((error) => {
                    reject(error);
                });
        });
    },
    upsertBill(db, uid, bill) {
        const path = `bills/${uid}/${bill.id}`;
        set(ref(db, path), bill);
    },
    deleteBill(db, uid, billId) {
        const path = `bills/${uid}/${billId}`;
        remove(ref(db, path));
    },
    sendMessage(db, uid = null, messageData) {
        const messageId = uid ?? `Guest${Date.now().toString()}`;
        const path = `messages/${messageId}`;
        return new Promise((resolve, reject) => {
            set(ref(db, path), messageData)
                .then(() => {
                    resolve('Success');
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
}