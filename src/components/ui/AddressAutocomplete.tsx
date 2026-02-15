import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useAddressAutocomplete,
  type AddressSuggestion,
  type FormattedAddress
} from '@/hooks/useAddressAutocomplete';

/**
 * Props du composant AddressAutocomplete
 */
interface AddressAutocompleteProps {
  /** Valeur actuelle de l'adresse */
  value: string;
  /** Callback appelé lors du changement de l'adresse */
  onAddressChange: (value: string) => void;
  /** Callback appelé lors de la sélection d'une adresse avec les données complètes */
  onAddressSelect?: (data: FormattedAddress) => void;
  /** Label du champ */
  label?: string;
  /** Placeholder du champ */
  placeholder?: string;
  /** Si le champ est requis */
  required?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
  /** Si le champ est désactivé */
  disabled?: boolean;
  /** Code pays pour limiter la recherche (ex: 'sn' pour Sénégal) */
  countryCode?: string;
  /** Nombre maximum de suggestions */
  maxSuggestions?: number;
  /** Délai de debounce en ms */
  debounceMs?: number;
  /** Nombre minimum de caractères pour déclencher la recherche */
  minChars?: number;
}

/**
 * Composant d'autocomplétion d'adresse utilisant l'API Nominatim
 * 
 * Fonctionnalités:
 * - Liste déroulante dynamique des suggestions
 * - États de chargement avec spinner
 * - Gestion des erreurs réseau
 * - Remplissage automatique des champs associés
 * - Navigation clavier (flèches + entrée)
 * - Fermeture au clic extérieur
 */
const AddressAutocomplete = ({
  value,
  onAddressChange,
  onAddressSelect,
  label = 'Adresse',
  placeholder = 'Commencez à taper une adresse...',
  required = false,
  className,
  disabled = false,
  countryCode = 'sn',
  maxSuggestions = 5,
  debounceMs = 300,
  minChars = 2
}: AddressAutocompleteProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const {
    suggestions,
    isLoading,
    error,
    showDropdown,
    handleInputChange,
    selectSuggestion,
    closeDropdown,
    reset
  } = useAddressAutocomplete({
    countryCode,
    limit: maxSuggestions,
    debounceMs,
    minChars
  });

  // Gestion du clic extérieur pour fermer le dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeDropdown]);

  // Scroll vers l'élément surligné
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedItem = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  /**
   * Gestion du changement de valeur dans l'input
   */
  const handleInputChangeInternal = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onAddressChange(newValue);
    handleInputChange(newValue);
    setHighlightedIndex(-1);
  }, [onAddressChange, handleInputChange]);

  /**
   * Sélection d'une suggestion
   */
  const handleSelectSuggestion = useCallback((suggestion: AddressSuggestion) => {
    const formattedAddress = selectSuggestion(suggestion);
    onAddressChange(formattedAddress.address);
    onAddressSelect?.(formattedAddress);
    setIsFocused(false);
  }, [selectSuggestion, onAddressChange, onAddressSelect]);

  /**
   * Navigation clavier
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        setIsFocused(false);
        break;
    }
  }, [showDropdown, suggestions, highlightedIndex, handleSelectSuggestion, closeDropdown]);

  /**
   * Focus sur l'input
   */
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (value.length >= minChars) {
      handleInputChange(value);
    }
  }, [value, minChars, handleInputChange]);

  /**
   * Effacement du champ
   */
  const handleClear = useCallback(() => {
    onAddressChange('');
    reset();
    inputRef.current?.focus();
  }, [onAddressChange, reset]);

  /**
   * Formate l'affichage d'une suggestion
   */
  const formatSuggestionDisplay = (suggestion: AddressSuggestion): {
    main: string;
    secondary: string
  } => {
    const parts = suggestion.displayName.split(', ');
    const main = parts.slice(0, 2).join(', ');
    const secondary = parts.slice(2).join(', ');
    return { main, secondary };
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <Label className="mb-1.5 block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChangeInternal}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-10',
            error && 'border-red-500 focus-visible:ring-red-500',
            isFocused && showDropdown && 'rounded-b-none border-b-0'
          )}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="address-suggestions"
          aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
        />
        
        {/* Icône d'état */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {error && !isLoading && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          {!isLoading && !error && value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:bg-muted rounded-sm transition-colors"
              aria-label="Effacer l'adresse"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
          {!isLoading && !error && !value && (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Liste déroulante des suggestions */}
      {showDropdown && (
        <ul
          ref={listRef}
          id="address-suggestions"
          role="listbox"
          className={cn(
            'absolute z-50 w-full bg-background border border-t-0 border-input rounded-b-md shadow-lg max-h-60 overflow-y-auto',
            'animate-in fade-in-0 zoom-in-95'
          )}
        >
          {/* État de chargement */}
          {isLoading && (
            <li className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Recherche en cours...
            </li>
          )}

          {/* Message d'erreur */}
          {error && !isLoading && (
            <li className="px-3 py-2 text-sm text-red-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </li>
          )}

          {/* Aucun résultat */}
          {!isLoading && !error && suggestions.length === 0 && value.length >= minChars && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Aucune adresse trouvée pour "{value}"
            </li>
          )}

          {/* Liste des suggestions */}
          {!isLoading && !error && suggestions.map((suggestion, index) => {
            const { main, secondary } = formatSuggestionDisplay(suggestion);
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={suggestion.placeId}
                id={`suggestion-${index}`}
                role="option"
                aria-selected={isHighlighted}
                className={cn(
                  'px-3 py-2 cursor-pointer transition-colors',
                  isHighlighted 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted'
                )}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{main}</p>
                    {secondary && (
                      <p className="text-xs text-muted-foreground truncate">
                        {secondary}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Indicateur de nombre minimum de caractères */}
      {isFocused && value.length > 0 && value.length < minChars && !showDropdown && (
        <p className="text-xs text-muted-foreground mt-1">
          Tapez au moins {minChars} caractères pour rechercher
        </p>
      )}
    </div>
  );
};

export default AddressAutocomplete;