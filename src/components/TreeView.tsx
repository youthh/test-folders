import React, { useState } from "react";
import { Folder } from "../utils/types";
import { RenderTreeNode } from "./TreeNode";

interface TreeViewProps {
  data: Folder[];
}

const TreeView = ({ data }: TreeViewProps) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

  const handleFolderClick = (folderId: string) => {
    setExpandedFolders((prevExpandedFolders) => {
      if (prevExpandedFolders.includes(folderId)) {
        return prevExpandedFolders.filter((id) => id !== folderId);
      } else {
        return [...prevExpandedFolders, folderId];
      }
    });
  };

  return (
    <div>
      {data.map((node) => (
        <RenderTreeNode
          key={node.id}
          node={node}
          expandedFolders={expandedFolders}
          onFolderClick={handleFolderClick}
        />
      ))}
    </div>
  );
};

export default TreeView;
