import React, { createContext, useCallback, useContext, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null);

  const fetchItems = useCallback(async (page, q, pageSize, signal) => {
    const res = await fetch(
      `http://localhost:3001/api/items?page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(
        q
      )}`,
      { signal: signal }
    );

    const json = await res.json();
    setItems(json.items);
    setTotal(json.total);
  }, []);

  return (
    <DataContext.Provider value={{ items, total, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
