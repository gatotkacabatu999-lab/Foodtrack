import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FoodItem, InsertFoodItem } from "@shared/schema";
import { formatDateForInput } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InsertFoodItem | (InsertFoodItem & { id: string })) => void;
  editingItem?: FoodItem | null;
  existingItems?: FoodItem[];
}

const categories = [
  { value: "None", label: "None" },
  { value: "LSSD", label: "LSSD" },
  { value: "GM", label: "GM" },
  { value: "RTE", label: "RTE" },
];

const itemSuggestions = [
  "Bitagen",
  "Samyang", 
  "Begga",
  "Lobster",
  "Lobster Green",
  "Kit Kat",
  "Kinder Bueno",
  "Rokeby (Shell)",
  "Orihiro (Shell)",
  "Potato Stick"
];

export default function AddEditModal({
  isOpen,
  onClose,
  onSave,
  editingItem,
  existingItems = [],
}: AddEditModalProps) {
  const [formData, setFormData] = useState<InsertFoodItem>({
    name: "",
    expiryDate: new Date(),
    category: "None",
    notes: "",
  });
  const [open, setOpen] = useState(false);
  
  // Filter suggestions based on input and show dropdown when there are matches
  const filteredSuggestions = itemSuggestions.filter((item) =>
    item.toLowerCase().includes(formData.name.toLowerCase()) && formData.name.trim() !== ""
  );
  
  // Show dropdown when there are filtered suggestions and input has focus
  const shouldShowDropdown = filteredSuggestions.length > 0 && formData.name.trim() !== "";

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        expiryDate: editingItem.expiryDate,
        category: editingItem.category,
        notes: editingItem.notes || "",
      });
    } else {
      setFormData({
        name: "",
        expiryDate: new Date(),
        category: "None",
        notes: "",
      });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure expiryDate is a proper Date object
    const submitData = {
      ...formData,
      expiryDate: new Date(formData.expiryDate),
    };

    if (editingItem) {
      onSave({ ...submitData, id: editingItem.id });
    } else {
      onSave(submitData);
    }

    onClose();
  };

  const handleInputChange = (field: keyof InsertFoodItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "expiryDate" ? new Date(value) : value,
    }));
    
    // Auto-open dropdown when typing in name field and there are suggestions
    if (field === "name") {
      const newFilteredSuggestions = itemSuggestions.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase()) && value.trim() !== ""
      );
      setOpen(newFilteredSuggestions.length > 0 && value.trim() !== "");
    }
  };

  // Validation logic
  const isDuplicateItem = () => {
    const currentExpiryDate = new Date(formData.expiryDate);
    currentExpiryDate.setHours(0, 0, 0, 0);

    if (!editingItem) {
      // For new items, check if both name and expiry date already exist together
      return existingItems.some((item) => {
        const itemExpiryDate = new Date(item.expiryDate);
        itemExpiryDate.setHours(0, 0, 0, 0);
        return (
          item.name.toLowerCase().trim() ===
            formData.name.toLowerCase().trim() &&
          itemExpiryDate.getTime() === currentExpiryDate.getTime()
        );
      });
    } else {
      // For editing, check if both name and expiry date exist in other items (not the current one)
      return existingItems.some((item) => {
        if (item.id === editingItem.id) return false;
        const itemExpiryDate = new Date(item.expiryDate);
        itemExpiryDate.setHours(0, 0, 0, 0);
        return (
          item.name.toLowerCase().trim() ===
            formData.name.toLowerCase().trim() &&
          itemExpiryDate.getTime() === currentExpiryDate.getTime()
        );
      });
    }
  };

  const isPastDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(formData.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
  };

  const isFormValid = () => {
    return formData.name.trim() !== "" && !isDuplicateItem() && !isPastDate();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 animate-fade-in p-4"
      data-testid="add-edit-modal"
    >
      <div className="glass-dark rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground" data-testid="modal-title">
            {editingItem ? "Edit Food Item" : "Add Food Item"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-background/50"
            data-testid="close-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <Label
              htmlFor="itemName"
              className="block text-sm font-medium mb-2"
            >
              Item Name
            </Label>
            <div className="relative">
              <Input
                id="itemName"
                type="text"
                placeholder="Enter food item name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onFocus={() => {
                  const newFilteredSuggestions = itemSuggestions.filter((item) =>
                    item.toLowerCase().includes(formData.name.toLowerCase()) && formData.name.trim() !== ""
                  );
                  setOpen(newFilteredSuggestions.length > 0 && formData.name.trim() !== "");
                }}
                onBlur={() => {
                  // Delay closing to allow clicking on suggestions
                  setTimeout(() => setOpen(false), 150);
                }}
                required
                className={`bg-input border-border ${isDuplicateItem() ? "border-destructive" : ""}`}
                data-testid="input-name"
              />
              {open && shouldShowDropdown && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 shadow-md">
                  {filteredSuggestions.map((item) => (
                    <div
                      key={item}
                      className="relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        handleInputChange("name", item);
                        setOpen(false);
                      }}
                      onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {isDuplicateItem() && (
              <p className="text-xs text-destructive mt-1">
                This item name and expiry date combination already exists
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="itemDate"
              className="block text-sm font-medium mb-2"
            >
              Expiration Date
            </Label>
            <Input
              id="itemDate"
              type="date"
              value={formatDateForInput(formData.expiryDate)}
              onChange={(e) => handleInputChange("expiryDate", e.target.value)}
              required
              className={`bg-input border-border ${isPastDate() || isDuplicateItem() ? "border-destructive" : ""}`}
              data-testid="input-date"
            />
            {isPastDate() && (
              <p className="text-xs text-destructive mt-1">
                Expiry date cannot be in the past
              </p>
            )}
            {isDuplicateItem() && (
              <p className="text-xs text-destructive mt-1">
                This item name and expiry date combination already exists
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="itemCategory"
              className="block text-sm font-medium mb-2"
            >
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger
                className="bg-input border-border"
                data-testid="select-category"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor="itemNotes"
              className="block text-sm font-medium mb-2"
            >
              Notes (Optional)
            </Label>
            <Textarea
              id="itemNotes"
              placeholder="Add any notes..."
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={2}
              className="bg-input border-border resize-none"
              data-testid="input-notes"
            />
          </div>

          <div className="flex space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-primary hover:bg-primary/90"
              disabled={!isFormValid()}
              data-testid="save-button"
            >
              {editingItem ? "Update Item" : "Save Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
