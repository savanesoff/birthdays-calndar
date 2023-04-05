import { render, screen, waitFor } from "@testing-library/react";
import { BirthdayList, IDS } from "./BirthdaysList";
import { state } from "../data/state";
import { BirthType } from "../data/types";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
// set mock state
const mockBirthdays = Array.from({ length: 10 }, (_, i) => ({
  text: `Birthday ${i}`,
  year: 2021,
  pages: Array.from({ length: 10 }, (_, i) => ({
    title: Math.random().toString(36).substring(7),
    displaytitle: Math.random().toString(36).substring(7),
    thumbnail: {
      source: Math.random().toString(36).substring(7),
    },
    originalimage: {
      source: Math.random().toString(36).substring(7),
    },
    extract: Math.random().toString(36).substring(7),
    content_urls: {
      desktop: {
        page: Math.random().toString(36).substring(7),
      },
    },
  })),
})) as BirthType[];

describe("<BirthdayList />", () => {
  it("renders component", () => {
    render(<BirthdayList />);
    expect(screen.queryByTestId(IDS.component)).toBeInTheDocument();
  });

  describe("Title", () => {
    it("does not render title element when date is not set", () => {
      state.date = "";
      render(<BirthdayList />);
      expect(screen.queryByTestId(IDS.title)).not.toBeInTheDocument();
    });
    it("render title element when date is set", () => {
      state.date = "2021-01-01";
      render(<BirthdayList />);
      expect(screen.queryByTestId(IDS.title)).toBeInTheDocument();
    });
    it("renders 'Famous people born on: ${date}' when date is set", () => {
      state.date = "2021-01-01";
      render(<BirthdayList />);
      expect(
        screen.queryByText(`Famous people born on: ${state.date}`)
      ).toBeInTheDocument();
    });
  });

  describe("Alert", () => {
    it("render alert element when date is not set", () => {
      state.date = "";
      render(<BirthdayList />);
      expect(screen.queryByTestId(IDS.alert)).toBeInTheDocument();
    });
    it("does not render alert element when date is set", () => {
      state.date = "2021-01-01";
      render(<BirthdayList />);
      expect(screen.queryByTestId(IDS.alert)).not.toBeInTheDocument();
    });
    it('renders "Please select date to load birthdays" when no date is selected', () => {
      state.date = "";
      render(<BirthdayList />);
      expect(
        screen.queryByText("Please select date to load birthdays")
      ).toBeInTheDocument();
    });
    it('does not render "Please select date to load birthdays" when date is selected', () => {
      state.date = "2021-01-01";
      render(<BirthdayList />);
      expect(
        screen.queryByText("Please select date to load birthdays")
      ).not.toBeInTheDocument();
    });
  });

  describe("loading", () => {
    it("renders loading element when loading is true", () => {
      state.loading = true;
      render(<BirthdayList />);
      expect(screen.queryByTestId(IDS.loading)).toBeInTheDocument();
    });
    it("does not render loading element when loading is false", () => {
      state.loading = false;
      render(<BirthdayList />);
      expect(screen.queryByTestId(IDS.loading)).not.toBeInTheDocument();
    });
  });

  describe("List", () => {
    it("renders list  when loading is false and data is set", () => {
      state.loading = false;
      state.birthdays = mockBirthdays;
      render(<BirthdayList />);
      for (let i = 0; i < mockBirthdays.length; i++) {
        expect(screen.queryByText(mockBirthdays[i].text)).toBeInTheDocument();
      }
    });

    it("does not render list element when loading is true", () => {
      state.loading = false;
      state.birthdays = [];
      render(<BirthdayList />);
      for (let i = 0; i < mockBirthdays.length; i++) {
        expect(
          screen.queryByText(mockBirthdays[i].text)
        ).not.toBeInTheDocument();
      }
    });

    it('adds favorite when "Add to favorites" button is clicked', async () => {
      state.date = "2021-01-01";
      state.loading = false;
      state.birthdays = mockBirthdays;
      render(<BirthdayList />);
      const button = screen.getByTestId(`${IDS.favorite}-${0}`);
      userEvent.click(button);
      // button?.click();
      await waitFor(() => expect(state.favorites.size).toBe(1));
    });
  });
});
