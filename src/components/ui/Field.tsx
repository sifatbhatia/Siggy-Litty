export interface FieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
  autoComplete?: string;
}

export function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  hint,
  rows,
  autoComplete,
}: FieldProps) {
  return (
    <div className="signet-field">
      <label htmlFor={id} className="signet-field__label">
        {label}
      </label>
      {rows ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="signet-field__input signet-field__textarea"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="signet-field__input"
        />
      )}
      {hint && <span className="signet-field__hint">{hint}</span>}
    </div>
  );
}
