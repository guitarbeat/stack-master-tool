import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function CardAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="fruits">
        <AccordionTrigger>Fruits</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-background text-foreground">
              <CardHeader>
                <CardTitle>Apple</CardTitle>
              </CardHeader>
              <CardContent>Crisp and sweet.</CardContent>
            </Card>
            <Card className="bg-background text-foreground">
              <CardHeader>
                <CardTitle>Banana</CardTitle>
              </CardHeader>
              <CardContent>Rich in potassium.</CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="vegetables">
        <AccordionTrigger>Vegetables</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-background text-foreground">
              <CardHeader>
                <CardTitle>Carrot</CardTitle>
              </CardHeader>
              <CardContent>Good for eyesight.</CardContent>
            </Card>
            <Card className="bg-background text-foreground">
              <CardHeader>
                <CardTitle>Broccoli</CardTitle>
              </CardHeader>
              <CardContent>Packed with vitamins.</CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default CardAccordion;
