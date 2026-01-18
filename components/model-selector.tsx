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
  encoding?: string;
  modelId?: string;
}

const MODEL_GROUPS = {
  "OpenAI": [
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
  ],
  "Meta (Llama)": [
    { value: "Xenova/Llama-3.2-3B-Instruct", label: "Llama 3.2 3B", provider: "Meta", modelId: "Xenova/Llama-3.2-3B-Instruct" },
    { value: "Xenova/Llama-3.2-1B-Instruct", label: "Llama 3.2 1B", provider: "Meta", modelId: "Xenova/Llama-3.2-1B-Instruct" },
    { value: "Xenova/Llama-3.1-8B-Instruct", label: "Llama 3.1 8B", provider: "Meta", modelId: "Xenova/Llama-3.1-8B-Instruct" },
    { value: "Xenova/Llama-3-8B-Instruct", label: "Llama 3 8B", provider: "Meta", modelId: "Xenova/Llama-3-8B-Instruct" },
    { value: "Xenova/Llama-2-7b-chat-hf", label: "Llama 2 7B Chat", provider: "Meta", modelId: "Xenova/Llama-2-7b-chat-hf" },
  ],
  "Mistral AI": [
    { value: "Xenova/Mistral-7B-Instruct-v0.1", label: "Mistral 7B", provider: "Mistral", modelId: "Xenova/Mistral-7B-Instruct-v0.1" },
    { value: "Xenova/Mistral-7B-Instruct-v0.2", label: "Mistral 7B v0.2", provider: "Mistral", modelId: "Xenova/Mistral-7B-Instruct-v0.2" },
    { value: "Xenova/Mixtral-8x7B-Instruct-v0.1", label: "Mixtral 8x7B", provider: "Mistral", modelId: "Xenova/Mixtral-8x7B-Instruct-v0.1" },
  ],
  "Google": [
    { value: "Xenova/gemma-2b", label: "Gemma 2B", provider: "Google", modelId: "Xenova/gemma-2b" },
    { value: "Xenova/gemma-7b", label: "Gemma 7B", provider: "Google", modelId: "Xenova/gemma-7b" },
  ],
  "Microsoft": [
    { value: "Xenova/Phi-3-mini-4k-instruct", label: "Phi-3 Mini 4K", provider: "Microsoft", modelId: "Xenova/Phi-3-mini-4k-instruct" },
    { value: "Xenova/Phi-3.5-mini-instruct", label: "Phi-3.5 Mini", provider: "Microsoft", modelId: "Xenova/Phi-3.5-mini-instruct" },
  ],
  "Qwen (Alibaba)": [
    { value: "Xenova/Qwen1.5-1.8B-Chat", label: "Qwen 1.5 1.8B", provider: "Qwen", modelId: "Xenova/Qwen1.5-1.8B-Chat" },
    { value: "Xenova/Qwen2.5-3B-Instruct", label: "Qwen 2.5 3B", provider: "Qwen", modelId: "Xenova/Qwen2.5-3B-Instruct" },
  ],
};

export const ALL_MODELS = Object.values(MODEL_GROUPS).flat();

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export function ModelSelector({ value, onChange, isLoading }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedModel = useMemo(
    () => ALL_MODELS.find((m) => m.value === value),
    [value]
  );

  const filteredGroups = useMemo(() => {
    if (!search) return MODEL_GROUPS;

    const filtered: Record<string, ModelOption[]> = {};
    for (const [group, models] of Object.entries(MODEL_GROUPS)) {
      const matched = models.filter(
        (m) =>
          m.label.toLowerCase().includes(search.toLowerCase()) ||
          m.provider.toLowerCase().includes(search.toLowerCase())
      );
      if (matched.length > 0) {
        filtered[group] = matched;
      }
    }
    return filtered;
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={isLoading}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selectedModel ? (
            <span className="flex items-center gap-2 truncate">
              <span className="text-xs text-muted-foreground">{selectedModel.provider}</span>
              <span>{selectedModel.label}</span>
            </span>
          ) : (
            "Select a model..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search models..."
              value={search}
              onValueChange={setSearch}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>
            {Object.entries(filteredGroups).map(([group, models]) => (
              <CommandGroup key={group} heading={group}>
                {models.map((model) => (
                  <CommandItem
                    key={model.value}
                    value={model.value}
                    onSelect={() => {
                      onChange(model.value);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === model.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1">{model.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
