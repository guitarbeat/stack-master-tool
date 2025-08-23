import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card"

export function EarthyCardExample() {
  return (
    <Card variant="earth" className="w-[350px]">
      <CardHeader>
        <CardTitle>Earthy Card</CardTitle>
        <CardDescription>Example of the earth-toned card variant.</CardDescription>
      </CardHeader>
      <CardContent>
        Use the <code>variant="earth"</code> prop to switch to the earthy palette.
      </CardContent>
    </Card>
  )
}
