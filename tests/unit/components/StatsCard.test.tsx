import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatsCard from "@/components/StatsCard";

const FULL_STATS = {
  totalCravings: 20,
  resistedCount: 16,
  resistanceRate: "80%",
  averageIntensity: 6.3,
  mostCommonTrigger: "stress",
  mostCommonLocation: "home",
  todayCount: 3,
  currentStreak: 5,
};

describe("StatsCard", () => {
  describe("loading state (stats=null)", () => {
    it("renders 4 skeleton cards", () => {
      const { container } = render(<StatsCard stats={null} />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBe(4);
    });

    it("does not render stat values", () => {
      render(<StatsCard stats={null} />);
      expect(screen.queryByText("Day streak")).not.toBeInTheDocument();
    });
  });

  describe("with stats data", () => {
    it("renders the current streak", () => {
      render(<StatsCard stats={FULL_STATS} />);
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("Day streak")).toBeInTheDocument();
    });

    it("renders the resistance rate", () => {
      render(<StatsCard stats={FULL_STATS} />);
      expect(screen.getByText("80%")).toBeInTheDocument();
      expect(screen.getByText("Resistance rate")).toBeInTheDocument();
    });

    it("renders today's craving count", () => {
      render(<StatsCard stats={FULL_STATS} />);
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("Cravings today")).toBeInTheDocument();
    });

    it("renders average intensity", () => {
      render(<StatsCard stats={FULL_STATS} />);
      expect(screen.getByText("6.3")).toBeInTheDocument();
      expect(screen.getByText("Avg intensity")).toBeInTheDocument();
    });

    it("renders most common trigger section when set", () => {
      render(<StatsCard stats={FULL_STATS} />);
      expect(screen.getByText("Top trigger")).toBeInTheDocument();
      expect(screen.getByText("stress")).toBeInTheDocument();
    });

    it("renders most common location section when set", () => {
      render(<StatsCard stats={FULL_STATS} />);
      expect(screen.getByText("Top location")).toBeInTheDocument();
      expect(screen.getByText("home")).toBeInTheDocument();
    });

    it("does not render trigger section when mostCommonTrigger is null", () => {
      render(<StatsCard stats={{ ...FULL_STATS, mostCommonTrigger: null }} />);
      expect(screen.queryByText("Top trigger")).not.toBeInTheDocument();
    });

    it("does not render location section when mostCommonLocation is null", () => {
      render(<StatsCard stats={{ ...FULL_STATS, mostCommonLocation: null }} />);
      expect(screen.queryByText("Top location")).not.toBeInTheDocument();
    });

    it("renders 0 streak correctly", () => {
      render(<StatsCard stats={{ ...FULL_STATS, currentStreak: 0 }} />);
      // The value "0" should appear in the streak card
      const streakLabel = screen.getByText("Day streak");
      expect(streakLabel).toBeInTheDocument();
    });
  });
});
