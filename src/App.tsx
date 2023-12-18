// App.tsx
import React, { useState } from "react";
import { Folder } from "./utils/types";
import TreeView from "./components/TreeView";
import "./assets/styles.css";
import { mockData } from "./utils/data";

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filterData = (folders: Folder[], term: string): Folder[] => {
    return folders
      .filter((folder) => {
        const subFolders = filterData(folder.folders, term);
        const subFiles = folder.files.filter((file) =>
          file.name.toLowerCase().includes(term.toLowerCase()),
        );
        return (
          folder.name.toLowerCase().includes(term.toLowerCase()) ||
          subFolders.length > 0 ||
          subFiles.length > 0
        );
      })
      .map((folder) => ({
        ...folder,
        folders: filterData(folder.folders, term),
      }));
  };

  const filteredData = filterData(mockData, searchTerm);

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <TreeView data={filteredData} />
    </div>
  );
};

export default App;
