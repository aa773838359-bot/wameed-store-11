'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Send, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface ProductReviewsProps {
  productId: string
}

interface Review {
  id: string
  userName: string
  rating: number
  comment: string
  verified: boolean
  createdAt: string
}

interface ReviewsData {
  reviews: Review[]
  total: number
  page: number
  totalPages: number
  averageRating: number
  reviewCount: number
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3 w-3'
  return (
    <div className="flex" dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : i < rating
              ? 'fill-amber-400/50 text-amber-400'
              : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  )
}

function StarRatingInput({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1" dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          className="p-0.5 transition-transform hover:scale-110"
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i + 1)}
        >
          <Star
            className={`h-6 w-6 ${
              i < (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    userName: '',
    rating: 5,
    comment: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?productId=${productId}&limit=20`)
      const json = await res.json()
      return json.data as ReviewsData | undefined
    },
    enabled: !!productId,
  })

  const submitMutation = useMutation({
    mutationFn: async (formData: typeof form) => {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userName: formData.userName,
          rating: formData.rating,
          comment: formData.comment,
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'فشل في إرسال التقييم')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
      setForm({ userName: '', rating: 5, comment: '' })
      toast.success('تم إرسال تقييمك بنجاح!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إرسال التقييم')
    },
  })

  const reviews = data?.reviews || []
  const averageRating = data?.averageRating || 0
  const reviewCount = data?.reviewCount || 0

  const handleSubmit = () => {
    if (!form.userName.trim()) {
      toast.error('الاسم مطلوب')
      return
    }
    if (form.rating < 1 || form.rating > 5) {
      toast.error('التقييم يجب أن يكون بين 1 و 5')
      return
    }
    submitMutation.mutate(form)
  }

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.floor(r.rating) === star).length
    return { star, count, percentage: reviewCount > 0 ? (count / reviewCount) * 100 : 0 }
  })

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl min-w-[140px]">
          <span className="text-4xl font-bold text-orange-500">{averageRating.toFixed(1)}</span>
          <StarRating rating={averageRating} size="md" />
          <span className="text-sm text-muted-foreground mt-1">
            {reviewCount} تقييم
          </span>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-1.5">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm w-6 text-center">{star}</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-center">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Submit Review Form */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-orange-500" />
            اكتب تقييمك
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">الاسم</label>
              <Input
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                placeholder="أدخل اسمك"
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">التقييم</label>
              <StarRatingInput
                value={form.rating}
                onChange={(rating) => setForm({ ...form, rating })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">التعليق (اختياري)</label>
              <Textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="شاركنا رأيك في المنتج..."
                rows={3}
                maxLength={1000}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  إرسال التقييم
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Reviews List */}
      <div>
        <h3 className="font-semibold mb-4">
          التقييمات ({reviewCount})
        </h3>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد تقييمات بعد</p>
            <p className="text-sm text-muted-foreground">كن أول من يقيّم هذا المنتج!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{review.userName}</span>
                    {review.verified && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                        موثّق
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <StarRating rating={review.rating} />
                {review.comment && (
                  <p className="text-sm text-muted-foreground mt-1 leading-6">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
