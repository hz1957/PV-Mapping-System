import * as React from "react";
import { Check, ChevronsUpDown, Eye } from "lucide-react";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface Option {
  value: string;
  label: string;
  note?: string;
  isUsed?: boolean; // 标记是否已被使用
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  onViewDetail?: () => void; // 新增：查看详情回调
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "选择...",
  searchPlaceholder = "搜索...",
  emptyText = "未找到选项",
  className,
  onViewDetail,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-sm font-mono pr-1 flex-1", className)}
          style={{ borderColor: '#d4d4f7' }}
        >
          <span className={cn("truncate", !value && "text-gray-400")}>
            {value
              ? options.find((option) => option.value === value)?.label || value
              : placeholder}
          </span>
          <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
            {value && onViewDetail && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail();
                }}
                className="h-6 w-6 rounded hover:bg-accent flex items-center justify-center transition-colors"
                title="查看详情"
              >
                <Eye className="h-3.5 w-3.5" style={{ color: '#5b5fc7' }} />
              </button>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isUsedField = option.label.includes('(已使用)') || option.label.includes('(已占用)');
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    className={cn(
                      "font-mono text-sm",
                      isUsedField && "bg-amber-50/50 hover:bg-amber-100/50"
                    )}
                    style={isUsedField ? { borderLeft: '3px solid #f59e0b' } : {}}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1">
                      <span className={isUsedField ? 'text-amber-700' : ''}>{option.label}</span>
                      {option.note && (
                        <span className={cn(
                          "text-xs",
                          isUsedField ? "text-amber-600" : "text-muted-foreground"
                        )}>
                          {option.note}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}