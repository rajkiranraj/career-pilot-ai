import React from "react";

export const LoaderThree = ({ className = "" }) => {
  return (
    <div className={`loader-bolt-wrapper ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="loader-bolt-svg"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path
          className="loader-bolt-path"
          d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"
        />
      </svg>
      <div className="loader-bolt-ring" />
    </div>
  );
};
