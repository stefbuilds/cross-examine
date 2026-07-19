import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Braces, FileSearch, Gavel, Play, ScrollText } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const slides = [
  { accent: "from-sky-100 to-indigo-100 dark:from-sky-950 dark:to-indigo-950", description: "Resolve the requested revisions and inspect only the changed Python surface.", icon: FileSearch, title: "1. Ingest" },
  { accent: "from-violet-100 to-fuchsia-100 dark:from-violet-950 dark:to-fuchsia-950", description: "Propose schema-constrained behavioral claims. Claims are hypotheses, never verdicts.", icon: Braces, title: "2. Characterize" },
  { accent: "from-rose-100 to-orange-100 dark:from-rose-950 dark:to-orange-950", description: "Capture base behavior, replay the head, hunt adversarial boundaries, and execute repository tests.", icon: Play, title: "3. Cross-examine" },
  { accent: "from-amber-100 to-lime-100 dark:from-amber-950 dark:to-lime-950", description: "Apply the pure deterministic verdict function to grounded execution results.", icon: Gavel, title: "4. Aggregate" },
  { accent: "from-emerald-100 to-cyan-100 dark:from-emerald-950 dark:to-cyan-950", description: "Render every verified or refuted conclusion with its exact command and captured output.", icon: ScrollText, title: "5. Render" },
] as const;

export function VerificationMethodDialog({ triggerLabel = "See how the run works" }: { triggerLabel?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const last = activeIndex === slides.length - 1;
  const first = activeIndex === 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="outline">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">The five-stage verification method</DialogTitle>
        <DialogDescription className="sr-only">Explore the grounded stages in a Cross-Examine run.</DialogDescription>
        <div className="p-3 sm:p-4">
          <div className="overflow-hidden rounded-[var(--radius)]" ref={emblaRef}>
            <div className="flex">
              {slides.map(({ accent, description, icon: Icon, title }) => (
                <div className="min-w-0 flex-[0_0_100%]" key={title}>
                  <div className={cn("grid aspect-[16/9] place-items-center rounded-[var(--radius)] bg-gradient-to-br p-8", accent)}>
                    <div className="grid max-w-sm gap-4 text-center">
                      <div className="mx-auto grid size-14 place-items-center rounded-full border border-foreground/10 bg-background/75 shadow-sm backdrop-blur">
                        <Icon aria-hidden="true" className="size-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {slides.map((slide, index) => (
              <motion.button
                animate={{ opacity: index === activeIndex ? 1 : 0.45, width: index === activeIndex ? 24 : 12 }}
                aria-label={`Go to ${slide.title}`}
                className={cn("h-2 rounded-full", index === activeIndex ? "bg-foreground" : "bg-border")}
                key={slide.title}
                onClick={() => emblaApi?.scrollTo(index)}
                type="button"
              />
            ))}
          </div>
        </div>
        <DialogFooter className="border-t px-4 py-3 sm:justify-between">
          <Button disabled={first} onClick={() => emblaApi?.scrollPrev()} type="button" variant="ghost">Back</Button>
          {last ? (
            <DialogClose asChild><Button type="button">Return to the run</Button></DialogClose>
          ) : (
            <Button onClick={() => emblaApi?.scrollNext()} type="button">Next</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
