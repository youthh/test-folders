import React from "react";
import { Folder } from "../utils/types";

interface RenderTreeNodeProps {
  node: Folder;
  expandedFolders: string[];
  onFolderClick: (folderId: string) => void;
}

export const RenderTreeNode = ({
  node,
  expandedFolders,
  onFolderClick,
}: RenderTreeNodeProps) => {
  const isFolderExpanded = expandedFolders.includes(node.id);

  return (
    <div className={"item"} key={node.id}>
      <div className={"toggle"} onClick={() => onFolderClick(node.id)}>
        {node.name} {isFolderExpanded ? "(-)" : "(+)"}
      </div>
      {isFolderExpanded && (
        <div style={{ marginLeft: "20px" }}>
          {node.folders &&
            node.folders.map((folder) => (
              <RenderTreeNode
                key={folder.id}
                node={folder}
                expandedFolders={expandedFolders}
                onFolderClick={onFolderClick}
              />
            ))}
          {node.files.map((file) => (
            <div key={file.id} style={{ marginLeft: "20px" }}>
              {file.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
