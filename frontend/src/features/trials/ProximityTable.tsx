"use client";

// Trial proximity table.
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

const springs = { fast: { type: "spring" as const, duration: 0.08, bounce: 0 } };
const fontWeights = { normal: "'wght' 400", semibold: "'wght' 550" };

type ItemRect = { top: number; height: number; left: number; width: number };

function useProximityHover<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
) {
  const itemsRef = useRef(new Map<number, HTMLElement>());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [itemRects, setItemRects] = useState<ItemRect[]>([]);
  const itemRectsRef = useRef<ItemRect[]>([]);
  const sessionRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const registerItem = useCallback((index: number, element: HTMLElement | null) => {
    if (element) itemsRef.current.set(index, element);
    else itemsRef.current.delete(index);
  }, []);

  const measureItems = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const rects: ItemRect[] = [];
    itemsRef.current.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      rects[index] = {
        top: rect.top - containerRect.top + container.scrollTop - container.clientTop,
        height: rect.height,
        left: rect.left - containerRect.left + container.scrollLeft - container.clientLeft,
        width: rect.width,
      };
    });
    itemRectsRef.current = rects;
    setItemRects(rects);
  }, [containerRef]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const mouseY = event.clientY;
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const container = containerRef.current;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        let closestIndex: number | null = null;
        let closestDistance = Infinity;
        for (let index = 0; index < itemRectsRef.current.length; index += 1) {
          const rect = itemRectsRef.current[index];
          if (!rect) continue;
          const start =
            containerRect.top + container.clientTop + rect.top - container.scrollTop;
          const distance = Math.abs(mouseY - (start + rect.height / 2));
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
        setActiveIndex(closestIndex);
      });
    },
    [containerRef],
  );

  const handleMouseLeave = useCallback(() => {
    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    setActiveIndex(null);
  }, []);

  useEffect(
    () => () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    },
    [],
  );

  return {
    activeIndex,
    itemRects,
    sessionRef,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: () => {
        sessionRef.current += 1;
      },
      onMouseLeave: handleMouseLeave,
    },
    registerItem,
    measureItems,
  };
}

type TableContextValue = {
  registerItem: (index: number, element: HTMLElement | null) => void;
  activeIndex: number | null;
};

const TableContext = createContext<TableContextValue | null>(null);

type TableProps = HTMLAttributes<HTMLTableElement> & { children: ReactNode };

export const ProximityTable = forwardRef<HTMLTableElement, TableProps>(
  ({ children, className, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { activeIndex, itemRects, sessionRef, handlers, registerItem, measureItems } =
      useProximityHover(containerRef);
    useEffect(() => {
      measureItems();
    }, [measureItems, children]);

    const activeRect = activeIndex === null ? null : itemRects[activeIndex];

    return (
      <TableContext.Provider value={{ registerItem, activeIndex }}>
        <div ref={containerRef} className="relative overflow-x-auto" {...handlers}>
          <AnimatePresence>
            {activeRect && (
              <motion.div
                key={sessionRef.current}
                className="pointer-events-none absolute z-0 bg-neutral-200/40 dark:bg-neutral-800/25"
                initial={{ opacity: 0, top: activeRect.top, left: activeRect.left, width: activeRect.width, height: activeRect.height }}
                animate={{ opacity: 1, top: activeRect.top, left: activeRect.left, width: activeRect.width, height: activeRect.height }}
                exit={{ opacity: 0, transition: { duration: 0.06 } }}
                transition={{ ...springs.fast, opacity: { duration: 0.08 } }}
              />
            )}
          </AnimatePresence>
          <table ref={ref} className={cn("relative w-full border-collapse text-[13px]", className)} {...props}>
            {children}
          </table>
        </div>
      </TableContext.Provider>
    );
  },
);
ProximityTable.displayName = "ProximityTable";

export const ProximityTableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => <thead ref={ref} className={cn("", className)} {...props} />);
ProximityTableHeader.displayName = "ProximityTableHeader";

export const ProximityTableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => <tbody ref={ref} className={cn("", className)} {...props} />);
ProximityTableBody.displayName = "ProximityTableBody";

type TableRowProps = HTMLAttributes<HTMLTableRowElement> & { index?: number };

export const ProximityTableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ index, className, style, ...props }, ref) => {
    const internalRef = useRef<HTMLTableRowElement>(null);
    const context = useContext(TableContext);

    useEffect(() => {
      if (index === undefined || !context) return;
      context.registerItem(index, internalRef.current);
      return () => context.registerItem(index, null);
    }, [index, context]);

    const activeIndex = context?.activeIndex ?? null;
    const isBodyRow = index !== undefined;
    const hideBorder =
      activeIndex !== null &&
      ((isBodyRow && (index === activeIndex || index === activeIndex - 1)) ||
        (!isBodyRow && activeIndex === 0));

    return (
      <tr
        ref={(node) => {
          internalRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-proximity-index={index}
        className={cn(
          "group/row relative z-10 border-b transition-[border-color] duration-80",
          hideBorder ? "border-transparent" : "border-border/40",
          isBodyRow && activeIndex === index && "is-active",
          className,
        )}
        style={{ ...style, fontVariationSettings: isBodyRow ? fontWeights.normal : fontWeights.semibold }}
        {...props}
      />
    );
  },
);
ProximityTableRow.displayName = "ProximityTableRow";

export const ProximityTableHead = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th ref={ref} className={cn("px-3 py-2 text-left text-foreground", className)} {...props} />
));
ProximityTableHead.displayName = "ProximityTableHead";

export const ProximityTableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-3 py-2 text-muted-foreground transition-colors duration-80 group-[.is-active]/row:text-foreground",
      className,
    )}
    {...props}
  />
));
ProximityTableCell.displayName = "ProximityTableCell";
