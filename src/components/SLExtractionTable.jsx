import React, { useState, useRef } from 'react'
import * as XLSX from 'xlsx-js-style'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  Menu,
  ListItemText,
  MenuItem,
  List,
  TablePagination,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import HoverScrollbars from './HoverScrollbars'

const columns = [
  { id: 'sNo', label: 'Sno', minWidth: 70, defaultWidth: 80 },
  { id: 'title', label: 'Title / SL Name', minWidth: 200, defaultWidth: 220 },
  { id: 'lineOfBusiness', label: 'Line of Business (LOB)', minWidth: 160, defaultWidth: 180 },
  { id: 'programProject', label: 'Program/ Project', minWidth: 180, defaultWidth: 200 },
  { id: 'serviceLevelId', label: 'Service Level ID (SL ID)', minWidth: 160, defaultWidth: 180 },
  { id: 'documentName', label: 'Document Name/ID', minWidth: 150, defaultWidth: 170 },
  { id: 'serviceLevelDescription', label: 'Service Level Description', minWidth: 320, defaultWidth: 340 },
  { id: 'slType', label: 'SL Type', minWidth: 100, defaultWidth: 120 },
  { id: 'slCategory', label: 'SL Category', minWidth: 140, defaultWidth: 160 },
  { id: 'slSubcategory', label: 'SL Subcategory', minWidth: 150, defaultWidth: 170 },
  { id: 'priority', label: 'Priority', minWidth: 100, defaultWidth: 120 },
  { id: 'unitOfMeasurement', label: 'Unit of Measurement', minWidth: 150, defaultWidth: 170 },
  { id: 'minOrMax', label: 'Minimum/ Maximum?', minWidth: 140, defaultWidth: 160 },
  { id: 'expectedTargetValue', label: 'Expected/Target Value', minWidth: 150, defaultWidth: 170 },
  { id: 'thresholdValueFloor', label: 'Threshold Value (Floor)', minWidth: 170, defaultWidth: 190 },
  { id: 'thresholdValueBasement', label: 'Threshold Value 2 (Basement)', minWidth: 200, defaultWidth: 220 },
  { id: 'measurementWindow', label: 'Measurement Window', minWidth: 150, defaultWidth: 170 },
  { id: 'computationFrequency', label: 'Computation Frequency', minWidth: 170, defaultWidth: 190 },
  { id: 'exclusions', label: 'Exclusions', minWidth: 180, defaultWidth: 200 },
  { id: 'slCreditApplicable', label: 'SL Credit Applicable?', minWidth: 170, defaultWidth: 190 },
  { id: 'slCreditClauseDescription', label: 'SL Credit Clause Description', minWidth: 220, defaultWidth: 240 },
  { id: 'slCreditMode', label: 'SL Credit Mode', minWidth: 150, defaultWidth: 170 },
  { id: 'slCreditFormula', label: 'SL Credit Formula', minWidth: 200, defaultWidth: 220 },
  { id: 'slCreditFrequency', label: 'SL Credit Frequency', minWidth: 170, defaultWidth: 190 },
  { id: 'earnbackApplicable', label: 'Earnback Applicable?', minWidth: 170, defaultWidth: 190 },
  { id: 'earnbackClauseDescription', label: 'Earnback Clause Description', minWidth: 220, defaultWidth: 240 },
  { id: 'earnbackMode', label: 'Earnback Mode', minWidth: 150, defaultWidth: 170 },
  { id: 'earnbackFrequency', label: 'Earnback Frequency', minWidth: 170, defaultWidth: 190 },
  { id: 'serviceLevelDefault', label: 'Service Level Default', minWidth: 200, defaultWidth: 220 },
  { id: 'persistentDefaultClause', label: 'Persistent Default Clause', minWidth: 220, defaultWidth: 240 },
  { id: 'terminationTrigger', label: 'Termination Trigger', minWidth: 200, defaultWidth: 220 },
  { id: 'slStartDate', label: 'SL Start Date', minWidth: 140, defaultWidth: 150 },
  { id: 'slEndDates', label: 'SL End Dates', minWidth: 140, defaultWidth: 150 },
  { id: 'slEffectiveDate', label: 'SL Effective Date', minWidth: 150, defaultWidth: 160 },
  { id: 'reportingFrequency', label: 'Reporting Frequency', minWidth: 160, defaultWidth: 180 },
  { id: 'slOwner', label: 'SL Owner', minWidth: 140, defaultWidth: 150 },
  { id: 'slApprover', label: 'SL Approver', minWidth: 140, defaultWidth: 150 },
  { id: 'supplierResponsibility', label: 'Supplier Responsibility?', minWidth: 170, defaultWidth: 190 },
]

