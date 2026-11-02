import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export interface FormField {
  label: string
  value: string
  readOnly?: boolean
}

export function FormBlockCard({
  title,
  description,
  fields,
}: {
  title: string
  description?: string
  fields: FormField[]
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.label}>
            <Label className="text-[11px] text-muted-foreground">{f.label}</Label>
            <Input defaultValue={f.value} readOnly={f.readOnly} className="mt-1 h-8 text-sm" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
