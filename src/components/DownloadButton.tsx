import React from "react";

type DownloadButtonProps = {
  mintlist: Array<any>;
  name: string;
  isLoading: boolean;
};

const DownloadButton = ({ mintlist, name, isLoading }: DownloadButtonProps) => {
  const downloadMintlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(mintlist)], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${name}_mintlist.json`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };
  return (
    <button
      className={`btn border border-blue-500 hover:border-green-500 ${
        isLoading ? "bg-gray-500 pointer-events-non" : ""
      }}`}
      onClick={downloadMintlist}
    >
      {isLoading ? <div className="radial-progress" /> : "Download Mintlist"}
    </button>
  );
};

export default DownloadButton;
