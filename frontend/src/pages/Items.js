import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useData } from "../state/DataContext";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import "./Items.css";

function Items() {
  const { items, total, fetchItems } = useData();
  const [status, setStatus] = useState("loading");
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page")) || 1;
  const pageSize = 10; // virtualize lots per page
  const q = searchParams.get("q") || "";

  useEffect(() => {
    const controller = new AbortController();
    const loadItems = async () => {
      setStatus("loading");
      try {
        await fetchItems(page, q, pageSize, controller.signal);
        setStatus("success");
      } catch (err) {
        if (err.name !== "AbortError") setStatus("error");
      }
    };
    loadItems();
    return () => controller.abort();
  }, [page, q, fetchItems]);

  const totalPages = Math.ceil(total / pageSize);

  const updateQuery = (newPage) => {
    setSearchParams((params) => {
      params.set("page", newPage);
      if (q) params.set("q", q);
      return params;
    });
  };

  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div style={style} className="item-row">
        <Link to={`/items/${item.id}`} className="item-link">
          {item.name}
        </Link>
      </div>
    );
  };

  return (
    <div className="container">
      <h2 className="heading">Items</h2>

      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const q = formData.get("q");
          setSearchParams({ q, page: 1 });
        }}
      >
        <input
          className="search-input"
          name="q"
          defaultValue={q}
          placeholder="Search..."
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {status === "loading" && <p className="status">Loading...</p>}
      {status === "error" && (
        <p className="status error">Error loading items.</p>
      )}

      {status === "success" && (
        <>
          {items.length === 0 ? (
            <p className="status">No results found.</p>
          ) : (
            <div className="list-container">
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    height={height}
                    itemCount={items.length}
                    itemSize={50}
                    width={width}
                  >
                    {Row}
                  </List>
                )}
              </AutoSizer>
            </div>
          )}

          <div className="pagination">
            <button
              className="page-button"
              onClick={() => updateQuery(page - 1)}
              disabled={page <= 1}
            >
              {`< Previous`}
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="page-button"
              onClick={() => updateQuery(page + 1)}
              disabled={page >= totalPages}
            >
              {`Next >`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Items;
