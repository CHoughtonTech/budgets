const _versions = [
    { 
        id: 0, 
        versionNum: '0.2.6', 
        latest: false,
        changes: [
            { change: 'Added Income Entry, and ability to edit', type: 'Feature' },
            { change: 'Fixed issue with previous year\'s non-recurring bills populating this year', type: 'Bug' },
            { change: 'Added Budget Dashboard to display Budget with income, bills, and remaining budget based on selection (Monthly, Quarterly, Semi-Annual, Annual)', type: 'Feature'},
            { change: 'Added Mobile support for income display', type: 'Feature' },
            { change: 'Added this Change Log to give updates on changes made to the site to you, the user', type: 'Feature' }
        ]
    },
    {
        id: 1,
        versionNum: '0.2.0',
        latest: false,
        changes: [
            { change: 'Fixed Due Dates to be updated when year rolls over', type: 'Bug' },
            { change: 'Fixed change log to handle smaller vertical windows', type: 'Bug' },
            { change: 'Keeping State Tax Brackets to 2021 until new tax information is released', type: 'Bug' }
        ]
    },
    {
        id: 2,
        versionNum: '0.2.1',
        latest: false,
        changes: [
            { change: 'Added Tax-Exempt Income', type: 'Feature' },
            { change: 'Added ability to mark bills as paid-off for future analytics', type: 'Feature' }
        ]
    },
    {
        id: 3,
        versionNum: '0.2.2',
        latest: false,
        changes: [
            { change: 'Fixed Monthly due date reset for recurring bills', type: 'Bug' },
        ]
    },
    {
        id: 4,
        versionNum: '0.2.3',
        latest: true,
        changes: [
            { change: 'Refactored how income and bills are created and updated', type: 'Feature' },
            { change: 'Added Login teaser', type: 'Feature' },
            { change: 'Changed default sort from "Name", to "Due Date"', type: 'Feature' },
            { change: 'Fixed issue with Displayed incomes not grabbing correct tax rate', type: 'Bug' },
            { change: 'Fixed issue with Bill Pay Off showing up for non-recurring bills', type: 'Bug' }
        ]
    }
];

export default {
    getVersions(cb) {
        setTimeout(() => cb(_versions), 100);
    }
}