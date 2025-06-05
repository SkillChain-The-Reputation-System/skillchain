'use client'

// Import UI components
import { Button } from "@/components/ui/button"

// Import lucide-react icons
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react"

// Import utils
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = []

    // Always show first page
    pageNumbers.push(1)

    // Calculate range around current page
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push("ellipsis-start")
    }

    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push("ellipsis-end")
    }

    // Always show last page if more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={cn("flex items-center justify-center space-x-1", className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 cursor-pointer"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pageNumbers.map((page, index) => {
        if (page === "ellipsis-start" || page === "ellipsis-end") {
          return (
            <Button key={`ellipsis-${index}`} variant="ghost" size="icon" className="h-8 w-8" disabled>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => onPageChange(page as number)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 cursor-pointer"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
