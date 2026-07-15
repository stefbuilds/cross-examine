// Visual grammar adapted from the user-supplied 21st.dev sidebar News stack.
// Cross-Examine keeps the stacked dismissible cards while using internal
// React Router links and product-use guidance.
import * as React from "react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface NewsArticle {
  href: string;
  title: string;
  summary: string;
  image?: string;
  navId?: string;
}

const OFFSET_FACTOR = 4;
const SCALE_FACTOR = 0.03;
const OPACITY_FACTOR = 0.1;

export function News({
  articles,
  onArticleSelect,
}: {
  articles: NewsArticle[];
  onArticleSelect?: (article: NewsArticle) => void;
}) {
  const [dismissedNews, setDismissedNews] = React.useState<string[]>([]);
  const cards = articles.filter(({ href }) => !dismissedNews.includes(href));
  const cardCount = cards.length;
  const [showCompleted, setShowCompleted] = React.useState(cardCount > 0);

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (cardCount === 0) {
      timeout = setTimeout(() => setShowCompleted(false), 2700);
    }
    return () => clearTimeout(timeout);
  }, [cardCount]);

  if (!cards.length && !showCompleted) return null;

  return (
    <section aria-label="How to use Cross-Examine" className="group overflow-hidden px-3 pb-3 pt-8" data-active={cardCount !== 0}>
      <p className="mb-3 px-1 font-heading text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        How to use Cross-Examine
      </p>
      <div className="relative h-60 w-full">
        {[...cards].reverse().map((article, idx) => {
          const stackDepth = cardCount - (idx + 1);
          return (
            <div
              key={article.href}
              className={cn(
                "absolute left-0 top-0 flex size-full flex-col justify-end scale-[var(--scale)] transition-[opacity,transform] duration-200",
                stackDepth > 3
                  ? [
                      "opacity-0 sm:group-hover:translate-y-[var(--y)] sm:group-hover:opacity-[var(--opacity)]",
                      "sm:group-has-[*[data-dragging=true]]:translate-y-[var(--y)] sm:group-has-[*[data-dragging=true]]:opacity-[var(--opacity)]",
                    ]
                  : "translate-y-[var(--y)] opacity-[var(--opacity)]",
              )}
              style={
                {
                  "--y": `-${stackDepth * OFFSET_FACTOR}%`,
                  "--scale": 1 - stackDepth * SCALE_FACTOR,
                  "--opacity": stackDepth >= 6 ? 0 : 1 - stackDepth * OPACITY_FACTOR,
                } as React.CSSProperties
              }
            >
              <NewsCard
                article={article}
                hideContent={stackDepth > 2}
                active={idx === cardCount - 1}
                onDismiss={() => setDismissedNews([article.href, ...dismissedNews.slice(0, 50)])}
                onOpen={() => onArticleSelect?.(article)}
              />
            </div>
          );
        })}
        <div aria-hidden className="pointer-events-none invisible">
          <NewsCard article={{ href: "/", title: "Title", summary: "Description" }} />
        </div>
        {showCompleted && !cardCount && (
          <div
            className="animate-slide-up-fade absolute inset-0 flex size-full flex-col items-center justify-center gap-3 [animation-duration:1s]"
            style={{ "--offset": "10px" } as React.CSSProperties}
          >
            <div className="animate-fade-in absolute inset-0 rounded-lg border border-border [animation-delay:2.3s] [animation-direction:reverse] [animation-duration:0.2s]" />
            <AnimatedLogo className="w-1/3" />
            <span className="animate-fade-in text-xs font-medium text-muted-foreground [animation-delay:2.3s] [animation-direction:reverse] [animation-duration:0.2s]">
              You have the basics.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function NewsCard({
  article,
  onDismiss,
  hideContent,
  active,
  onOpen,
}: {
  article: NewsArticle;
  onDismiss?: () => void;
  hideContent?: boolean;
  active?: boolean;
  onOpen?: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef({
    start: 0,
    delta: 0,
    maxDelta: 0,
  });
  const animation = React.useRef<Animation | undefined>(undefined);
  const [dragging, setDragging] = React.useState(false);

  function onDragMove(event: PointerEvent) {
    if (!ref.current) return;
    const dx = event.clientX - drag.current.start;
    drag.current.delta = dx;
    drag.current.maxDelta = Math.max(drag.current.maxDelta, Math.abs(dx));
    ref.current.style.setProperty("--dx", dx.toString());
  }

  function dismiss() {
    if (!ref.current) return;
    const cardWidth = ref.current.getBoundingClientRect().width;
    const translateX = Math.sign(drag.current.delta || 1) * cardWidth;
    animation.current = ref.current.animate(
      { opacity: 0, transform: `translateX(${translateX}px)` },
      { duration: 150, easing: "ease-in-out", fill: "forwards" },
    );
    animation.current.onfinish = () => onDismiss?.();
  }

  function unbindListeners() {
    document.removeEventListener("pointermove", onDragMove);
  }

  function stopDragging(cancelled: boolean) {
    if (!ref.current) return;
    unbindListeners();
    document.removeEventListener("pointerup", onDragEnd);
    document.removeEventListener("pointercancel", onDragCancel);
    setDragging(false);

    const dx = drag.current.delta;
    if (Math.abs(dx) > ref.current.clientWidth / (cancelled ? 2 : 3)) {
      dismiss();
      return;
    }

    animation.current = ref.current.animate(
      { transform: "translateX(0)" },
      { duration: 150, easing: "ease-in-out" },
    );
    animation.current.onfinish = () => ref.current?.style.setProperty("--dx", "0");
    drag.current = { start: 0, delta: 0, maxDelta: 0 };
  }

  function onDragEnd() {
    stopDragging(false);
  }

  function onDragCancel() {
    stopDragging(true);
  }

  function bindListeners() {
    document.addEventListener("pointermove", onDragMove);
    document.addEventListener("pointerup", onDragEnd);
    document.addEventListener("pointercancel", onDragCancel);
  }

  const onPointerDown = (event: React.PointerEvent) => {
    if (!active || !ref.current || animation.current?.playState === "running") return;

    bindListeners();
    setDragging(true);
    drag.current.start = event.clientX;
    drag.current.delta = 0;
    drag.current.maxDelta = 0;
    ref.current.style.setProperty("--w", ref.current.clientWidth.toString());
  };

  return (
    <div
      ref={ref}
      className="translate-x-[calc(var(--dx)*1px)] rotate-[calc(var(--dx)*0.05deg)] opacity-[calc(1-max(var(--dx),-1*var(--dx))/var(--w)/2)]"
      data-dragging={dragging}
      onPointerDown={onPointerDown}
      style={{ "--dx": "0", "--w": "1" } as React.CSSProperties}
    >
      <Card className="select-none gap-2 rounded-lg p-3 text-[0.8125rem] transition-shadow data-[dragging=true]:shadow-md">
        <div className={cn(hideContent && "invisible")}>
          <div className="flex flex-col gap-1">
            <span className="line-clamp-1 font-medium text-foreground">{article.title}</span>
            <p className="line-clamp-2 h-10 leading-5 text-muted-foreground">{article.summary}</p>
          </div>
          <div className="relative mt-3 aspect-[16/9] w-full shrink-0 overflow-hidden rounded border border-border bg-muted">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--color-primary),transparent_35%),linear-gradient(135deg,var(--color-muted),var(--color-card))]" />
            <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground">
              {article.image ?? "Guide"}
            </span>
          </div>
          <div
            className={cn(
              "h-0 overflow-hidden opacity-0 transition-[height,opacity] duration-200",
              "sm:group-has-[*[data-dragging=true]]:h-7 sm:group-has-[*[data-dragging=true]]:opacity-100 sm:group-hover:group-data-[active=true]:h-7 sm:group-hover:group-data-[active=true]:opacity-100",
            )}
          >
            <div className="flex items-center justify-between pt-3 text-xs">
              <Link
                aria-label={`Open ${article.title}`}
                className="font-medium text-muted-foreground transition-colors duration-75 hover:text-foreground"
                onClick={onOpen}
                to={article.href}
              >
                Open
              </Link>
              <button
                className="text-muted-foreground transition-colors duration-75 hover:text-foreground"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  dismiss();
                }}
                type="button"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AnimatedLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="text-muted-foreground" fill="none" viewBox="0 0 48 21" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        clipRule="evenodd"
        d="M12 1H15V20H12V18.7455C10.8662 19.5362 9.48733 20 8.00016 20C4.13408 20 1 16.866 1 13C1 9.13401 4.13408 6 8.00016 6C9.48733 6 10.8662 6.46375 12 7.25452V1ZM8 16.9998C10.2091 16.9998 12 15.209 12 12.9999C12 10.7908 10.2091 9 8 9C5.79086 9 4 10.7908 4 12.9999C4 15.209 5.79086 16.9998 8 16.9998Z"
        fillRule="evenodd"
        stroke="currentColor"
        strokeDasharray="63"
        strokeLinecap="round"
      />
      <path
        clipRule="evenodd"
        d="M17 6H20V13C20 14.0608 20.4215 15.0782 21.1716 15.8283C21.9217 16.5784 22.9391 16.9998 24 16.9998C25.0609 16.9998 26.0783 16.5784 26.8284 15.8283C27.5785 15.0782 28 14.0608 28 13V6H31V13H31.0003C31.0003 16.866 27.8662 20 24.0002 20C20.1341 20 17 16.866 17 13V6Z"
        fillRule="evenodd"
        stroke="currentColor"
        strokeDasharray="69"
        strokeLinecap="round"
      />
      <path
        clipRule="evenodd"
        d="M33 1H36V7.25474C37.1339 6.46383 38.5128 6 40.0002 6C43.8662 6 47.0003 9.13401 47.0003 13C47.0003 16.866 43.8662 20 40.0002 20C36.1341 20 33 16.866 33 13V1ZM40 16.9998C42.2091 16.9998 44 15.209 44 12.9999C44 10.7908 42.2091 9 40 9C37.7909 9 36 10.7908 36 12.9999C36 15.209 37.7909 16.9998 40 16.9998Z"
        fillRule="evenodd"
        stroke="currentColor"
        strokeDasharray="60"
        strokeLinecap="round"
      />
    </svg>
  );
}
