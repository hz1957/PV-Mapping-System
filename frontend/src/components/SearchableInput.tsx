import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Check, ChevronDown } from 'lucide-react';

interface SearchableInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export function SearchableInput({
  value,
  onChange,
  options,
  placeholder,
  className,
}: SearchableInputProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // 同步外部 value 变化
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 模糊搜索过滤
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (selectedValue: string) => {
    setSearchValue(selectedValue);
    onChange(selectedValue);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onChange(newValue);
    setOpen(true); // 输入时打开下拉
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={searchValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        className={`h-7 text-xs border-primary/30 focus:border-primary pr-8 ${className || ''}`}
        placeholder={placeholder}
      />
      {filteredOptions.length > 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
          {filteredOptions.length}项
        </div>
      )}
      
      {open && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
          {filteredOptions.slice(0, 10).map((option) => (
            <div
              key={option}
              onClick={() => handleSelect(option)}
              className="px-3 py-1.5 text-xs cursor-pointer hover:bg-accent flex items-center gap-2 transition-colors"
            >
              <Check
                className={`size-3 flex-shrink-0 ${
                  value === option ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <span className="flex-1">{option}</span>
            </div>
          ))}
          {filteredOptions.length > 10 && (
            <div className="px-3 py-1.5 text-[10px] text-muted-foreground text-center border-t bg-muted/20">
              还有 {filteredOptions.length - 10} 项...
            </div>
          )}
        </div>
      )}
    </div>
  );
}