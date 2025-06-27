// __tests__/Items.test.jsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Items from "../src/pages/Items";
import * as DataContext from "../src/state/DataContext"; // import your context hook

// Mock fetchItems function to simulate API calls
const mockFetchItems = jest.fn();

const mockItems = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
];

// Mock context provider or hook
jest.spyOn(DataContext, "useData").mockReturnValue({
  items: mockItems,
  total: 30,
  fetchItems: mockFetchItems,
});

describe("Items component", () => {
  beforeEach(() => {
    mockFetchItems.mockClear();
  });

  test("renders loading initially and fetches items", async () => {
    // mockFetchItems resolves
    mockFetchItems.mockResolvedValue();

    render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>
    );

    // Loading message shows initially
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    // Wait for fetchItems to be called and status to update
    await waitFor(() => expect(mockFetchItems).toHaveBeenCalled());

    // After loading, items should be rendered in the list container
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Cherry")).toBeInTheDocument();
  });

  test("handles search form submission", async () => {
    mockFetchItems.mockResolvedValue();

    render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Search/i);
    const button = screen.getByRole("button", { name: /Search/i });

    // Simulate typing and submitting form
    userEvent.clear(input);
    userEvent.type(input, "ap");
    userEvent.click(button);

    // fetchItems called with updated query params (page=1, q='ap')
    await waitFor(() =>
      expect(mockFetchItems).toHaveBeenCalledWith(
        1,
        "ap",
        10,
        expect.anything()
      )
    );
  });

  test("pagination buttons enable/disable correctly and trigger fetch", async () => {
    mockFetchItems.mockResolvedValue();

    render(
      <MemoryRouter initialEntries={["/?page=2"]}>
        <Items />
      </MemoryRouter>
    );

    const prevBtn = screen.getByRole("button", { name: /Previous/i });
    const nextBtn = screen.getByRole("button", { name: /Next/i });

    // On page 2, both buttons should be enabled
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    // Click Previous button triggers updateQuery with page 1
    userEvent.click(prevBtn);
    await waitFor(() =>
      expect(mockFetchItems).toHaveBeenCalledWith(1, "", 10, expect.anything())
    );

    // Click Next button triggers updateQuery with page 3
    userEvent.click(nextBtn);
    await waitFor(() =>
      expect(mockFetchItems).toHaveBeenCalledWith(3, "", 10, expect.anything())
    );
  });

  test("shows error message on fetch failure", async () => {
    mockFetchItems.mockRejectedValue(new Error("Network error"));

    render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>
    );

    await waitFor(() => expect(mockFetchItems).toHaveBeenCalled());

    expect(screen.getByText(/Error loading items/i)).toBeInTheDocument();
  });
});
