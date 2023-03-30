import React from "react";
import {
  render,
  screen,
  act,
  renderHook,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  BirthdaysProvider,
  BirthdayContext,
  useBirthdays,
} from "./useBirthdays";

const defaultValues = {
  loading: false,
  error: null,
  birthdays: null,
  toggleFavorite: jest.fn(),
  favorites: null,
  setDates: jest.fn(),
  month: null,
  day: null,
  language: "en",
  setLanguage: jest.fn(),
  favoritesMap: new Map(),
  clearFavorites: jest.fn(),
  getFormattedItemValue: jest.fn(),
};

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ test: 100 }),
  })
) as jest.Mock;

describe("BirthdaysProvider", () => {
  it("renders without crashing", () => {
    render(
      <BirthdayContext.Provider value={defaultValues}>
        <BirthdaysProvider>
          <div>Hello World</div>
        </BirthdaysProvider>
      </BirthdayContext.Provider>
    );

    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("useBirthdays hook should have default loading: false", () => {
    const { result } = renderHook(() => useBirthdays());
    expect(result.current.loading).toBe(false);
  });

  it("useBirthdays hook should have loading: true and fetch called when setting Dates", async () => {
    // spy on fetch
    // that does't work, don't know why
    const spy = jest.spyOn(global, "fetch").mockResolvedValue({} as any);
    const { result } = renderHook(() => useBirthdays());
    result.current.setDates({ MM: "01", DD: "01" });
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
      expect(spy).toHaveBeenCalled();
    });
  });
  // etc...
});
