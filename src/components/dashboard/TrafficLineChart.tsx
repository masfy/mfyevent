'use client';

import React, { useState, useMemo } from 'react';
import { AnalyticsRecord } from '@/types';
import { MOCK_TRAFFIC_7D, MOCK_TRAFFIC_14D, MOCK_TRAFFIC_30D } from '@/lib/mockData';
import { MousePointerClick, Users, Zap, Activity } from 'lucide-react';

interface TrafficLineChartProps {
  data?: AnalyticsRecord[];
  initialRange?: '7d' | '14d' | '30d';
}

type ViewMode = 'all' | 'clicks' | 'visitors';
type TimeRange = '7d' | '14d' | '30d';

export const TrafficLineChart: React.FC<TrafficLineChartProps> = ({
  data,
  initialRange = '14d',
}) => {
  const [range, setRange] = useState<TimeRange>(initialRange);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  // Select dataset based on active time range
  const activeData = useMemo(() => {
    if (data && range === '14d' && data.length === 14) return data;
    if (range === '7d') return MOCK_TRAFFIC_7D;
    if (range === '30d') return MOCK_TRAFFIC_30D;
    return MOCK_TRAFFIC_14D;
  }, [data, range]);

  // Compute key summary metrics
  const totals = useMemo(() => {
    if (!activeData || activeData.length === 0) return { clicks: 0, visitors: 0, peakDay: null, avgCtr: '0' };
    const totalClicks = activeData.reduce((acc, d) => acc + d.clicks, 0);
    const totalVisitors = activeData.reduce((acc, d) => acc + d.visitors, 0);
    let peak = activeData[0];
    for (const d of activeData) {
      if (d.clicks > peak.clicks) peak = d;
    }
    const avgCtr = totalVisitors > 0 ? ((totalClicks / totalVisitors) * 100).toFixed(1) : '0';
    return { clicks: totalClicks, visitors: totalVisitors, peakDay: peak, avgCtr };
  }, [activeData]);

  if (!activeData || activeData.length === 0) return null;

  // Chart coordinate dimensions
  const width = 800;
  const height = 240;
  const padLeft = 8;
  const padRight = 8;
  const padTop = 16;
  const padBottom = 16;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const rawMax = Math.max(...activeData.flatMap((d) => [d.clicks, d.visitors]), 0);
  const maxVal = rawMax === 0 ? 10 : Math.max(Math.ceil((rawMax * 1.15) / 10) * 10, 10);

  // Compute points
  const points = activeData.map((d, i) => {
    const x = padLeft + (i / (activeData.length - 1)) * chartWidth;
    const yClicks = padTop + chartHeight - (d.clicks / maxVal) * chartHeight;
    const yVisitors = padTop + chartHeight - (d.visitors / maxVal) * chartHeight;
    return { x, yClicks, yVisitors, d, index: i };
  });

  // Catmull-Rom to Cubic Bezier Curve Generator
  const buildSmoothPath = (pts: { x: number; y: number }[]): string => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      // Smooth tension
      const tension = 0.32;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const clickPoints = points.map((p) => ({ x: p.x, y: p.yClicks }));
  const visitorPoints = points.map((p) => ({ x: p.x, y: p.yVisitors }));

  const clicksLinePath = buildSmoothPath(clickPoints);
  const visitorsLinePath = buildSmoothPath(visitorPoints);

  const clicksAreaPath = `${clicksLinePath} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`;
  const visitorsAreaPath = `${visitorsLinePath} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`;

  const formatYAxis = (val: number): string => {
    if (val <= 0) return '0';
    if (val >= 1000) {
      const k = val / 1000;
      return k % 1 === 0 ? `${k.toFixed(0)}k` : `${k.toFixed(1)}k`;
    }
    return Math.round(val).toString();
  };

  // Grid levels (100%, 75%, 50%, 25%, 0%)
  const yLabels = [
    { label: formatYAxis(maxVal), ratio: 1 },
    { label: formatYAxis(maxVal * 0.75), ratio: 0.75 },
    { label: formatYAxis(maxVal * 0.5), ratio: 0.5 },
    { label: formatYAxis(maxVal * 0.25), ratio: 0.25 },
    { label: '0', ratio: 0 },
  ];

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  // X-axis label spacing: Show ALL 14 dates for 14d! For 30d show every other date (16 dates).
  const shouldShowDateLabel = (idx: number, total: number) => {
    if (total <= 14) return true;
    return idx % 2 === 0 || idx === total - 1;
  };

  return (
    <div className="w-full space-y-4 select-none">
      {/* ================= HEADER CONTROLS: SUMMARY CHIPS & RANGE TOGGLE ================= */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        {/* Metric Summary Chips */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Chip 1: Total Klik */}
          <div
            onClick={() => setViewMode(viewMode === 'clicks' ? 'all' : 'clicks')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'clicks' || viewMode === 'all'
                ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 text-slate-800 dark:text-white'
                : 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
            title="Klik untuk isolasi garis Klik Tautan"
          >
            <div className="w-6 h-6 rounded-lg bg-[#5B5BF7]/15 flex items-center justify-center text-[#5B5BF7]">
              <MousePointerClick className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-normal leading-none">
                Total Klik
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs sm:text-sm font-semibold font-mono tracking-tight">
                  {totals.clicks.toLocaleString('id-ID')}
                </span>
                {totals.clicks > 0 ? (
                  <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-1 rounded-xs">
                    +18.4%
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded-xs">
                    0%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Chip 2: Unique Visitors */}
          <div
            onClick={() => setViewMode(viewMode === 'visitors' ? 'all' : 'visitors')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              viewMode === 'visitors' || viewMode === 'all'
                ? 'bg-cyan-50/60 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/60 text-slate-800 dark:text-white'
                : 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
            title="Klik untuk isolasi garis Unique Visitors"
          >
            <div className="w-6 h-6 rounded-lg bg-[#06B6D4]/15 flex items-center justify-center text-[#06B6D4]">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-normal leading-none">
                Pengunjung
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs sm:text-sm font-semibold font-mono tracking-tight">
                  {totals.visitors.toLocaleString('id-ID')}
                </span>
                {totals.visitors > 0 ? (
                  <span className="text-[9px] font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-1 rounded-xs">
                    +24.1%
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded-xs">
                    0%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Chip 3: Peak Day Indicator */}
          {totals.peakDay && totals.peakDay.clicks > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 shrink-0" />
              <div className="text-[10.5px]">
                <span className="text-slate-400">Puncak: </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono tracking-tight">
                  {totals.peakDay.date} ({totals.peakDay.clicks} Klik)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Controls: Range Switcher (7D / 14D / 30D) & View Filter */}
        <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-end">
          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl text-[11px] font-medium">
            <button
              type="button"
              onClick={() => {
                setRange('7d');
                setHoveredIndex(null);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                range === '7d'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => {
                setRange('14d');
                setHoveredIndex(null);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                range === '14d'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              14 Hari
            </button>
            <button
              type="button"
              onClick={() => {
                setRange('30d');
                setHoveredIndex(null);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                range === '30d'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              30 Hari
            </button>
          </div>

          {/* View Line Mode Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2 py-1 rounded-lg transition-all ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setViewMode('clicks')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${
                viewMode === 'clicks'
                  ? 'bg-white dark:bg-slate-700 text-[#5B5BF7] dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B5BF7]" />
              Klik
            </button>
            <button
              type="button"
              onClick={() => setViewMode('visitors')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${
                viewMode === 'visitors'
                  ? 'bg-white dark:bg-slate-700 text-[#06B6D4] dark:text-cyan-400 shadow-xs font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
              Visitors
            </button>
          </div>
        </div>
      </div>

      {/* ================= PROPORTIONAL DUAL-AXIS CHART WORKSPACE ================= */}
      <div className="w-full relative">
        {/* Main Chart Row with Y-Axis HTML numbers on Left and SVG Canvas on Right */}
        <div className="flex items-stretch gap-2 sm:gap-3">
          {/* Y-Axis HTML Labels (Never stretched, crisp & proportional typography) */}
          <div className="w-8 sm:w-10 shrink-0 flex flex-col justify-between items-end pb-2 pt-1 font-mono text-[10.5px] text-slate-400 dark:text-slate-500 font-normal select-none pointer-events-none">
            {yLabels.map((item, idx) => (
              <span key={`ylabel-${idx}`} className="leading-none">
                {item.label}
              </span>
            ))}
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 relative h-52 sm:h-60 md:h-64">
            {/* SVG Vector Graphic Canvas (Paths, Gradients, Guide Lines) */}
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Gradients for Lines */}
                <linearGradient id="mfyClicksStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5B5BF7" />
                  <stop offset="50%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>

                <linearGradient id="mfyVisitorsStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="60%" stopColor="#22D3EE" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>

                {/* Smooth Area Gradient Fills */}
                <linearGradient id="mfyClicksArea" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#5B5BF7" stopOpacity="0.26" />
                  <stop offset="60%" stopColor="#5B5BF7" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#5B5BF7" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="mfyVisitorsArea" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.20" />
                  <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                </linearGradient>

                {/* Laser Guide Gradient */}
                <linearGradient id="laserGuideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#5B5BF7" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Guide Lines */}
              {yLabels.map((item, idx) => {
                const y = padTop + chartHeight - item.ratio * chartHeight;
                return (
                  <line
                    key={`hline-${idx}`}
                    x1={padLeft}
                    y1={y}
                    x2={padLeft + chartWidth}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    className="text-slate-200/80 dark:text-slate-800/80"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Baseline Horizontal Bar */}
              <line
                x1={padLeft}
                y1={padTop + chartHeight}
                x2={padLeft + chartWidth}
                y2={padTop + chartHeight}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="1.2"
              />

              {/* Vertical Subtle Guide Lines */}
              {points.map((p, idx) => (
                <line
                  key={`vline-${idx}`}
                  x1={p.x}
                  y1={padTop}
                  x2={p.x}
                  y2={padTop + chartHeight}
                  stroke="currentColor"
                  strokeDasharray="2 4"
                  className="text-slate-100 dark:text-slate-800/50"
                  strokeWidth="1"
                />
              ))}

              {/* Area Fills */}
              {(viewMode === 'all' || viewMode === 'visitors') && (
                <path
                  d={visitorsAreaPath}
                  fill="url(#mfyVisitorsArea)"
                  className="transition-opacity duration-300"
                />
              )}
              {(viewMode === 'all' || viewMode === 'clicks') && (
                <path
                  d={clicksAreaPath}
                  fill="url(#mfyClicksArea)"
                  className="transition-opacity duration-300"
                />
              )}

              {/* Line 1: Unique Visitors Line (Cyan) */}
              <path
                d={visitorsLinePath}
                fill="none"
                stroke="url(#mfyVisitorsStroke)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 drop-shadow-[0_2px_8px_rgba(6,182,212,0.3)]"
                style={{ opacity: viewMode === 'clicks' ? 0.12 : 1 }}
              />

              {/* Line 2: Clicks Line (Purple / Indigo) */}
              <path
                d={clicksLinePath}
                fill="none"
                stroke="url(#mfyClicksStroke)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 drop-shadow-[0_3px_10px_rgba(91,91,247,0.35)]"
                style={{ opacity: viewMode === 'visitors' ? 0.12 : 1 }}
              />

              {/* Active Laser Vertical Scanner */}
              {activePoint && (
                <line
                  x1={activePoint.x}
                  y1={padTop - 6}
                  x2={activePoint.x}
                  y2={padTop + chartHeight}
                  stroke="url(#laserGuideGrad)"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />
              )}
            </svg>

            {/* Interactive Hitbox Band Overlay (Effortless mouse tracking across entire height) */}
            <div className="absolute inset-0 flex pointer-events-auto z-10">
              {points.map((p, idx) => (
                <div
                  key={`hitband-${idx}`}
                  className="flex-1 h-full cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </div>

            {/* Geometric 1:1 True Round Dots (HTML DOM — Mathematically Impossible to Stretch into Ovals!) */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {points.map((p, idx) => {
                const isHovered = hoveredIndex === idx;
                const leftPct = ((p.x - padLeft) / chartWidth) * 100;
                const topClicksPct = (p.yClicks / height) * 100;
                const topVisitorsPct = (p.yVisitors / height) * 100;

                return (
                  <React.Fragment key={`dot-${idx}`}>
                    {/* Visitors Dot (Always 100% Round) */}
                    {(viewMode === 'all' || viewMode === 'visitors') && (
                      <div
                        style={{ left: `${leftPct}%`, top: `${topVisitorsPct}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                      >
                        {isHovered && (
                          <span className="absolute w-5 h-5 rounded-full bg-[#06B6D4]/30 animate-ping" />
                        )}
                        <span
                          className={`rounded-full transition-all duration-150 border border-white dark:border-slate-900 bg-[#06B6D4] shadow-xs ${
                            isHovered
                              ? 'w-2.5 h-2.5 ring-2 ring-[#06B6D4]/60 shadow-[0_0_8px_#06B6D4]'
                              : 'w-1.5 h-1.5'
                          }`}
                        />
                      </div>
                    )}

                    {/* Clicks Dot (Always 100% Round) */}
                    {(viewMode === 'all' || viewMode === 'clicks') && (
                      <div
                        style={{ left: `${leftPct}%`, top: `${topClicksPct}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                      >
                        {isHovered && (
                          <span className="absolute w-5.5 h-5.5 rounded-full bg-[#5B5BF7]/35 animate-ping" />
                        )}
                        <span
                          className={`rounded-full transition-all duration-150 border border-white dark:border-slate-900 bg-[#5B5BF7] shadow-xs ${
                            isHovered
                              ? 'w-3 h-3 ring-2 ring-[#5B5BF7]/60 shadow-[0_0_10px_#5B5BF7]'
                              : 'w-1.5 h-1.5'
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Zero traffic informative overlay */}
            {totals.clicks === 0 && totals.visitors === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4 text-center">
                <div className="px-3.5 py-2 rounded-2xl bg-white/85 dark:bg-[#0F172A]/90 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#5B5BF7] animate-pulse" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Belum ada data trafik pada periode ini — Bagikan tautan Anda untuk memantau performa
                  </span>
                </div>
              </div>
            )}

            {/* ================= FLOATING GLASSMORPHISM INTERACTIVE TOOLTIP ================= */}
            {activePoint && (
              <div
                className="absolute z-20 pointer-events-none transition-all duration-150 backdrop-blur-xl bg-white/95 dark:bg-[#0F172A]/95 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-700/90 shadow-xl dark:shadow-[0_12px_36px_rgba(0,0,0,0.8)] ring-1 ring-slate-900/5 dark:ring-white/10 min-w-[170px]"
                style={{
                  left: `${((activePoint.x - padLeft) / chartWidth) * 100}%`,
                  top: `${Math.min(activePoint.yClicks, activePoint.yVisitors) - 10}px`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5B5BF7] animate-pulse" />
                    {activePoint.d.date} 2026
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-[#5B5BF7] dark:text-indigo-300 font-semibold">
                    Hari ke-{activePoint.index + 1}
                  </span>
                </div>

                <div className="pt-2 space-y-1.5 text-xs font-medium">
                  <div className="flex items-center justify-between gap-3 text-slate-700 dark:text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#5B5BF7]" />
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Total Klik:</span>
                    </span>
                    <span className="font-semibold font-mono text-[#5B5BF7] dark:text-indigo-300 text-xs">
                      {activePoint.d.clicks.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-slate-700 dark:text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Pengunjung:</span>
                    </span>
                    <span className="font-semibold font-mono text-[#06B6D4] text-xs">
                      {activePoint.d.visitors.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* CTR Interaction Ratio */}
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Rasio Interaksi:</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {activePoint.d.visitors > 0
                        ? `${((activePoint.d.clicks / activePoint.d.visitors) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* X-Axis HTML Date Labels (Crisp, dense, tight spacing, more than 8 dates) */}
        <div className="flex items-center gap-2 sm:gap-3 pt-1.5">
          {/* Spacer matching Y-axis width */}
          <div className="w-8 sm:w-10 shrink-0" />

          {/* Timeline Date Badges */}
          <div className="flex-1 relative h-6">
            {points.map((p, idx) => {
              const show = shouldShowDateLabel(idx, activeData.length);
              const isHovered = hoveredIndex === idx;

              if (!show && !isHovered) return null;

              return (
                <span
                  key={`xlabel-${idx}`}
                  style={{
                    left: `${((p.x - padLeft) / chartWidth) * 100}%`,
                  }}
                  className={`absolute -translate-x-1/2 font-mono whitespace-nowrap transition-colors select-none text-[9.5px] sm:text-[10px] ${
                    isHovered
                      ? 'text-[#5B5BF7] dark:text-indigo-300 font-semibold scale-110 z-10'
                      : 'text-slate-400 dark:text-slate-500 font-normal'
                  }`}
                >
                  {/* On small mobile screens, show day number for dense sets; on sm screens show full date */}
                  <span className="hidden sm:inline">{p.d.date}</span>
                  <span className="sm:hidden">
                    {activeData.length > 10 ? p.d.date.split(' ')[0] : p.d.date}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
