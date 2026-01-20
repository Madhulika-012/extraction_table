import React from 'react'
import { Box } from '@mui/material'

/**
 * Custom scrollbars that appear only on hover.
 * This bypasses OS/Chrome "overlay scrollbar" behavior (Windows setting) by drawing our own thumbs.
 */
export default function HoverScrollbars({ maxHeight = 600, sx, debug = false, children }) {
  const scrollRef = React.useRef(null)
  const [dragging, setDragging] = React.useState(false)
  const [metrics, setMetrics] = React.useState({
    clientHeight: 0,
    scrollHeight: 0,
    scrollTop: 0,
    clientWidth: 0,
    scrollWidth: 0,
    scrollLeft: 0,
  })

  const recompute = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setMetrics({
      clientHeight: el.clientHeight,
      scrollHeight: el.scrollHeight,
      scrollTop: el.scrollTop,
      clientWidth: el.clientWidth,
      scrollWidth: el.scrollWidth,
      scrollLeft: el.scrollLeft,
    })
  }, [])

  React.useEffect(() => {
    recompute()
    const el = scrollRef.current
    if (!el) return

    const onScroll = () => recompute()
    el.addEventListener('scroll', onScroll, { passive: true })

    let ro
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => recompute())
      ro.observe(el)
    } else {
      // Fallback (older/embedded Chromium)
      window.addEventListener('resize', recompute)
    }

    return () => {
      el.removeEventListener('scroll', onScroll)
      if (ro) ro.disconnect()
      window.removeEventListener('resize', recompute)
    }
  }, [recompute])

  const vNeeded = metrics.scrollHeight > metrics.clientHeight + 1
  const hNeeded = metrics.scrollWidth > metrics.clientWidth + 1

  const trackPad = 2
  const vTrackLen = Math.max(0, metrics.clientHeight - trackPad * 2)
  const hTrackLen = Math.max(0, metrics.clientWidth - trackPad * 2)

  const vThumbLenRaw =
    metrics.scrollHeight > 0 ? (metrics.clientHeight / metrics.scrollHeight) * vTrackLen : 0
  const hThumbLenRaw =
    metrics.scrollWidth > 0 ? (metrics.clientWidth / metrics.scrollWidth) * hTrackLen : 0

  const vThumbLen = Math.max(24, Math.min(vTrackLen, vThumbLenRaw || 0))
  const hThumbLen = Math.max(24, Math.min(hTrackLen, hThumbLenRaw || 0))

  const vMaxScroll = Math.max(1, metrics.scrollHeight - metrics.clientHeight)
  const hMaxScroll = Math.max(1, metrics.scrollWidth - metrics.clientWidth)

  const vThumbTop = trackPad + (metrics.scrollTop / vMaxScroll) * Math.max(0, vTrackLen - vThumbLen)
  const hThumbLeft =
    trackPad + (metrics.scrollLeft / hMaxScroll) * Math.max(0, hTrackLen - hThumbLen)

  const startDrag = React.useCallback((axis, e) => {
    const el = scrollRef.current
    if (!el) return
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)

    const startClient = axis === 'y' ? e.clientY : e.clientX
    const startScroll = axis === 'y' ? el.scrollTop : el.scrollLeft

    const onMove = (ev) => {
      const nowClient = axis === 'y' ? ev.clientY : ev.clientX
      const delta = nowClient - startClient

      if (axis === 'y') {
        const track = Math.max(1, vTrackLen - vThumbLen)
        const content = Math.max(1, metrics.scrollHeight - metrics.clientHeight)
        el.scrollTop = startScroll + (delta / track) * content
      } else {
        const track = Math.max(1, hTrackLen - hThumbLen)
        const content = Math.max(1, metrics.scrollWidth - metrics.clientWidth)
        el.scrollLeft = startScroll + (delta / track) * content
      }
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      setDragging(false)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [
    hThumbLen,
    hTrackLen,
    metrics.clientHeight,
    metrics.clientWidth,
    metrics.scrollHeight,
    metrics.scrollWidth,
    vThumbLen,
    vTrackLen,
  ])

  return (
    <Box
      sx={{
        position: 'relative',
        ...sx,
      }}
    >
      {debug && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 9999,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: 12,
            lineHeight: 1.2,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            color: '#fff',
            pointerEvents: 'none',
          }}
        >
          HoverScrollbars ON
          <br />
          {Math.round(metrics.clientWidth)}×{Math.round(metrics.clientHeight)} /{' '}
          {Math.round(metrics.scrollWidth)}×{Math.round(metrics.scrollHeight)}
        </Box>
      )}
      <Box
        ref={scrollRef}
        sx={{
          maxHeight,
          overflow: 'auto',
          position: 'relative',
          pr: 0,
          /* Hide native scrollbars while preserving scroll */
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': { width: 0, height: 0 }, // Chrome/Edge
        }}
      >
        {children}
      </Box>

      {/* Vertical */}
      {vNeeded && (
        <Box
          className="hover-scrollbar"
          sx={{
            position: 'absolute',
            top: trackPad,
            bottom: trackPad,
            right: 0,
            width: 12,
            opacity: dragging ? 1 : 0,
            transition: 'opacity 120ms ease',
            /* Keep an invisible hover target at the edge even when hidden */
            pointerEvents: 'auto',
            zIndex: 20,
            borderRadius: 999,
            backgroundColor: 'transparent',
            '&:hover': {
              opacity: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.04)', // visible only on hover
            },
          }}
        >
          <Box
            onMouseDown={(e) => startDrag('y', e)}
            sx={{
              position: 'absolute',
              top: vThumbTop,
              right: 2,
              width: 8,
              height: vThumbLen,
              borderRadius: 999,
              backgroundColor: 'rgba(107, 114, 128, 0.75)',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'rgba(75, 85, 99, 0.9)' },
            }}
          />
        </Box>
      )}

      {/* Horizontal */}
      {hNeeded && (
        <Box
          className="hover-scrollbar"
          sx={{
            position: 'absolute',
            left: trackPad,
            right: trackPad,
            bottom: 0,
            height: 12,
            opacity: dragging ? 1 : 0,
            transition: 'opacity 120ms ease',
            /* Keep an invisible hover target at the edge even when hidden */
            pointerEvents: 'auto',
            zIndex: 20,
            borderRadius: 999,
            backgroundColor: 'transparent',
            '&:hover': {
              opacity: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.04)', // visible only on hover
            },
          }}
        >
          <Box
            onMouseDown={(e) => startDrag('x', e)}
            sx={{
              position: 'absolute',
              left: hThumbLeft,
              bottom: 2,
              height: 8,
              width: hThumbLen,
              borderRadius: 999,
              backgroundColor: 'rgba(107, 114, 128, 0.75)',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'rgba(75, 85, 99, 0.9)' },
            }}
          />
        </Box>
      )}
    </Box>
  )
}


