"use client";
import React, { useState } from "react";

function DashboardPage(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-inter">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-500 mt-2">Welcome to your dashboard!</p>
    </div>
  );
}

export default DashboardPage;