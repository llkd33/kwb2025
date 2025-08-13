import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const LanguageSelector = ({ variant = "select" }: { variant?: "select" | "popover" }) => {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const languages = [
    { 
      code: 'ko' as const, 
      name: '한국어', 
      nativeName: '한국어',
      flag: '🇰🇷',
      region: 'Korea'
    },
    { 
      code: 'en' as const, 
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸',
      region: 'Global'
    },
    { 
      code: 'ja' as const, 
      name: '日本語', 
      nativeName: '日本語',
      flag: '🇯🇵',
      region: 'Japan'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  if (variant === "popover") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-auto justify-between bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{currentLanguage?.flag}</span>
              <span className="text-sm hidden sm:inline">{currentLanguage?.nativeName}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="end">
          <div className="space-y-1">
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
              {t('common.select_language', 'Select Language')}
            </div>
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-3 hover:bg-accent/50 transition-colors",
                  language === lang.code && "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{lang.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">{lang.nativeName}</div>
                      <div className="text-xs text-muted-foreground">{lang.region}</div>
                    </div>
                  </div>
                  {language === lang.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Select value={language} onValueChange={(value: 'ko' | 'en' | 'ja') => setLanguage(value)}>
      <SelectTrigger className="w-auto min-w-[120px] bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 transition-all duration-200">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{currentLanguage?.flag}</span>
          <span className="text-sm hidden sm:inline">{currentLanguage?.nativeName}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-base">{lang.flag}</span>
              <div className="text-left">
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-xs text-muted-foreground">{lang.region}</div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};