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
        latest: true,
        changes: [
            { change: 'Added Tax-Exempt Income', type: 'Feature' },
            { change: 'Added ability to mark bills as paid-off for future analytics', type: 'Feature' }
        ]
    }
];

export default {
    getVersions(cb) {
        setTimeout(() => cb(_versions), 100);
    }
}