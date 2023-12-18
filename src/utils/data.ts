
export const mockData = [
    {
        id: '1',
        name: 'My Folder',
        folders: [
            {
                id: '2',
                name: 'Study',
                folders: [
                    {
                        id: '4',
                        name: 'Programming',
                        folders: [],
                        files: [{ id: '9', name: 'lab1' }],
                    },
                    {
                        id: '5',
                        name: 'English',
                        folders: [],
                        files: [{ id: '10', name: 'home work' }],
                    },
                ],
                files: [{ id: '8', name: 'daybook' }],
            },
            {
                id: '3',
                name: 'Work',
                folders: [],
                files: [{ id: '6', name: 'to do list' }, { id: '7', name: 'task' }],
            },
        ],
        files: [{ id: '11', name: 'Calendar' }, { id: '12', name: 'notes' }],
    },
    {
        id: '13',
        name: 'Your Folder',
        folders: [],
        files: [{ id: '14', name: 'todo list' }, { id: '15', name: 'Wishes' }],
    },
];
