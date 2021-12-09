const _versions = [
    { 
        id: 0, 
        versionNum: '0.1.8', 
        latest: true,
        changes: [
            { change: 'Added Income Entry, and ability to edit', type: 'Feature' },
            { change: 'Fixed issue with previous year\'s non-recurring bills populating this year', type: 'Bug' },
            { change: 'Added Budget Dashboard to display Budget with income, bills, and remaining budget based on selection (Monthly, Quarterly, Semi-Annual, Annual)', type: 'Feature'},
            { change: 'Added Mobile support for income display', type: 'Feature' },
            { change: 'Added this Change Log to give updates on changes made to the site to you, the user', type: 'Feature' }
        ]
    }
];

export default {
    getVersions(cb) {
        setTimeout(() => cb(_versions), 100);
    }
}