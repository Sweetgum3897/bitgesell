import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'not-found' | 'error'
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const loadItem = async () => {
      setStatus("loading");
      try {
        const res = await fetch(`http://localhost:3001/api/items/${id}`, {
          signal: controller.signal,
        });

        if (res.status === 404) {
          setStatus("not-found");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch item");
        }

        const data = await res.json();
        setItem(data);
        setStatus("success");
      } catch (err) {
        if (err.name === "AbortError") return; // Component unmounted
        console.error(err);
        setStatus("error");
      }
    };

    loadItem();

    return () => {
      controller.abort(); // Cancel fetch on unmount
    };
  }, [id]);

  // --- Render states ---
  if (status === "loading") {
    return <p aria-busy="true">Loading item details…</p>;
  }

  if (status === "not-found") {
    return <p role="alert">Item not found.</p>;
  }

  if (status === "error") {
    return <p role="alert">Something went wrong. Please try again later.</p>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>{item.name}</h2>
      <p>
        <strong>Category:</strong> {item.category}
      </p>
      <p>
        <strong>Price:</strong> ${item.price}
      </p>
    </div>
  );
}

export default ItemDetail;