// Filter Menu Component anchored to the filter button
function FilterMenu({ anchorEl, open, onClose, columnId, data, column, onSelect, activeValue }) {
  if (!open || !anchorEl) return null

  const rect = anchorEl.getBoundingClientRect()
  const anchorPosition = {
    top: rect.bottom + (window.scrollY || window.pageYOffset),
    left: rect.left + (window.scrollX || window.pageXOffset),
  }

  return (
    <Menu
      // Use computed screen coordinates to avoid any portal/scroll misalignment
      anchorEl={anchorEl}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      open
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      disablePortal
      keepMounted
      MenuListProps={{ dense: true, sx: { maxHeight: 300, minWidth: 180 } }}
      slotProps={{
        paper: {
          sx: { overflowY: 'auto' },
          elevation: 3,
        },
      }}
    >
      <MenuItem
        selected={!activeValue}
        onClick={() => {
          onSelect(null)
          onClose()
        }}
      >
        <ListItemText>All</ListItemText>
      </MenuItem>
      {Array.from(new Set(data.map((row) => row[column.id])))
        .filter((val) => val && val !== '-')
        .map((value) => (
          <MenuItem
            key={value}
            selected={activeValue === value}
            onClick={() => {
              onSelect(value)
              onClose()
            }}
          >
            <ListItemText>{value}</ListItemText>
          </MenuItem>
        ))}
    </Menu>
  )
}

