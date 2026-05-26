"use client";

import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

const Page = () => {
  const { user } = useSelector((state: RootState) => state.admin);
  return (
    <div>
      <h1>{user?.name}</h1>
    </div>
  );
};

export default Page;
