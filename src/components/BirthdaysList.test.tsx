import { render, screen, waitFor } from "@testing-library/react";
import { BirthdayList } from "./BirthdaysList";

const mockData = {
  birthdays: {
    births: [
      {
        text: "test",
        pages: [
          {
            extract: "test",
            content_urls: {
              desktop: {
                page: "test",
              },
            },
            thumbnail: {
              source: "test",
            },
          },
        ],
      },
    ],
  },
  loading: false,
  month: "01",
  day: "01",
};
// mock useBirthdays hook
jest.mock("../data/useBirthdays", () => ({
  ...jest.requireActual("../data/useBirthdays"),
  useBirthdays: () => mockData,
}));

describe("BirthdayList", () => {
  it("renders component", () => {
    render(<BirthdayList />);
    expect(
      screen.queryByTestId("birthdays-list-container")
    ).toBeInTheDocument();
  });

  it("renders list", () => {
    render(<BirthdayList />);
    expect(screen.queryByTestId("birthdays-list")).toBeInTheDocument();
  });

  it("renders list title", () => {
    render(<BirthdayList />);
    expect(screen.queryByTestId("birthdays-list-title")).toBeInTheDocument();
  });

  it("renders list items", () => {
    render(<BirthdayList />);
    expect(screen.queryByTestId("birthdays-list-item")).toBeInTheDocument();
  });

  it("does not render loader when loading is true", () => {
    mockData.loading = false;
    render(<BirthdayList />);
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
  });

  it("renders loader when loading is true", () => {
    mockData.loading = true;
    render(<BirthdayList />);
    expect(screen.queryByTestId("loader")).toBeInTheDocument();
  });

  it("does not render list items id loading is true", () => {
    mockData.loading = true;
    render(<BirthdayList />);
    expect(screen.queryByTestId("birthdays-list")).not.toBeInTheDocument();
  });
  // etc... This is sufficient for this exercise
});
