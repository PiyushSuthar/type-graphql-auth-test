import React, { useEffect, useState } from "react";
import { setAccessToken } from "./accessToken";
import { Routes } from "./Routes";

interface Props {}

export const App: React.FC<Props> = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:4000/refresh_token`, {
      credentials: "include",
      method: "POST",
    }).then(async (res) => {
      const { accessToken } = await res.json();
      setAccessToken(accessToken);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading</div>;
  }

  return <Routes />;
};
