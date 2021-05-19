/**
 * Mocking client-server processing (until Microsoft integration)
 */
const _categories = [
    { "id": 1, "Name": "Automobile" },
    { "id": 2, "Name": "Bank Charges" },
    { "id": 4, "Name": "Childcare" },
    { "id": 6, "Name": "Credit Card Fees" },
    { "id": 7, "Name": "Education" },
    { "id": 8, "Name": "Events" },
    { "id": 9, "Name": "Food" },
    { "id": 10, "Name": "Gifts" },
    { "id": 11, "Name": "Healthcare" },
    { "id": 12, "Name": "Household" },
    { "id": 13, "Name": "Insurance" },
    { "id": 14, "Name": "Job Expenses" },
    { "id": 15, "Name": "Leisure (daily/non-vacation" },
    { "id": 16, "Name": "Hobbies" },
    { "id": 17, "Name": "Loans" },
    { "id": 18, "Name": "Pet Care" },
    { "id": 19, "Name": "Savings" },
    { "id": 20, "Name": "Taxes" },
    { "id": 21, "Name": "Utilities" },
    { "id": 22, "Name": "Vacation"}
]

const _subCategories = [
    //Automobile
    { "id": 1, "Name": "Gasoline", "CategoryId": 1 },
    { "id": 2, "Name": "Maintenance", "CategoryId": 1 },
    { "id": 3, "Name": "Registration Fees", "CategoryId": 1 },
    { "id": 4, "Name": "Auto Loan Payment", "CategoryId": 1 },
    { "id": 99, "Name": "Reposession Payment", "CategoryId": 1 },
    //Bank Charges
    { "id": 5, "Name": "Check Orders", "CategoryId": 2 },
    { "id": 6, "Name": "Service Fees", "CategoryId": 2 },
    { "id": 7, "Name": "Insufficient funds fee", "CategoryId": 2 },
    { "id": 8, "Name": "Minimum Balance Fee", "CategoryId": 2 },
    { "id": 9, "Name": "ATM Fees", "CategoryId": 2 },
    //Childcare
    { "id": 10, "Name": "Babysitting", "CategoryId": 4 },
    { "id": 11, "Name": "Child Support", "CategoryId": 4 },
    //Credit Card Fees
    { "id": 12, "Name": "Annual Fee", "CategoryId": 6 },
    { "id": 13, "Name": "Finance Charge", "CategoryId": 6 },
    { "id": 14, "Name": "Over the limit fee", "CategoryId": 6 },
    { "id": 15, "Name": "Minimum Usage fee", "CategoryId": 6 },
    { "id": 16, "Name": "Cash Advance Fee", "CategoryId": 6 },
    { "id": 17, "Name": "Late Fee", "CategoryId": 6 },
    { "id": 18, "Name": "Rewards Programs", "CategoryId": 6 },
    { "id": 19, "Name": "Monthly Payment", "CategoryId": 6 },
    //Education
    { "id": 20, "Name": "Tuition", "CategoryId": 7 },
    { "id": 21, "Name": "Books", "CategoryId": 7 },
    { "id": 22, "Name": "School Supplies", "CategoryId": 7 },
    { "id": 23, "Name": "Field Trips", "CategoryId": 7 },
    { "id": 24, "Name": "Misc. Fees", "CategoryId": 7 },
    { "id": 25, "Name": "Student Loan Payment", "CategoryId": 7 },
    //Events
    { "id": 26, "Name": "Wedding", "CategoryId": 8 },
    { "id": 27, "Name": "Moving", "CategoryId": 8 },
    //Food
    { "id": 28, "Name": "Groceries", "CategoryId": 9 },
    { "id": 29, "Name": "Dining Out", "CategoryId": 9 },
    { "id": 30, "Name": "Vending Machines", "CategoryId": 9 },
    { "id": 31, "Name": "Coffee House", "CategoryId": 9 },
    //Gifts
    { "id": 32, "Name": "Birthday", "CategoryId": 10 },
    { "id": 33, "Name": "Wedding/Wedding Shower", "CategoryId": 10 },
    { "id": 34, "Name": "Baby Shower", "CategoryId": 10 },
    { "id": 35, "Name": "Holiday", "CategoryId": 10 },
    { "id": 36, "Name": "Anniversary", "CategoryId": 10 },
    { "id": 37, "Name": "Just Because", "CategoryId": 10 },
    //Healthcare
    { "id": 38, "Name": "Dental", "CategoryId": 11 },
    { "id": 39, "Name": "Vision", "CategoryId": 11 },
    { "id": 40, "Name": "Physician", "CategoryId": 11 },
    { "id": 41, "Name": "Hospital", "CategoryId": 11 },
    { "id": 42, "Name": "Prescriptions", "CategoryId": 11 },
    { "id": 43, "Name": "Over the counter medication", "CategoryId": 11 },
    { "id": 44, "Name": "Vitamins", "CategoryId": 11 },
    //Household
    { "id": 45, "Name": "Rent/Mortgage Payment", "CategoryId": 12 },
    { "id": 46, "Name": "Homeowner's Association Dues", "CategoryId": 12 },
    { "id": 47, "Name": "Furniture", "CategoryId": 12 },
    { "id": 48, "Name": "Supplies", "CategoryId": 12 },
    { "id": 49, "Name": "Decorating", "CategoryId": 12 },
    { "id": 50, "Name": "Tools", "CategoryId": 12 },
    { "id": 51, "Name": "Home Maintenance and Repair", "CategoryId": 12 },
    { "id": 52, "Name": "Home Improvement", "CategoryId": 12 },
    //Insurance
    { "id": 53, "Name": "Automobile", "CategoryId": 13 },
    { "id": 54, "Name": "Health", "CategoryId": 13 },
    { "id": 55, "Name": "Life", "CategoryId": 13 },
    { "id": 56, "Name": "Disability", "CategoryId": 13 },
    { "id": 57, "Name": "Long Term Care", "CategoryId": 13 },
    { "id": 58, "Name": "Roadside Assistance", "CategoryId": 13 },
    //Job Expenses
    { "id": 59, "Name": "Reimbursed", "CategoryId": 14 },
    { "id": 60, "Name": "Clothing", "CategoryId": 14 },
    { "id": 61, "Name": "Professional Dues", "CategoryId": 14 },
    //leisure
    { "id": 62, "Name": "Books", "CategoryId": 15 },
    { "id": 63, "Name": "Magazines", "CategoryId": 15 },
    { "id": 64, "Name": "Movie Theater", "CategoryId": 15 },
    { "id": 65, "Name": "Video Rental/Pay Per View", "CategoryId": 15 },
    { "id": 66, "Name": "Sporting Events", "CategoryId": 15 },
    { "id": 67, "Name": "Sporting Goods", "CategoryId": 15 },
    //hobbies
    { "id": 68, "Name": "Cultural Events (e.g. parades, carnivals, etc.)", "CategoryId": 16 },
    { "id": 69, "Name": "Music", "CategoryId": 16 },
    { "id": 70, "Name": "Video Games", "CategoryId": 16 },
    { "id": 71, "Name": "Toys", "CategoryId": 16 },
    { "id": 72, "Name": "Tourist Attractions (e.g. amusement parks, museums, zoos, etc.)", "CategoryId": 16 },
    //loans
    { "id": 73, "Name": "Loan Payment", "CategoryId": 17 },
    { "id": 74, "Name": "Finance Charge/Interest", "CategoryId": 17 },
    { "id": 75, "Name": "Late Fee", "CategoryId": 17 },
    //pet care
    { "id": 76, "Name": "Food", "CategoryId": 18 },
    { "id": 77, "Name": "Supplies", "CategoryId": 18 },
    { "id": 78, "Name": "Veterinarian", "CategoryId": 18 },
    //savings
    { "id": 79, "Name": "Retirement", "CategoryId": 19 },
    { "id": 80, "Name": "Investments", "CategoryId": 19 },
    { "id": 81, "Name": "Emergency Fund", "CategoryId": 19 },
    { "id": 82, "Name": "Reserve Funds (to set aside for planned expenses)", "CategoryId": 19 },
    //taxes
    { "id": 83, "Name": "Federal", "CategoryId": 20 },
    { "id": 84, "Name": "State", "CategoryId": 20 },
    { "id": 85, "Name": "Local", "CategoryId": 20 },
    //utilities
    { "id": 86, "Name": "Water", "CategoryId": 21 },
    { "id": 87, "Name": "Sewer", "CategoryId": 21 },
    { "id": 88, "Name": "Electricity", "CategoryId": 21 },
    { "id": 89, "Name": "Gas", "CategoryId": 21 },
    { "id": 90, "Name": "Television (e.g. cable, satelitte, etc.)", "CategoryId": 21 },
    { "id": 91, "Name": "Telephone/Cell Phone", "CategoryId": 21 },
    { "id": 92, "Name": "Internet Service", "CategoryId": 21 },
    { "id": 93, "Name": "Garbage and Recycling", "CategoryId": 21 },
    //vacation
    { "id": 94, "Name": "Day Trips", "CategoryId": 22 },
    { "id": 95, "Name": "Transportation", "CategoryId": 22 },
    { "id": 96, "Name": "Lodging", "CategoryId": 22 },
    { "id": 97, "Name": "Entertainment", "CategoryId": 22 },
    { "id": 98, "Name": "Charity", "CategoryId": 10},
    { "id": 99, "Name": "Clothing", "CategoryId": 16 },
    { "id": 100, "Name": "Homeowners/Renters", "CategoryId": 13 },
    { "id": 101, "Name": "Subscriptions (e.g. Disney+, Hulu, etc.)", "CategoryId": 16 }
]

export default {
    getCategories(cb) {
        setTimeout(() => cb(_categories), 100);
    },

    getSubCategories(cb) {
        setTimeout(() => cb(_subCategories), 100);
    }
}