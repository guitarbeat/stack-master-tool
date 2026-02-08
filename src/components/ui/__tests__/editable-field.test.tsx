import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditableField } from "../editable-field";

describe("EditableField", () => {
  it("should render display value initially", () => {
    render(
      <EditableField value="Initial Value" onUpdate={vi.fn()} canEdit={true} />,
    );
    expect(screen.getByText("Initial Value")).toBeInTheDocument();
  });

  it("should switch to edit mode when edit button is clicked", async () => {
    render(
      <EditableField
        value="Initial Value"
        onUpdate={vi.fn()}
        canEdit={true}
        ariaLabel="Edit Initial Value"
      />,
    );

    const editButton = screen.getByRole("button", { name: /Edit/i });
    fireEvent.click(editButton);

    const input = screen.getByRole("textbox", { name: "Edit Initial Value" });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Initial Value");
  });

  it("should call onUpdate when saved", async () => {
    const handleUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <EditableField
        value="Old Value"
        onUpdate={handleUpdate}
        canEdit={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));

    const input = screen.getByDisplayValue("Old Value");
    fireEvent.change(input, { target: { value: "New Value" } });

    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    expect(handleUpdate).toHaveBeenCalledWith("New Value");
  });

  it("should show loading state during update", async () => {
    let resolveUpdate: () => void;
    const handleUpdate = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      }),
    );

    render(
      <EditableField
        value="Old Value"
        onUpdate={handleUpdate}
        canEdit={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));

    const input = screen.getByDisplayValue("Old Value");
    fireEvent.change(input, { target: { value: "New Value" } });

    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    // Should show saving state
    expect(
      screen.getByRole("button", { name: /Saving.../i }),
    ).toBeInTheDocument();
    expect(input).toBeDisabled();

    // Finish update
    // @ts-ignore
    resolveUpdate();

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /Saving.../i }),
      ).not.toBeInTheDocument();
    });
  });

  it("should use default aria label if not provided", async () => {
    render(<EditableField value="Value" onUpdate={vi.fn()} canEdit={true} />);

    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
    expect(
      screen.getByRole("textbox", { name: "Edit value" }),
    ).toBeInTheDocument();
  });
});
