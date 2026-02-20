import { CustomField } from '../backend';

interface CustomFieldDisplayProps {
  fields: CustomField[];
}

export default function CustomFieldDisplay({ fields }: CustomFieldDisplayProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Custom Fields</h4>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((field, index) => (
          <div key={index} className="space-y-1">
            <p className="text-xs text-muted-foreground">{field.name}</p>
            <p className="text-sm font-medium">{field.value || 'Not set'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