function SLExtractionTable({ rows: rowsProp, aiInsights: aiInsightsProp, references: referencesProp }) {
  const safeRows = React.useMemo(() => rowsProp ?? [], [rowsProp])
  const safeAiInsights = React.useMemo(() => aiInsightsProp ?? [], [aiInsightsProp])
  const safeReferences = React.useMemo(() => referencesProp ?? [], [referencesProp])

  const DEBUG_UI_MESSAGES = import.meta.env?.VITE_DEBUG_UI_MESSAGES === 'true'

  const [data, setData] = useState(safeRows)
  const [aiInsightsState, setAiInsightsState] = useState(safeAiInsights)
  const [referencesState, setReferencesState] = useState(safeReferences)
  const [selected, setSelected] = useState([])
  const [columnsState, setColumnsState] = useState(columns)
  const [retriggerDialog, setRetriggerDialog] = useState({ open: false, type: null, target: null })
  const [isClosed, setIsClosed] = useState(false)
  const [filters, setFilters] = useState({})
  const [instructions, setInstructions] = useState('')
  const [filterMenus, setFilterMenus] = useState({})
  const filterButtonRefs = useRef({})
  const [page, setPage] = useState(0)
  const taxonomyFields = React.useMemo(() => columnsState.map((c) => c.id), [columnsState])
  const computeInitialWidth = (col) =>
    Math.max(col.defaultWidth || 140, (col.label?.length || 8) * 8 + 48) // room for text + icons

  const [columnWidths, setColumnWidths] = useState(
    columns.reduce((acc, col) => {
      acc[col.id] = computeInitialWidth(col)
      return acc
    }, {})
  )

  // Renders a single-line cell with ellipsis and shows tooltip only when truncated
  const TruncatedCellContent = ({ value }) => {
    const textRef = React.useRef(null)
    const [isOverflowing, setIsOverflowing] = useState(false)

    const rawValue = value ?? '-'
    const words = typeof rawValue === 'string' ? rawValue.trim().split(/\s+/).filter(Boolean) : []
    const wordLimit = 7
    const truncatedByWords = words.length > wordLimit
    const displayValue =
      rawValue === '-' || rawValue === '' || typeof rawValue !== 'string'
        ? rawValue
        : truncatedByWords
        ? `${words.slice(0, wordLimit).join(' ')}…`
        : rawValue

    React.useEffect(() => {
      const el = textRef.current
      if (!el) return
      setIsOverflowing(el.scrollWidth > el.clientWidth)
    }, [displayValue, rawValue])

    const enableTooltip =
      (truncatedByWords || isOverflowing) && rawValue !== '-' && rawValue !== ''

    return (
      <Tooltip
        title={rawValue}
        placement="bottom"
        arrow
        disableHoverListener={!enableTooltip}
        disableFocusListener={!enableTooltip}
        disableTouchListener={!enableTooltip}
      >
        <Typography
          ref={textRef}
          component="span"
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayValue}
        </Typography>
      </Tooltip>
    )
  }

  React.useEffect(() => {
    setData(safeRows)
    setSelected([])
    setPage(0)
  }, [safeRows])

  React.useEffect(() => {
    setAiInsightsState(safeAiInsights)
  }, [safeAiInsights])

  React.useEffect(() => {
    setReferencesState(safeReferences)
  }, [safeReferences])

  React.useEffect(() => {
    setColumnWidths((prev) => {
      const next = { ...prev }
      columnsState.forEach((col) => {
        if (!next[col.id]) next[col.id] = computeInitialWidth(col)
      })
      return next
    })
  }, [columnsState])

  React.useEffect(() => {
    const handler = (event) => {
      if (event?.data?.type !== 'ui_component_render') return
      const payload = event.data.payload || {}

      if (DEBUG_UI_MESSAGES) console.log('ui_component_render received', payload)

      const incoming = Array.isArray(payload.columns) ? payload.columns : []
      const nextCols =
        incoming.length > 0
          ? incoming.map((c) => ({
              id: c.key,
              label: c.label,
              minWidth: 120,
              defaultWidth: 160,
            }))
          : columns

      setColumnsState(nextCols)
      setColumnWidths((prev) => {
        const next = { ...prev }
        nextCols.forEach((col) => {
          if (!next[col.id]) next[col.id] = computeInitialWidth(col)
        })
        return next
      })

      if (Array.isArray(payload.rows)) {
        setData(payload.rows)
        setSelected([])
        setPage(0)
      }

      if (Array.isArray(payload.aiInsights)) setAiInsightsState(payload.aiInsights)
      if (Array.isArray(payload.references)) setReferencesState(payload.references)
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredData.map((row) => row.id))
    } else {
      setSelected([])
    }
  }

  const handleSelectRow = (id) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    setSelected(newSelected)
  }

  const handleDeleteRow = (id) => {
    setData(data.filter((row) => row.id !== id))
    setSelected(selected.filter((selectedId) => selectedId !== id))
  }

  const handleDeleteSelected = () => {
    setData(data.filter((row) => !selected.includes(row.id)))
    setSelected([])
  }

  const handleRetriggerExtraction = (type, target = null) => {
    setRetriggerDialog({ open: true, type, target })
  }

  const handleRetriggerSubmit = () => {
    // Here you would send the instructions to the agent
    console.log('Retrigger extraction:', {
      type: retriggerDialog.type,
      target: retriggerDialog.target,
      instructions,
    })
    setRetriggerDialog({ open: false, type: null, target: null })
    setInstructions('')
    // In a real implementation, you would call an API to retrigger extraction
  }

  const handleFilterClick = (event, columnId) => {
    event.preventDefault()
    event.stopPropagation()
    // Get the button element - currentTarget is the IconButton
    const button = event.currentTarget
    console.log('Filter button clicked:', button, 'Column:', columnId)
    // Verify it's a valid DOM element
    if (button && button instanceof HTMLElement) {
      console.log('Button position:', button.getBoundingClientRect())
      setFilterMenus((prev) => ({
        ...prev,
        [columnId]: button,
      }))
    }
  }

  const handleFilterClose = (columnId) => {
    setFilterMenus({
      ...filterMenus,
      [columnId]: null,
    })
  }

  const handleClose = () => {
    window.parent.postMessage({ type: 'ui_component_close' }, '*')
    console.log('Closing side panel')
    setIsClosed(true)
  }

  const handleFilterSelect = (columnId, value) => {
    setFilters((prev) => {
      const next = { ...prev }
      if (!value) {
        delete next[columnId]
      } else {
        next[columnId] = value
      }
      return next
    })
    setPage(0)
    setSelected([])
  }

  const handleSubmit = () => {
    const tableData = {
      rows: data,
      metadata: {
        timestamp: new Date().toISOString(),
        totalRows: data.length,
      },
    }
    console.log('Submitting table data:', JSON.stringify(tableData, null, 2))
    // In a real implementation, you would send this to the agent
    alert('Table data submitted! Check console for JSON output.')
  }

  const isSelected = (id) => selected.indexOf(id) !== -1
  const filteredData = React.useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) return data
    return data.filter((row) =>
      Object.entries(filters).every(([col, val]) => {
        if (!val) return true
        const cell = row[col]
        return String(cell ?? '').trim() === String(val).trim()
      })
    )
  }, [data, filters])

  const visibleSelectedCount = filteredData.filter((row) => selected.includes(row.id)).length
  const selectedCount = selected.length
  const rowsPerPage = 20
  const showPagination = filteredData.length > rowsPerPage
  const paginatedData = showPagination ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filteredData
  const maxHeight = filteredData.length > rowsPerPage ? 580 : 'auto'

  // Resizable Header Cell Component
  const ResizableHeaderCell = ({ column, children, ...props }) => {
    const width = columnWidths[column.id] || column.defaultWidth

    const handleMouseDown = (e) => {
      e.preventDefault()
      e.stopPropagation()
      const startX = e.pageX
      const startWidth = width

      const handleMouseMove = (e) => {
        const newWidth = startWidth + (e.pageX - startX)
        const minWidth = column.minWidth || 50
        if (newWidth >= minWidth) {
          setColumnWidths((prev) => ({
            ...prev,
            [column.id]: newWidth,
          }))
        }
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }
    return (
      <TableCell
        {...props}
        sx={{
          ...props.sx,
          width: width,
          minWidth: width,
          maxWidth: width,
          position: 'relative',
          whiteSpace: 'nowrap',
          overflow: 'visible',
          paddingRight: '12px !important',
        }}
      >
        {children}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: 'absolute',
            right: -2,
            top: 0,
            bottom: 0,
            width: '8px',
            cursor: 'col-resize',
            zIndex: 1,
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.2)',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: '50%',
                top: '20%',
                bottom: '20%',
                width: '2px',
                backgroundColor: 'rgba(25, 118, 210, 0.6)',
                transform: 'translateX(-50%)',
                borderRadius: '1px',
              },
            },
            '&:active': {
              backgroundColor: 'rgba(25, 118, 210, 0.3)',
            },
          }}
        />
      </TableCell>
    )
  }

  if (isClosed) return null

  return (
    <Box sx={{ p: 3, maxWidth: '100%', mx: 'auto', position: 'relative' }}>
      <Paper
        elevation={2}
        sx={{
          mb: 3,
          border: '1px solid #e5e7eb',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
            Service Level Extractions
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                // Export only the table (columns + rows) as Excel
                const header = columnsState.map((c) => c.label)
                const rows = data.map((row) => columnsState.map((c) => row[c.id] ?? ''))
                const sheet = XLSX.utils.aoa_to_sheet([header, ...rows])
                // Add basic autofilter for usability (guard !ref to avoid undefined)
                if (sheet['!ref']) {
                  sheet['!autofilter'] = { ref: sheet['!ref'] }
                }
                const wb = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(wb, sheet, 'Table')
                XLSX.writeFile(wb, 'table.xlsx')
              }}
              sx={{
                borderColor: '#d1d5db',
                color: '#374151',
                '&:hover': { borderColor: '#9ca3af', backgroundColor: '#f8fafc' },
              }}
            >
              Export
            </Button>
            <IconButton
              aria-label="Close table"
              onClick={handleClose}
              sx={{ color: '#6b7280', '&:hover': { color: '#374151' } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {selectedCount > 0 && (
          <Box sx={{ px: 2.5, pb: 1, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteSelected}
            >
              Delete Selected ({selectedCount})
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => handleRetriggerExtraction('rows', selected)}
            >
              Retrigger Extraction ({selectedCount})
            </Button>
          </Box>
        )}

        <HoverScrollbars
          maxHeight={600}
          sx={{
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <Table
            stickyHeader
            sx={{
              tableLayout: 'auto',
              width: '100%',
              minWidth: 'max-content',
              border: '1px solid #d1d5db',
              borderCollapse: 'collapse',
              '& .MuiTableCell-root': {
                borderRight: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
              },
              '& .MuiTableCell-root:last-of-type': {
                borderRight: 'none',
              },
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <TableHead
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 5,
                backgroundColor: '#e5e7eb',
              }}
            >
              <TableRow>
                <TableCell
                  padding="checkbox"
                  sx={{
                    backgroundColor: '#e5e7eb',
                    width: 50,
                    position: 'sticky',
                    left: 0,
                    top: 0,
                    zIndex: 4,
                  }}
                >
                  <Checkbox
                    indeterminate={visibleSelectedCount > 0 && visibleSelectedCount < filteredData.length}
                    checked={filteredData.length > 0 && visibleSelectedCount === filteredData.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {columnsState.map((column) => (
                  <ResizableHeaderCell
                    key={column.id}
                    column={column}
                    sx={{
                      backgroundColor: '#e5e7eb',
                      fontWeight: 600,
                      minWidth: columnWidths[column.id],
                      position: 'sticky',
                      top: 0,
                      zIndex: 3,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        pr: 3,
                        width: '100%',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          flex: '0 0 auto',
                          fontWeight: 500,
                          color: '#6b7280',
                        }}
                      >
                        {column.label}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          flexShrink: 0,
                          ml: 'auto',
                          mr: 0.5,
                        }}
                      >
                        {taxonomyFields.includes(column.id) && (
                          <Tooltip title="Filter options">
                            <IconButton
                              ref={(el) => {
                                if (el) filterButtonRefs.current[column.id] = el
                              }}
                              id={`filter-btn-${column.id}`}
                              size="small"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleFilterClick(e, column.id)
                              }}
                              sx={{
                                p: 0.5,
                                flexShrink: 0,
                                color: '#9ca3af',
                                '&:hover': { color: '#4b5563' },
                              }}
                            >
                              <FilterListIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Retrigger extraction for this column">
                          <IconButton
                            size="small"
                            onClick={() => handleRetriggerExtraction('column', column.id)}
                            sx={{
                              p: 0.5,
                              flexShrink: 0,
                              color: '#9ca3af',
                              '&:hover': { color: '#4b5563' },
                            }}
                          >
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </ResizableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody
              sx={{
                '& .MuiTableRow-root:nth-of-type(odd):not(.Mui-selected)': {
                  backgroundColor: '#f8fafc',
                },
                '& .MuiTableRow-root:nth-of-type(even):not(.Mui-selected)': {
                  backgroundColor: '#ffffff',
                },
              }}
            >
              {paginatedData.map((row) => {
                const isRowSelected = isSelected(row.id)
                return (
                  <TableRow
                    key={row.id}
                    selected={isRowSelected}
                    hover
                    sx={{
                      '&:hover': { backgroundColor: '#f9fafb' },
                      '&.Mui-selected': { backgroundColor: '#eef2ff !important' },
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, backgroundColor: 'inherit', zIndex: 2 }}>
                      <Checkbox
                        checked={isRowSelected}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </TableCell>
                {columnsState.map((column) => (
                      <TableCell
                        key={column.id}
                        sx={{
                          width: columnWidths[column.id] || column.defaultWidth,
                          minWidth: columnWidths[column.id] || column.defaultWidth,
                          maxWidth: 'unset',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: '#374151',
                          fontWeight: 400,
                          fontSize: 14,
                        }}
                      >
                        <TruncatedCellContent value={row[column.id]} />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </HoverScrollbars>
        {showPagination && (
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        )}
      </Paper>

      {/* Filter Menus - Using custom component with manual positioning */}
      {columnsState
        .filter((column) => taxonomyFields.includes(column.id))
        .map((column) => (
          <FilterMenu
            key={`filter-menu-${column.id}`}
            anchorEl={filterMenus[column.id]}
            open={Boolean(filterMenus[column.id])}
            onClose={() => handleFilterClose(column.id)}
            onSelect={(val) => handleFilterSelect(column.id, val)}
            activeValue={filters[column.id]}
            columnId={column.id}
            column={column}
            data={data}
          />
        ))}

      {/* AI Insights and References Section */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, alignItems: 'stretch' }}>
        <Paper elevation={2} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            AI Insights
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0, flex: 1 }}>
            {aiInsightsState.map((insight, index) => (
              <Typography
                key={index}
                component="li"
                variant="body2"
                sx={{ mb: 1, color: 'text.secondary' }}
              >
                {insight}
              </Typography>
            ))}
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            References
          </Typography>
          <Box sx={{ flex: 1 }}>
            {referencesState.map((ref, index) => (
              <Chip
                key={index}
                label={ref}
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
                size="small"
              />
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          sx={{ minWidth: 150 }}
        >
          Submit
        </Button>
      </Box>

      {/* Retrigger Extraction Dialog */}
      <Dialog open={retriggerDialog.open} onClose={() => setRetriggerDialog({ open: false, type: null, target: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          Retrigger Extraction
          {retriggerDialog.type === 'column' && ` - ${columnsState.find((c) => c.id === retriggerDialog.target)?.label}`}
          {retriggerDialog.type === 'rows' && ` - ${retriggerDialog.target.length} Row(s)`}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Instructions for Agent"
            placeholder="Enter new instructions for what needs to be extracted..."
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRetriggerDialog({ open: false, type: null, target: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleRetriggerSubmit}
            variant="contained"
            disabled={!instructions.trim()}
          >
            Retrigger
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SLExtractionTable

