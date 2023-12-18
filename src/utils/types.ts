export interface Folder {
    id: string;
    name: string;
    folders: Folder[];
    files: File[];
}

export interface File {
    id: string;
    name: string;
}

export interface ApiResponse {
    folders: Folder[];
}
