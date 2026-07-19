import { useState } from 'react';
import type { FormEvent } from 'react';
import type { WorkflowQuestion } from '../../../services/ai/workflows';
import { Upload, Check } from 'lucide-react';

interface DynamicFormProps {
  questions: WorkflowQuestion[];
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
  loading?: boolean;
}

export default function DynamicForm({ questions, initialValues = {}, onSubmit, loading }: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const q of questions) {
      if (q.is_required) {
        const val = values[q.key];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[q.key] = `${q.label} is required`;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(values);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {questions.map((q) => (
        <div key={q.key}>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {q.label}
            {q.is_required && <span className="text-error ml-0.5">*</span>}
          </label>
          {q.description && <p className="text-xs text-text-muted mb-1.5">{q.description}</p>}
          <FieldRenderer question={q} value={values[q.key]} onChange={(v) => handleChange(q.key, v)} />
          {errors[q.key] && <p className="text-xs text-error mt-1">{errors[q.key]}</p>}
        </div>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? 'Processing...' : 'Continue'}
        {!loading && <Check size={16} />}
      </button>
    </form>
  );
}

function FieldRenderer({ question, value, onChange }: { question: WorkflowQuestion; value: unknown; onChange: (v: unknown) => void }) {
  const placeholder = question.placeholder || '';

  switch (question.type) {
    case 'text':
    case 'email':
    case 'phone':
      return (
        <input
          type={question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 'text'}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      );

    case 'textarea':
      return (
        <textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      );

    case 'number':
    case 'currency':
      return (
        <div className="relative">
          {question.type === 'currency' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
          )}
          <input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={placeholder}
            className={`w-full border border-border rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${question.type === 'currency' ? 'pl-7 pr-4' : 'px-4'}`}
          />
        </div>
      );

    case 'date':
      return (
        <input
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      );

    case 'time':
      return (
        <input
          type="time"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      );

    case 'select':
      return <SelectField question={question} value={value} onChange={onChange} />;

    case 'radio':
      return (
        <div className="space-y-2">
          {question.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-background transition-colors">
              <input
                type="radio"
                name={question.key}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="accent-primary"
              />
              <span className="text-sm text-text-primary">{opt}</span>
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-background transition-colors">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="accent-primary"
          />
          <span className="text-sm text-text-primary">{question.description || 'Yes'}</span>
        </label>
      );

    case 'multi_select': {
      const selected = (Array.isArray(value) ? value : []) as string[];
      return (
        <div className="space-y-2">
          {question.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-background transition-colors">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => {
                  onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
                }}
                className="accent-primary"
              />
              <span className="text-sm text-text-primary">{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    case 'file':
    case 'image':
      return (
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
          <Upload size={24} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-secondary mb-2">Click to upload or drag and drop</p>
          <p className="text-xs text-text-muted">
            {question.type === 'image' ? 'PNG, JPG, GIF up to 10MB' : 'PDF, DOC, XLS, CSV up to 10MB'}
          </p>
          <input
            type="file"
            accept={question.type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx,.csv'}
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      );

    case 'slider':
      const min = (question.validation?.min as number) || 0;
      const max = (question.validation?.max as number) || 100;
      return (
        <div>
          <input
            type="range"
            min={min}
            max={max}
            value={(value as number) ?? min}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>{min}</span>
            <span className="font-medium text-text-primary">{(value as number) ?? min}</span>
            <span>{max}</span>
          </div>
        </div>
      );

    case 'rating':
      const ratingMax = (question.validation?.max as number) || 5;
      const ratingVal = (value as number) || 0;
      return (
        <div className="flex gap-1">
          {Array.from({ length: ratingMax }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1)}
              className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                i < ratingVal ? 'bg-primary text-white border-primary' : 'border-border text-text-muted hover:border-primary/40'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      );

    case 'tags':
      return <TagsField value={value} onChange={onChange} />;

    default:
      return (
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      );
  }
}

function SelectField({ question, value, onChange }: { question: WorkflowQuestion; value: unknown; onChange: (v: unknown) => void }) {
  const options = question.options || [];
  const isOtherSelected = value && !options.includes(value as string);
  const displayValue = isOtherSelected ? 'Other' : ((value as string) || '');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__custom__') {
      onChange('');
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div>
      <select
        value={displayValue}
        onChange={handleChange}
        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-background text-text-primary"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        {!options.includes('Other') && <option value="Other">Other</option>}
        <option value="__custom__">Type custom...</option>
      </select>
      {(isOtherSelected || displayValue === '') && (
        <input
          type="text"
          value={isOtherSelected ? (value as string) : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer..."
          className="mt-2 w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      )}
    </div>
  );
}

function TagsField({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const tags = (Array.isArray(value) ? value : []) as string[];
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onChange([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="Add a tag..."
          className="flex-1 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button type="button" onClick={addTag} className="px-3 py-2 border border-border rounded-xl text-sm hover:bg-background">Add</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 bg-primary-light text-primary px-2.5 py-1 rounded-lg text-xs font-medium">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="hover:text-primary-hover">&times;</button>
          </span>
        ))}
      </div>
    </div>
  );
}
