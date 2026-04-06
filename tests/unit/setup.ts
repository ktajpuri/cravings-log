import "@testing-library/jest-dom";
import { vi } from "vitest";

// Suppress Next.js internals noise during tests
vi.spyOn(console, "error").mockImplementation(() => {});
