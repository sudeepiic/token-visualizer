import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface ModelOption {
  value: string;
  label: string;
  provider: string;
  encoding: string;
}

const OPENAI_MODELS: ModelOption[] = [
  { value: "gpt-4o", label: "GPT-4o", provider: "OpenAI", encoding: "o200k_base" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI", encoding: "o200k_base" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "OpenAI", encoding: "cl100k_base" },
  { value: "gpt-4", label: "GPT-4", provider: "OpenAI", encoding: "cl100k_base" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", provider: "OpenAI", encoding: "cl100k_base" },
  { value: "gpt-3.5-turbo-16k", label: "GPT-3.5 Turbo 16K", provider: "OpenAI", encoding: "cl100k_base" },
  { value: "text-davinci-003", label: "Davinci-003", provider: "OpenAI", encoding: "r50k_base" },
  { value: "text-davinci-002", label: "Davinci-002", provider: "OpenAI", encoding: "r50k_base" },
  { value: "code-davinci-002", label: "Code Davinci-002", provider: "OpenAI", encoding: "p50k_base" },
  { value: "code-cushman-001", label: "Code Cushman-001", provider: "OpenAI", encoding: "p50k_base" },
  { value: "davinci", label: "Davinci", provider: "OpenAI", encoding: "r50k_base" },
  { value: "gpt2", label: "GPT-2", provider: "OpenAI", encoding: "gpt2" },
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

const providerColors: Record<string, string> = {
  "OpenAI": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function ModelSelectorBase({ value, onChange, isLoading }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedModel = useMemo(
    () => OPENAI_MODELS.find((m) => m.value === value),
    [value]
  );

  const filteredModels = useMemo(() => {
    if (!search) return OPENAI_MODELS;
    return OPENAI_MODELS.filter(
      (m) =>
        m.label.toLowerCase().includes(search.toLowerCase()) ||
        m.provider.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={isLoading}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border-2",
            "bg-muted/30 hover:bg-muted/50",
            "px-4 py-2.5 text-sm",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            open && "ring-2 ring-ring ring-offset-2 ring-offset-background"
          )}
        >
          {selectedModel ? (
            <span className="flex items-center gap-2.5 truncate">
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-md font-medium border shrink-0",
                  providerColors[selectedModel.provider]
                )}
              >
                {selectedModel.provider}
              </span>
              <span className="font-medium truncate">{selectedModel.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select a model...</span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 transition-opacity duration-200 group-hover:opacity-100" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command className="rounded-xl border-2 border-border/50 bg-muted/30 backdrop-blur-sm">
          <div className="flex items-center border-b border-border/50 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search models..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-0"
            />
          </div>
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
              No models found.
            </CommandEmpty>
            <CommandGroup
              heading={
                <span className="text-xs font-semibold text-muted-foreground/80 px-2 py-1.5">
                  OpenAI (tiktoken)
                </span>
              }
            >
              {filteredModels.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={() => {
                    onChange(model.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="rounded-md mx-1 my-0.5 cursor-pointer transition-colors"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 transition-opacity duration-200",
                      value === model.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex-1 truncate">{model.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const ModelSelector = React.memo(ModelSelectorBase);
